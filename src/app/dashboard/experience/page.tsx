"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, Building2, Calendar, MapPin, Star, Briefcase, Users, TrendingUp, Award, Eye, X, User, Globe, DollarSign, Clock, Code, Target, CheckCircle } from 'lucide-react';
import ExperienceForm from '@/components/dashboard/ExperienceForm';
import DraftViewer from '@/components/shared/DraftViewer';
import { IWorkExperience, ExperienceApiResponse, ExperienceListApiResponse } from '@/types/experience';

// Work Experience Details Modal Component
function WorkExperienceDetailsModal({ 
  experience, 
  onClose 
}: { 
  experience: IWorkExperience; 
  onClose: () => void; 
}) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const getDateRange = () => {
    const start = formatDate(experience.startDate.toString());
    const end = experience.isCurrent ? 'Present' : (experience.endDate ? formatDate(experience.endDate.toString()) : 'Present');
    return `${start} - ${end}`;
  };

  const getDuration = () => {
    const startDate = new Date(experience.startDate);
    const endDate = experience.isCurrent ? new Date() : (experience.endDate ? new Date(experience.endDate) : new Date());
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ${diffMonths > 0 ? `${diffMonths} month${diffMonths > 1 ? 's' : ''}` : ''}`;
    } else {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    }
  };

  const getDisplayTitle = () => {
    // Try new structure first (level + jobTitle)
    if (experience.jobTitle) {
      return experience.level ? `${experience.level} ${experience.jobTitle}` : experience.jobTitle;
    }
    // Fallback to old structure (position)
    if (experience.position) {
      return experience.position;
    }
    // Final fallback to title
    return experience.title;
  };

  const title = getDisplayTitle();
  const company = experience.company || experience.organization;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-gray-600">{company}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Building2 className="text-gray-600" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium text-gray-900">{company}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="text-gray-600" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="font-medium text-gray-900">{title}</p>
                  {experience.level && (
                    <p className="text-sm text-gray-500">Level: {experience.level}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="text-gray-600" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{experience.location}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="text-gray-600" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{getDateRange()}</p>
                  <p className="text-sm text-gray-500">({getDuration()})</p>
                </div>
              </div>
              
              {experience.employmentType && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="text-gray-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Employment Type</p>
                    <p className="font-medium text-gray-900 capitalize">{experience.employmentType.replace('-', ' ')}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Star className="text-gray-600" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      experience.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {experience.status}
                    </span>
                    {experience.featured && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                    {experience.isCurrent && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {experience.website && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Globe className="text-gray-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Company Website</p>
                    <a 
                      href={experience.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-800 underline"
                    >
                      {experience.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase size={20} />
              Job Description
            </h3>
            <DraftViewer 
              content={experience.description || ''} 
              className="text-gray-700 leading-relaxed"
            />
          </div>

          {/* Technologies */}
          {experience.technologies && experience.technologies.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Code size={20} className="text-blue-600" />
                Technologies & Tools
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {experience.technologies.map((tech, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                    <Code size={16} className="text-blue-600" />
                    <span className="text-gray-800 text-sm">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responsibilities */}
          {experience.responsibilities && experience.responsibilities.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target size={20} className="text-green-600" />
                Key Responsibilities
              </h3>
              <div className="space-y-2">
                {experience.responsibilities.map((responsibility, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-800 text-sm">{responsibility}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {experience.achievements && experience.achievements.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award size={20} className="text-yellow-600" />
                Key Achievements
              </h3>
              <div className="space-y-2">
                {experience.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border">
                    <Award size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-800 text-sm">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Company Information */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building2 size={20} className="text-purple-600" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Company Name</p>
                <p className="font-medium text-gray-900">{company}</p>
              </div>
              {experience.companySize && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Company Size</p>
                  <p className="font-medium text-gray-900">{experience.companySize}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">Employment Type</p>
                <p className="font-medium text-gray-900 capitalize">{experience.employmentType?.replace('-', ' ') || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Location</p>
                <p className="font-medium text-gray-900">{experience.location}</p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Metadata</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Order</p>
                <p className="font-medium">{experience.order}</p>
              </div>
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium capitalize">{experience.type}</p>
              </div>
              <div>
                <p className="text-gray-500">ID</p>
                <p className="font-mono text-xs text-gray-600">{experience._id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkExperienceCard({ 
  experience,
  onEdit,
  onDelete,
  onView 
}: {
  experience: IWorkExperience;
  onEdit: (exp: IWorkExperience) => void;
  onDelete: (id: string) => void;
  onView: (exp: IWorkExperience) => void;
}) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short',
      year: 'numeric' 
    });
  };

  const getDateRange = () => {
    const start = formatDate(experience.startDate);
    const end = experience.isCurrent ? 'Present' : (experience.endDate ? formatDate(experience.endDate) : 'Present');
    return `${start} - ${end}`;
  };

  const getDisplayTitle = () => {
    if (experience.jobTitle) {
      return experience.level ? `${experience.level} ${experience.jobTitle}` : experience.jobTitle;
    }
    if (experience.position) {
      return experience.position;
    }
    return experience.title;
  };

  const title = getDisplayTitle();
  const subtitle = experience.company || experience.organization;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex gap-4 flex-1">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Building2 size={24} className="text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-800 truncate">{title}</h3>
              {experience.featured && (
                <Star size={16} className="text-yellow-500 fill-current flex-shrink-0 mt-0.5" />
              )}
              <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                experience.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {experience.status}
              </span>
            </div>
            <p className="text-gray-600 font-medium mb-1">{subtitle}</p>
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{getDateRange()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{experience.location}</span>
              </div>
              {experience.employmentType && (
                <span className="capitalize">{experience.employmentType.replace('-', ' ')}</span>
              )}
            </div>
            <div className="mt-3">
              <DraftViewer 
                content={experience.description || ''} 
                className="text-gray-600 text-sm line-clamp-2"
              />
            </div>
            
            {/* Technologies */}
            {experience.technologies && experience.technologies.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {experience.technologies.slice(0, 3).map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {experience.technologies.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{experience.technologies.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          <button 
            onClick={() => onView(experience)}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => onEdit(experience)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button 
            onClick={() => experience._id && onDelete(experience._id)}
            disabled={!experience._id}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<IWorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<IWorkExperience | null>(null);
  const [viewingExperience, setViewingExperience] = useState<IWorkExperience | null>(null);

  const fetchWorkExperiences = async () => {
    try {
      const response = await fetch('/api/experience/work?status=all');
      const result: ExperienceListApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch experiences');
      }

      setExperiences(result.data?.experiences as IWorkExperience[] || []);
    } catch (err) {
      console.error('Error fetching work experiences:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch experiences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkExperiences();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) {
      return;
    }

    try {
      const response = await fetch(`/api/experience/work/${id}`, {
        method: 'DELETE',
      });

      const result: ExperienceApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete experience');
      }

      // Remove the deleted experience from state
      setExperiences(prev => prev.filter(exp => exp._id !== id));
    } catch (err) {
      console.error('Error deleting experience:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete experience');
    }
  };

  const handleEdit = (experience: IWorkExperience) => {
    setSelectedExperience(experience);
    setShowForm(true);
  };

  const handleView = (experience: IWorkExperience) => {
    setViewingExperience(experience);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedExperience(null);
    fetchWorkExperiences(); // Refresh the list
  };

  const handleCloseView = () => {
    setViewingExperience(null);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Work Experience</h1>
        <button
          onClick={() => {
            setSelectedExperience(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} />
          Add Experience
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ExperienceForm
              type="work"
              mode={selectedExperience ? 'edit' : 'create'}
              initialData={selectedExperience || undefined}
              onClose={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingExperience && (
        <WorkExperienceDetailsModal
          experience={viewingExperience}
          onClose={handleCloseView}
        />
      )}

      {/* Content */}
      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">{error}</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Experiences</p>
                  <p className="text-2xl font-bold text-gray-900">{experiences.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {experiences.filter(exp => exp.status === 'published').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="text-yellow-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {experiences.filter(exp => exp.featured).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Role</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {experiences.filter(exp => exp.isCurrent).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Work Experience List */}
          {experiences.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No work experiences found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first work experience.</p>
              <button
                onClick={() => {
                  setSelectedExperience(null);
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusCircle size={20} />
                Add Experience
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {experiences.map((experience) => (
                <WorkExperienceCard
                  key={experience._id}
                  experience={experience}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 