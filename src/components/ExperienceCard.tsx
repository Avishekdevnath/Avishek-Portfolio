"use client";

import React, { useMemo, useState } from 'react';
import { 
  FaBriefcase, 
  FaGraduationCap, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaStar,
  FaAward,
  FaBook,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaBuilding,
  FaCode
} from 'react-icons/fa';
import { IWorkExperience, IEducation, DraftContent } from '@/types/experience';
import RichTextViewer from '@/components/shared/RichTextViewer';

interface ExperienceCardProps {
  experience: IWorkExperience | IEducation;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function ExperienceCardComponent({ 
  experience, 
  variant = 'default',
  showActions = false,
  onEdit,
  onDelete
}: ExperienceCardProps) {
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [isAchOpen, setIsAchOpen] = useState(false);
  if (!experience) {
    console.error('ExperienceCard: experience is undefined');
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-red-200">
        <p className="text-red-500">Error: Experience data is missing</p>
      </div>
    );
  }

  const isWorkExperience = experience.type === 'work';
  const Icon = isWorkExperience ? FaBriefcase : FaGraduationCap;

  const formatDate = (date: string | Date | undefined | null) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const draftToHtml = (content: DraftContent): string => {
    try {
      const blocks = content.blocks || [];
      let html = '';
      let inUL = false;
      let inOL = false;
      const closeLists = () => {
        if (inUL) { html += '</ul>'; inUL = false; }
        if (inOL) { html += '</ol>'; inOL = false; }
      };
      for (const block of blocks) {
        const text = (block.text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        switch (block.type) {
          case 'unordered-list-item':
            if (!inUL) { closeLists(); html += '<ul>'; inUL = true; }
            html += `<li>${text}</li>`;
            break;
          case 'ordered-list-item':
            if (!inOL) { closeLists(); html += '<ol>'; inOL = true; }
            html += `<li>${text}</li>`;
            break;
          case 'header-one':
            closeLists(); html += `<h1>${text}</h1>`; break;
          case 'header-two':
            closeLists(); html += `<h2>${text}</h2>`; break;
          case 'header-three':
            closeLists(); html += `<h3>${text}</h3>`; break;
          case 'blockquote':
            closeLists(); html += `<blockquote>${text}</blockquote>`; break;
          case 'code-block':
            closeLists(); html += `<pre><code>${text}</code></pre>`; break;
          default:
            closeLists(); html += `<p>${text}</p>`; break;
        }
      }
      closeLists();
      return html;
    } catch {
      return '';
    }
  };

  const renderDescription = (desc: string | DraftContent) => {
    if (typeof desc === 'string') {
      const trimmed = desc.trim();
      // Handle stringified Draft.js content
      if (trimmed.startsWith('{') && trimmed.includes('"blocks"')) {
        try {
          const parsed = JSON.parse(trimmed) as DraftContent;
          const html = draftToHtml(parsed);
          return <RichTextViewer html={html} className="prose-compact text-body-sm text-gray-700 font-ui rte-body-sm" />;
        } catch {
          // fall through to plain text
        }
      }
      return <p className="prose-compact text-body-sm text-gray-700 font-ui rte-body-sm">{desc}</p>;
    }
    const html = draftToHtml(desc);
    return <RichTextViewer html={html} className="prose-compact text-body-sm text-gray-700 font-ui rte-body-sm" />;
  };

  if (isWorkExperience) {
    // Work Experience Card
    const workExp = experience as IWorkExperience;
    const workId = useMemo(() => String(workExp._id ?? `${workExp.company}-${workExp.startDate}`), [workExp._id, workExp.company, workExp.startDate]);
    return (
      <article className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 ${variant === 'compact' ? 'p-4' : 'p-6'}`}>
        {/* Header Section */}
        <div className={`flex items-start justify-between`}>
          <div className={`flex items-start space-x-4`}>
            <div className="p-2 rounded-xl icon-work-bg">
              <Icon className="icon-lg icon-work" />
            </div>
            <div>
              <div className={`flex items-center gap-2`}>
                <h3 className="text-h4 weight-bold text-gray-900 line-clamp-2">
                  {workExp.jobTitle || workExp.title}
                </h3>
                {workExp.featured && (
                  <FaStar className="text-yellow-400" title="Featured" />
                )}
              </div>
              <div className={`flex items-center gap-2 mt-1`}>
                <FaBuilding className="text-gray-400 icon-sm" />
                <p className="text-gray-700 text-body-sm font-medium line-clamp-1">{workExp.company}</p>
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(workId)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(workId)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {/* Meta Information */}
        <div className={`mt-4 flex flex-wrap gap-2`}>
          <div className="chip" aria-label={`Location ${String(workExp.location)}`}>
            <FaMapMarkerAlt className="icon-sm text-gray-400" />
            <span className="text-small">{workExp.location}</span>
          </div>
          <div className="chip" aria-label="Duration">
            <FaCalendarAlt className="icon-sm text-gray-400" />
            <span className="text-small">{formatDate(workExp.startDate)} – {workExp.isCurrent ? 'Present' : formatDate(workExp.endDate)}</span>
          </div>
          {workExp.employmentType && (
            <div className="chip" aria-label={`Employment ${String(workExp.employmentType)}`}>
              <FaBriefcase className="icon-sm text-gray-400" />
              <span className="text-small capitalize">{workExp.employmentType}</span>
            </div>
          )}
        </div>

        {/* Technologies */}
        {workExp.technologies && workExp.technologies.length > 0 && (
          <div className="mt-3">
            <div className={`flex items-center gap-2 mb-2`}>
              <FaCode className="icon-sm icon-work" />
              <h4 className="text-body-sm weight-medium text-gray-700">Tech</h4>
            </div>
            <div className={`flex flex-wrap gap-1.5`}>
              {workExp.technologies.slice(0, 8).map((tech, index) => (
                <span 
                  key={index}
                  className="chip-muted"
                >
                  {tech}
                </span>
              ))}
              {workExp.technologies.length > 8 && (
                <span className="chip-muted">+{workExp.technologies.length - 8}</span>
              )}
            </div>
          </div>
        )}

        {/* Description */}
          <div className={`mt-4`}>
          <button
            className="btn-cta"
            aria-expanded={isDescOpen}
            aria-controls={`desc-${workId}`}
            onClick={() => setIsDescOpen(v => !v)}
          >
            {isDescOpen ? 'Hide description' : 'Show description'}
          </button>
          {isDescOpen && (
            <div id={`desc-${workId}`} className="mt-3">
              {renderDescription(workExp.description)}
            </div>
          )}
        </div>

        {/* Key Achievements */}
        {workExp.achievements && workExp.achievements.length > 0 && (
          <div className={`mt-4`}>
            <button
              className="btn-cta"
              aria-expanded={isAchOpen}
              aria-controls={`ach-${workId}`}
              onClick={() => setIsAchOpen(v => !v)}
            >
              {isAchOpen ? 'Hide achievements' : `Show achievements (${workExp.achievements.length})`}
            </button>
            {isAchOpen && (
              <div id={`ach-${workId}`} className="mt-3 grid gap-2">
                {workExp.achievements.map((achievement, index) => (
                  <div key={index} className={`flex items-start gap-2 bg-blue-50 p-2.5 rounded-lg`}>
                    <FaCheckCircle className="icon-sm icon-work mt-0.5" />
                    <p className="text-gray-700 text-body-sm">{achievement}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Responsibilities */}
        {workExp.responsibilities && workExp.responsibilities.length > 0 && (
          <div className="mt-6">
            <div className={`flex items-center gap-2 mb-3`}>
              <FaBriefcase className="icon-sm icon-work" />
              <h4 className="text-body-sm weight-semibold text-gray-800">Key Responsibilities</h4>
            </div>
            <ul className="list-none space-y-1.5">
              {workExp.responsibilities.map((responsibility, index) => (
                <li key={index} className={`flex items-start gap-3`}>
                  <FaCheckCircle className="icon-sm icon-work mt-1" />
                  <span className="text-gray-700 text-body-sm">{responsibility}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Website Link */}
        {workExp.website && (
          <div className={`mt-4`}>
            <a 
              href={String(workExp.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta"
              aria-label={`Visit ${workExp.company} website`}
            >
              <FaBuilding className="icon-sm" />
              <span>Visit website</span>
            </a>
          </div>
        )}
      </article>
    );
  } else {
    // Education Card
    const educationExp = experience as IEducation;
    return (
      <article className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 ${variant === 'compact' ? 'p-4' : 'p-6'}`}>
        <div className={`flex items-start justify-between`}>
          <div className={`flex items-start space-x-4`}>
            <div className="p-2 rounded-lg icon-edu-bg">
              <Icon className="icon-lg icon-edu" />
            </div>
            <div>
              <h3 className="text-h4 weight-semibold text-gray-900 line-clamp-2">
                {educationExp.degree}
                {educationExp.featured && (
                  <FaStar className="inline-block ml-2 text-yellow-400" title="Featured" />
                )}
              </h3>
              <p className="text-gray-700 text-body-sm line-clamp-1">{educationExp.institution}</p>
            </div>
          </div>

          {showActions && (
            <div className="flex space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(String(educationExp._id ?? `${educationExp.institution}-${educationExp.startDate}`))}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(String(educationExp._id ?? `${educationExp.institution}-${educationExp.startDate}`))}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {/* Field of Study */}
          <div className={`flex items-center text-gray-700`}>
            <FaBook className="icon-sm icon-edu mr-2" />
            <span className="text-body-sm weight-medium">{educationExp.fieldOfStudy}</span>
          </div>

          {/* Location */}
          <div className={`flex items-center text-gray-600`}>
            <FaMapMarkerAlt className="icon-sm icon-edu mr-2" />
            <span className="text-body-sm">{educationExp.location}</span>
          </div>

          {/* Duration */}
          <div className={`flex items-center text-gray-600`}>
            <FaCalendarAlt className="icon-sm icon-edu mr-2" />
            <span className="text-body-sm">
              {formatDate(educationExp.startDate)} – {educationExp.isCurrent ? 'Present' : formatDate(educationExp.endDate)}
            </span>
          </div>

          {/* Description */}
          <div className="mt-3">
            <details>
              <summary className="btn-cta cursor-pointer select-none">Description</summary>
              <div className="mt-2">
                {renderDescription(educationExp.description)}
              </div>
            </details>
          </div>

          {/* Thesis if available */}
          {variant !== 'compact' && educationExp.thesis && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <FaChalkboardTeacher className="icon-sm icon-edu mr-2" />
                <span className="font-medium text-green-800">Thesis</span>
              </div>
              <h4 className="text-gray-800 font-medium mb-1">{educationExp.thesis.title}</h4>
              <p className="text-gray-600 text-sm">
                Supervisor: {educationExp.thesis.supervisor}
              </p>
              {typeof educationExp.thesis.description === 'string' ? (
                <p className="text-gray-600 mt-2">{educationExp.thesis.description}</p>
              ) : (
                <div className="mt-2">
                  {renderDescription(educationExp.thesis.description)}
                </div>
              )}
            </div>
          )}

          {/* Achievements and Activities */}
          {variant !== 'compact' && (educationExp.honors.length > 0 || educationExp.activities.length > 0) && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {educationExp.honors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800 flex items-center">
                    <FaAward className="icon-sm icon-edu mr-2" />
                    Honors & Awards
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {educationExp.honors.map((honor, index) => (
                      <li key={index}>{honor}</li>
                    ))}
                  </ul>
                </div>
              )}
              {educationExp.activities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800 flex items-center">
                    <FaBook className="icon-sm icon-edu mr-2" />
                    Activities
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 text-sm">
                    {educationExp.activities.map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    );
  }
}

const ExperienceCard = React.memo(ExperienceCardComponent);
export default ExperienceCard;