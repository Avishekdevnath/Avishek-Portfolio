import React from 'react';
import { 
  FaBriefcase, 
  FaGraduationCap, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock,
  FaExternalLinkAlt,
  FaStar
} from 'react-icons/fa';

interface ExperienceCardProps {
  experience: {
    _id: string;
    type: 'work' | 'education';
    title: string;
    organization: string;
    location: string;
    startDate: string | Date;
    endDate?: string | Date;
    isCurrent: boolean;
    description: string;
    featured: boolean;
    // Work-specific fields (support both old and new structure)
    jobTitle?: string;  // New field
    level?: string;     // New field
    position?: string;  // Old field for backward compatibility
    company?: string;
    employmentType?: string;
    technologies?: string[];
    achievements?: string[];
    responsibilities?: string[];
    website?: string;
    // Education-specific fields
    degree?: string;
    institution?: string;
    fieldOfStudy?: string;
    gpa?: number;
    maxGpa?: number;
    activities?: string[];
    honors?: string[];
    coursework?: string[];
  };
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
  // CRITICAL FIX: Handle undefined experience first
  if (!experience) {
    console.error('ExperienceCard: experience is undefined');
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">⚠️ Experience data is missing</p>
      </div>
    );
  }

  // Comprehensive safety check with detailed logging
  if (!experience._id || !experience.type) {
    console.error('ExperienceCard: Missing required fields (_id, type):', experience);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: Experience data not provided</p>
      </div>
    );
  }

  // Log the experience object for debugging
  console.log('ExperienceCard received experience:', experience);

  const formatDate = (date: string | Date) => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        console.warn('Invalid date:', date);
        return 'Invalid Date';
      }
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date Error';
    }
  };

  const getDateRange = () => {
    const start = formatDate(experience.startDate);
    const end = experience.isCurrent ? 'Present' : (experience.endDate ? formatDate(experience.endDate) : 'Present');
    return `${start} - ${end}`;
  };

  const isWork = experience.type === 'work';
  
  // Handle both new and old data structures with comprehensive fallbacks
  const getDisplayTitle = () => {
    if (isWork) {
      // Priority order: 1. level + jobTitle, 2. jobTitle, 3. position, 4. title
      if (experience.jobTitle) {
        const displayTitle = experience.level 
          ? `${experience.level} ${experience.jobTitle}` 
          : experience.jobTitle;
        return displayTitle;
      }
      
      if (experience.position) {
        return experience.position;
      }
      
      if (experience.title) {
        return experience.title;
      }
      
      return 'Work Experience';
    } else {
      // For education: degree > title
      if (experience.degree) {
        return experience.degree;
      }
      
      if (experience.title) {
        return experience.title;
      }
      
      return 'Education';
    }
  };

  const displayTitle = getDisplayTitle();
  const subtitle = isWork 
    ? (experience.company || experience.organization || 'Company') 
    : (experience.institution || experience.organization || 'Institution');

  console.log('Final display values:', { displayTitle, subtitle, isWork });

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isWork ? 'bg-blue-50' : 'bg-purple-50'}`}>
            {isWork ? (
              <FaBriefcase className={`text-lg ${isWork ? 'text-blue-600' : 'text-purple-600'}`} />
            ) : (
              <FaGraduationCap className={`text-lg ${isWork ? 'text-blue-600' : 'text-purple-600'}`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm truncate">
                  {displayTitle}
                  {experience.featured && (
                    <FaStar className="inline-block ml-1 text-yellow-500 text-xs" />
                  )}
                </h4>
                <p className="text-gray-600 text-sm truncate">{subtitle}</p>
                {/* Show field of study for education entries */}
                {!isWork && experience.fieldOfStudy && (
                  <p className="text-gray-500 text-xs italic truncate">{experience.fieldOfStudy}</p>
                )}
                <p className="text-gray-500 text-xs">{getDateRange()}</p>
              </div>
              {showActions && (
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => onEdit?.(experience._id)}
                    className="text-blue-600 hover:text-blue-800 text-xs p-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete?.(experience._id)}
                    className="text-red-600 hover:text-red-800 text-xs p-1"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 ${variant === 'detailed' ? 'transform hover:-translate-y-1' : ''}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isWork ? 'bg-blue-50' : 'bg-purple-50'}`}>
              {isWork ? (
                <FaBriefcase className={`text-2xl ${isWork ? 'text-blue-600' : 'text-purple-600'}`} />
              ) : (
                <FaGraduationCap className={`text-2xl ${isWork ? 'text-blue-600' : 'text-purple-600'}`} />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {displayTitle}
                {experience.featured && (
                  <FaStar className="inline-block ml-2 text-yellow-500" />
                )}
              </h3>
              <p className="text-gray-700 font-medium mb-2">{subtitle}</p>
              {/* Show field of study for education entries */}
              {!isWork && experience.fieldOfStudy && (
                <p className="text-gray-600 text-sm mb-2 italic">{experience.fieldOfStudy}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <FaCalendarAlt />
                  <span>{getDateRange()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaMapMarkerAlt />
                  <span>{experience.location || 'Location not specified'}</span>
                </div>
                {isWork && experience.employmentType && (
                  <div className="flex items-center gap-1">
                    <FaClock />
                    <span className="capitalize">{experience.employmentType.replace('-', ' ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit?.(experience._id)}
                className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(experience._id)}
                className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="text-gray-600 mb-4 leading-relaxed prose prose-sm max-w-none">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: experience.description || 'No description provided' 
            }} 
          />
        </div>

        {/* Additional Details */}
        {variant === 'detailed' && (
          <>
            {/* Work-specific details */}
            {isWork && (
              <>
                {experience.technologies && experience.technologies.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {experience.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {experience.achievements && experience.achievements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Achievements</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {experience.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Education-specific details */}
            {!isWork && (
              <>
                {experience.fieldOfStudy && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Field of Study</h4>
                    <p className="text-sm text-gray-600">{experience.fieldOfStudy}</p>
                  </div>
                )}
                
                {experience.gpa && experience.maxGpa && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">GPA</h4>
                    <p className="text-sm text-gray-600">{experience.gpa} / {experience.maxGpa}</p>
                  </div>
                )}
                
                {experience.honors && experience.honors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Honors & Awards</h4>
                    <div className="flex flex-wrap gap-2">
                      {experience.honors.map((honor, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                        >
                          {honor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Website link for work experience */}
        {isWork && experience.website && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <a
              href={experience.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <span>Visit Company Website</span>
              <FaExternalLinkAlt className="text-xs" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 