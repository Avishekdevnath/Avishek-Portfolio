"use client";

import React from 'react';
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
import { IWorkExperience, IEducation } from '@/types/experience';

interface ExperienceCardProps {
  experience: IWorkExperience | IEducation;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function ExperienceCard({ 
  experience, 
  variant = 'default',
  showActions = false,
  onEdit,
  onDelete 
}: ExperienceCardProps) {
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

  if (isWorkExperience) {
    // Work Experience Card
    const workExp = experience as IWorkExperience;
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 ${variant === 'compact' ? 'p-4' : 'p-6'}`}>
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {workExp.title}
                </h3>
                {workExp.featured && (
                  <FaStar className="text-yellow-400" title="Featured" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <FaBuilding className="text-gray-400 w-4 h-4" />
                <p className="text-gray-600 font-medium">{workExp.company}</p>
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(workExp._id)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(workExp._id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {/* Meta Information */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
            <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
            <span>{workExp.location}</span>
          </div>
          <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
            <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              {formatDate(workExp.startDate)} - {workExp.isCurrent ? 'Present' : formatDate(workExp.endDate)}
            </span>
          </div>
          {workExp.employmentType && (
            <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              <FaBriefcase className="w-4 h-4 mr-2 text-gray-400" />
              <span>{workExp.employmentType}</span>
            </div>
          )}
        </div>

        {/* Technologies */}
        {workExp.technologies && workExp.technologies.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <FaCode className="text-blue-500" />
              <h4 className="font-medium text-gray-700">Technologies</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {workExp.technologies.map((tech, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {variant !== 'compact' && (
          <div className="mt-4 text-gray-700 prose-sm">
            <div className="prose-sm">{typeof workExp.description === 'string' ? workExp.description : JSON.stringify(workExp.description)}</div>
          </div>
        )}

        {/* Key Achievements */}
        {variant !== 'compact' && workExp.achievements && workExp.achievements.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <FaAward className="text-blue-500" />
              <h4 className="font-semibold text-gray-800">Key Achievements</h4>
            </div>
            <div className="grid gap-3">
              {workExp.achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg">
                  <FaCheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <p className="text-gray-700">{achievement}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Responsibilities */}
        {variant !== 'compact' && workExp.responsibilities && workExp.responsibilities.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <FaBriefcase className="text-blue-500" />
              <h4 className="font-semibold text-gray-800">Key Responsibilities</h4>
            </div>
            <ul className="list-none space-y-2">
              {workExp.responsibilities.map((responsibility, index) => (
                <li key={index} className="flex items-start gap-3">
                  <FaCheckCircle className="w-4 h-4 text-blue-400 mt-1" />
                  <span className="text-gray-600">{responsibility}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Website Link */}
        {workExp.website && (
          <div className="mt-4">
            <a 
              href={workExp.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FaBuilding className="w-4 h-4" />
              <span>Visit Company Website</span>
            </a>
          </div>
        )}
      </div>
    );
  } else {
    // Education Card
    const educationExp = experience as IEducation;
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 ${variant === 'compact' ? 'p-4' : 'p-6'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {educationExp.degree}
                {educationExp.featured && (
                  <FaStar className="inline-block ml-2 text-yellow-400" title="Featured" />
                )}
              </h3>
              <p className="text-gray-600">{educationExp.institution}</p>
            </div>
          </div>

          {showActions && (
            <div className="flex space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(educationExp._id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(educationExp._id)}
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
          <div className="flex items-center text-gray-700">
            <FaBook className="w-4 h-4 mr-2 text-green-600" />
            <span className="font-medium">{educationExp.fieldOfStudy}</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600">
            <FaMapMarkerAlt className="w-4 h-4 mr-2 text-green-600" />
            <span>{educationExp.location}</span>
          </div>

          {/* Duration */}
          <div className="flex items-center text-gray-600">
            <FaCalendarAlt className="w-4 h-4 mr-2 text-green-600" />
            <span>
              {formatDate(educationExp.startDate)} - {educationExp.isCurrent ? 'Present' : formatDate(educationExp.endDate)}
            </span>
          </div>

          {/* Description */}
          {variant !== 'compact' && (
            <div className="mt-4 text-gray-700">
              <div className="prose-sm">{typeof educationExp.description === 'string' ? educationExp.description : JSON.stringify(educationExp.description)}</div>
            </div>
          )}

          {/* Thesis if available */}
          {variant !== 'compact' && educationExp.thesis && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <FaChalkboardTeacher className="w-4 h-4 mr-2 text-green-600" />
                <span className="font-medium text-green-800">Thesis</span>
              </div>
              <h4 className="text-gray-800 font-medium mb-1">{educationExp.thesis.title}</h4>
              <p className="text-gray-600 text-sm">
                Supervisor: {educationExp.thesis.supervisor}
              </p>
              {typeof educationExp.thesis.description === 'string' ? (
                <p className="text-gray-600 mt-2">{educationExp.thesis.description}</p>
              ) : (
                <div className="prose-sm mt-2">{typeof educationExp.thesis.description === 'string' ? educationExp.thesis.description : JSON.stringify(educationExp.thesis.description)}</div>
              )}
            </div>
          )}

          {/* Achievements and Activities */}
          {variant !== 'compact' && (educationExp.honors.length > 0 || educationExp.activities.length > 0) && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {educationExp.honors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800 flex items-center">
                    <FaAward className="w-4 h-4 mr-2 text-green-600" />
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
                    <FaBook className="w-4 h-4 mr-2 text-green-600" />
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
      </div>
    );
  }
} 