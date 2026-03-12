"use client";

import React, { useMemo, useState } from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaCode, FaCheckCircle, FaExternalLinkAlt, FaChalkboardTeacher } from 'react-icons/fa';
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
    return (
      <div className="bg-off-white border border-cream-deeper rounded-[0.9rem] p-6">
        <p className="font-body text-[0.83rem] text-accent-orange">Error: Experience data is missing</p>
      </div>
    );
  }

  const isWork = experience.type === 'work';

  const formatDate = (date: string | Date | undefined | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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
            html += `<li>${text}</li>`; break;
          case 'ordered-list-item':
            if (!inOL) { closeLists(); html += '<ol>'; inOL = true; }
            html += `<li>${text}</li>`; break;
          case 'header-one': closeLists(); html += `<h1>${text}</h1>`; break;
          case 'header-two': closeLists(); html += `<h2>${text}</h2>`; break;
          case 'header-three': closeLists(); html += `<h3>${text}</h3>`; break;
          case 'blockquote': closeLists(); html += `<blockquote>${text}</blockquote>`; break;
          case 'code-block': closeLists(); html += `<pre><code>${text}</code></pre>`; break;
          default: closeLists(); html += `<p>${text}</p>`; break;
        }
      }
      closeLists();
      return html;
    } catch { return ''; }
  };

  const hasDescriptionContent = (desc: string | DraftContent | undefined | null): boolean => {
    if (!desc) return false;
    if (typeof desc === 'string') {
      const trimmed = desc.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith('{') && trimmed.includes('"blocks"')) {
        try {
          const parsed = JSON.parse(trimmed) as DraftContent;
          return (parsed.blocks || []).some(b => b.text?.trim());
        } catch { return true; }
      }
      return true;
    }
    return (desc.blocks || []).some(b => b.text?.trim());
  };

  const renderDescription = (desc: string | DraftContent) => {
    if (typeof desc === 'string') {
      const trimmed = desc.trim();
      if (trimmed.startsWith('{') && trimmed.includes('"blocks"')) {
        try {
          const parsed = JSON.parse(trimmed) as DraftContent;
          return <RichTextViewer html={draftToHtml(parsed)} className="font-body text-[0.83rem] text-text-muted leading-[1.7]" />;
        } catch { /* fall through */ }
      }
      return <p className="font-body text-[0.83rem] text-text-muted leading-[1.7]">{desc}</p>;
    }
    return <RichTextViewer html={draftToHtml(desc)} className="font-body text-[0.83rem] text-text-muted leading-[1.7]" />;
  };

  // ── Chip component ──────────────────────────────────────────────────────────
  const Chip = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] tracking-[0.06em] uppercase text-warm-brown bg-cream border border-cream-deeper rounded-md px-2.5 py-1">
      {icon}
      {label}
    </span>
  );

  // ── WORK CARD ───────────────────────────────────────────────────────────────
  if (isWork) {
    const workExp = experience as IWorkExperience;
    const workId = useMemo(
      () => String(workExp._id ?? `${workExp.company}-${workExp.startDate}`),
      [workExp._id, workExp.company, workExp.startDate]
    );

    const dateRange = `${formatDate(workExp.startDate)} – ${workExp.isCurrent ? 'Present' : formatDate(workExp.endDate)}`;
    const title = workExp.level && workExp.jobTitle
      ? `${workExp.level} ${workExp.jobTitle}`
      : workExp.jobTitle || workExp.title;

    return (
      <article className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-6 py-6 overflow-hidden hover:border-sand hover:shadow-md transition-all duration-300">
        {/* Left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-orange rounded-l-[0.9rem]" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-[1.15rem] font-semibold text-ink leading-snug mb-1">
              {title}
              {workExp.featured && (
                <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-accent-orange align-middle" title="Featured" />
              )}
            </h3>
            <p className="font-mono text-[0.7rem] tracking-[0.08em] uppercase text-warm-brown">
              {workExp.company}
            </p>
          </div>

          {showActions && (
            <div className="flex gap-2 shrink-0">
              {onEdit && (
                <button onClick={() => onEdit(workId)} className="font-mono text-[0.62rem] tracking-[0.06em] uppercase text-accent-blue hover:text-ink transition-colors">Edit</button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(workId)} className="font-mono text-[0.62rem] tracking-[0.06em] uppercase text-accent-orange hover:text-ink transition-colors">Delete</button>
              )}
            </div>
          )}
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {workExp.location && (
            <Chip icon={<FaMapMarkerAlt className="w-2.5 h-2.5" />} label={String(workExp.location)} />
          )}
          <Chip icon={<FaCalendarAlt className="w-2.5 h-2.5" />} label={dateRange} />
          {workExp.employmentType && (
            <Chip icon={null} label={workExp.employmentType} />
          )}
        </div>

        {/* Technologies */}
        {workExp.technologies && workExp.technologies.length > 0 && (
          <div className="mt-4">
            <p className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-text-muted mb-2 flex items-center gap-1.5">
              <FaCode className="w-2.5 h-2.5" />
              Stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {workExp.technologies.slice(0, 10).map((tech, i) => (
                <span key={i} className="font-mono text-[0.6rem] tracking-[0.05em] uppercase text-accent-orange bg-accent-orange/8 border border-accent-orange/20 rounded px-2 py-0.5">
                  {tech}
                </span>
              ))}
              {workExp.technologies.length > 10 && (
                <span className="font-mono text-[0.6rem] tracking-[0.05em] uppercase text-text-muted bg-cream border border-cream-deeper rounded px-2 py-0.5">
                  +{workExp.technologies.length - 10}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Description toggle */}
        {hasDescriptionContent(workExp.description) && (
          <div className="mt-4">
            <button
              onClick={() => setIsDescOpen(v => !v)}
              aria-expanded={isDescOpen}
              className="font-mono text-[0.62rem] tracking-[0.08em] uppercase text-accent-blue hover:text-ink transition-colors duration-200 flex items-center gap-1.5"
            >
              <span className={`inline-block transition-transform duration-200 ${isDescOpen ? 'rotate-90' : ''}`}>›</span>
              {isDescOpen ? 'Hide description' : 'Show description'}
            </button>
            {isDescOpen && (
              <div id={`desc-${workId}`} className="mt-3 pl-3 border-l-2 border-cream-deeper">
                {renderDescription(workExp.description)}
              </div>
            )}
          </div>
        )}

        {/* Achievements */}
        {workExp.achievements && workExp.achievements.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setIsAchOpen(v => !v)}
              aria-expanded={isAchOpen}
              className="font-mono text-[0.62rem] tracking-[0.08em] uppercase text-accent-teal hover:text-ink transition-colors duration-200 flex items-center gap-1.5"
            >
              <span className={`inline-block transition-transform duration-200 ${isAchOpen ? 'rotate-90' : ''}`}>›</span>
              {isAchOpen ? 'Hide achievements' : `Achievements (${workExp.achievements.length})`}
            </button>
            {isAchOpen && (
              <ul className="mt-3 space-y-2">
                {workExp.achievements.map((ach, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <FaCheckCircle className="w-3 h-3 text-accent-teal mt-0.5 shrink-0" />
                    <span className="font-body text-[0.83rem] text-text-muted leading-[1.65]">{ach}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Responsibilities */}
        {workExp.responsibilities && workExp.responsibilities.length > 0 && variant === 'detailed' && (
          <div className="mt-4">
            <p className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-text-muted mb-2">Responsibilities</p>
            <ul className="space-y-1.5">
              {workExp.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1 h-1 rounded-full bg-accent-orange mt-2 shrink-0" />
                  <span className="font-body text-[0.83rem] text-text-muted leading-[1.65]">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Website */}
        {workExp.website && (
          <a
            href={String(workExp.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 font-mono text-[0.62rem] tracking-[0.06em] uppercase text-text-muted hover:text-ink transition-colors duration-200"
          >
            <FaExternalLinkAlt className="w-2.5 h-2.5" />
            Visit website
          </a>
        )}
      </article>
    );
  }

  // ── EDUCATION CARD ──────────────────────────────────────────────────────────
  const eduExp = experience as IEducation;
  const eduId = String(eduExp._id ?? `${eduExp.institution}-${eduExp.startDate}`);
  const dateRange = `${formatDate(eduExp.startDate)} – ${eduExp.isCurrent ? 'Present' : formatDate(eduExp.endDate)}`;

  return (
    <article className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-6 py-6 overflow-hidden hover:border-sand hover:shadow-md transition-all duration-300">
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-teal rounded-l-[0.9rem]" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-[1.15rem] font-semibold text-ink leading-snug mb-1">
            {eduExp.degree}
            {eduExp.featured && (
              <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-accent-teal align-middle" title="Featured" />
            )}
          </h3>
          <p className="font-mono text-[0.7rem] tracking-[0.08em] uppercase text-warm-brown">
            {eduExp.institution}
          </p>
        </div>

        {showActions && (
          <div className="flex gap-2 shrink-0">
            {onEdit && (
              <button onClick={() => onEdit(eduId)} className="font-mono text-[0.62rem] tracking-[0.06em] uppercase text-accent-blue hover:text-ink transition-colors">Edit</button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(eduId)} className="font-mono text-[0.62rem] tracking-[0.06em] uppercase text-accent-orange hover:text-ink transition-colors">Delete</button>
            )}
          </div>
        )}
      </div>

      {/* Field of study */}
      {eduExp.fieldOfStudy && (
        <p className="font-body text-[0.83rem] text-text-muted mt-2">{eduExp.fieldOfStudy}</p>
      )}

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2 mt-4">
        {eduExp.location && (
          <Chip icon={<FaMapMarkerAlt className="w-2.5 h-2.5" />} label={String(eduExp.location)} />
        )}
        <Chip icon={<FaCalendarAlt className="w-2.5 h-2.5" />} label={dateRange} />
        {(eduExp as IEducation & { gpa?: string }).gpa && (
          <Chip icon={null} label={`GPA ${(eduExp as IEducation & { gpa?: string }).gpa}`} />
        )}
      </div>

      {/* Description */}
      {hasDescriptionContent(eduExp.description) && (
        <div className="mt-4">
          <button
            onClick={() => setIsDescOpen(v => !v)}
            aria-expanded={isDescOpen}
            className="font-mono text-[0.62rem] tracking-[0.08em] uppercase text-accent-blue hover:text-ink transition-colors duration-200 flex items-center gap-1.5"
          >
            <span className={`inline-block transition-transform duration-200 ${isDescOpen ? 'rotate-90' : ''}`}>›</span>
            {isDescOpen ? 'Hide description' : 'Show description'}
          </button>
          {isDescOpen && (
            <div className="mt-3 pl-3 border-l-2 border-cream-deeper">
              {renderDescription(eduExp.description)}
            </div>
          )}
        </div>
      )}

      {/* Thesis */}
      {variant !== 'compact' && eduExp.thesis?.title?.trim() && (
        <div className="mt-4 bg-cream border border-cream-deeper rounded-lg px-4 py-3">
          <p className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-accent-teal mb-2 flex items-center gap-1.5">
            <FaChalkboardTeacher className="w-2.5 h-2.5" />
            Thesis
          </p>
          <p className="font-body text-[0.86rem] text-ink font-medium leading-snug mb-1">{eduExp.thesis.title}</p>
          {eduExp.thesis.supervisor?.trim() && (
            <p className="font-mono text-[0.62rem] tracking-[0.05em] text-text-muted">
              Supervisor: {eduExp.thesis.supervisor}
            </p>
          )}
          {hasDescriptionContent(eduExp.thesis.description) && (
            <div className="mt-2">
              {typeof eduExp.thesis.description === 'string'
                ? <p className="font-body text-[0.83rem] text-text-muted leading-[1.65]">{eduExp.thesis.description}</p>
                : renderDescription(eduExp.thesis.description)
              }
            </div>
          )}
        </div>
      )}

      {/* Honors & Activities */}
      {variant !== 'compact' && (eduExp.honors?.length > 0 || eduExp.activities?.length > 0) && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {eduExp.honors?.length > 0 && (
            <div>
              <p className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-text-muted mb-2">Honors & Awards</p>
              <ul className="space-y-1">
                {eduExp.honors.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-accent-teal mt-2 shrink-0" />
                    <span className="font-body text-[0.83rem] text-text-muted">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {eduExp.activities?.length > 0 && (
            <div>
              <p className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-text-muted mb-2">Activities</p>
              <ul className="space-y-1">
                {eduExp.activities.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-accent-blue mt-2 shrink-0" />
                    <span className="font-body text-[0.83rem] text-text-muted">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

const ExperienceCard = React.memo(ExperienceCardComponent);
export default ExperienceCard;
