"use client";

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Star, 
  Plus, 
  Pencil, 
  Trash2,
  BookOpen,
  Award,
  School,
  Eye,
  X,
  User,
  Building,
  Clock,
  Trophy,
  Users,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Import the IEducation interface from the model
import type { IEducation, DraftContent } from '@/types/experience';

// Create a type that makes _id optional and converts Date to string
type Education = Omit<IEducation, '_id' | 'startDate' | 'endDate'> & {
  _id?: string;
  startDate: string;
  endDate?: string;
};

// Create a type for form state that makes _id optional
type FormEducation = Omit<Education, '_id'> & { _id?: string };

interface FormState {
  show: boolean;
  mode: 'create' | 'edit';
  data?: FormEducation;
}

import EducationForm from '@/components/dashboard/EducationForm';

// Helper function to safely render description
const renderDescription = (description: string | DraftContent): JSX.Element => {
  if (typeof description === 'string') {
    return <div>{description}</div>;
  }
  // If it's a DraftContent object, use DraftViewer
  return <div>{typeof description === 'string' ? description : JSON.stringify(description)}</div>;
};

// Education Details Modal Component
function EducationDetailsModal({ 
  education, 
  onClose 
}: { 
  education: Education; 
  onClose: () => void; 
}) {
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const getDateRange = () => {
    const start = formatDate(education.startDate);
    const end = education.isCurrent ? 'Present' : (education.endDate ? formatDate(education.endDate) : 'Present');
    return `${start} - ${end}`;
  };

  const getDuration = () => {
    const startDate = new Date(education.startDate);
    const endDate = education.isCurrent ? new Date() : (education.endDate ? new Date(education.endDate) : new Date());
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ${diffMonths > 0 ? `${diffMonths} month${diffMonths > 1 ? 's' : ''}` : ''}`;
    } else {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <GraduationCap className="text-purple-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{education.degree}</h2>
              <p className="text-gray-600">{education.institution}</p>
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
                <Building className="text-gray-600" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Institution</p>
                  <p className="font-medium text-gray-900">{education.institution}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <BookOpen className="text-gray-600" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Field of Study</p>
                  <p className="font-medium text-gray-900">{education.fieldOfStudy}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="text-gray-600" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{education.location}</p>
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
              
              {education.gpa && education.maxGpa && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Trophy className="text-gray-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">GPA</p>
                    <p className="font-medium text-gray-900">{education.gpa} / {education.maxGpa}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(education.gpa / education.maxGpa) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Star className="text-gray-600" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      education.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {education.status}
                    </span>
                    {education.featured && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                    {education.isCurrent && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={20} />
              Description
            </h3>
            <div className="text-gray-700 leading-relaxed">
              {renderDescription(education.description)}
            </div>
          </div>

          {/* Honors & Awards */}
          {education.honors && education.honors.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award size={20} className="text-yellow-600" />
                Honors & Awards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {education.honors.map((honor, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                    <Trophy size={16} className="text-yellow-600" />
                    <span className="text-gray-800">{honor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {education.activities && education.activities.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                Activities & Organizations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {education.activities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                    <Users size={16} className="text-blue-600" />
                    <span className="text-gray-800">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coursework */}
          {education.coursework && education.coursework.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen size={20} className="text-green-600" />
                Relevant Coursework
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {education.coursework.map((course, index) => (
                  <div key={index} className="p-2 bg-white rounded border text-gray-800 text-sm">
                    {course}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thesis */}
          {education.thesis && (education.thesis.title || education.thesis.description || education.thesis.supervisor) && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText size={20} className="text-purple-600" />
                Thesis/Research
              </h3>
              <div className="space-y-3">
                {education.thesis.title && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Title</p>
                    <p className="font-medium text-gray-900">{education.thesis.title}</p>
                  </div>
                )}
                {education.thesis.description && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <div className="text-gray-700">
                      {renderDescription(education.thesis.description)}
                    </div>
                  </div>
                )}
                {education.thesis.supervisor && (
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-purple-600" />
                    <span className="text-sm text-gray-500">Supervisor:</span>
                    <span className="font-medium text-gray-900">{education.thesis.supervisor}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Metadata</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Order</p>
                <p className="font-medium">{education.order}</p>
              </div>
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium capitalize">{education.type}</p>
              </div>
              <div>
                <p className="text-gray-500">ID</p>
                <p className="font-mono text-xs text-gray-600">{education._id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EducationCard({ 
  education,
  onEdit,
  onDelete,
  onView 
}: {
  education: Education;
  onEdit: (edu: Education) => void;
  onDelete: (id: string) => void;
  onView: (edu: Education) => void;
}) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getDateRange = () => {
    const start = formatDate(education.startDate);
    const end = education.isCurrent ? 'Present' : (education.endDate ? formatDate(education.endDate) : 'Present');
    return `${start} - ${end}`;
  };

  const title = education.degree || education.title;
  const subtitle = education.institution || education.organization;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex gap-4 flex-1">
          <div className="p-3 bg-purple-50 rounded-lg">
            <GraduationCap size={24} className="text-purple-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-800 truncate">{title}</h3>
              {education.featured && (
                <Star size={16} className="text-yellow-500 fill-current flex-shrink-0 mt-0.5" />
              )}
              <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                education.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {education.status}
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
                <span>{education.location}</span>
              </div>
              {education.fieldOfStudy && (
                <div className="flex items-center gap-1">
                  <BookOpen size={14} />
                  <span>{education.fieldOfStudy}</span>
                </div>
              )}
            </div>
            <div className="text-gray-600 text-sm line-clamp-2">
              {renderDescription(education.description)}
            </div>
            
            {/* GPA Display */}
            {education.gpa && education.maxGpa && (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-purple-500" />
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded font-medium">
                    GPA: {education.gpa} / {education.maxGpa}
                  </span>
                </div>
              </div>
            )}
            
            {/* Honors */}
            {education.honors && education.honors.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {education.honors.slice(0, 2).map((honor, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                    >
                      {honor}
                    </span>
                  ))}
                  {education.honors.length > 2 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      +{education.honors.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onView(education)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEdit(education)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Edit"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete(education._id!)}
            className="p-2 text-red-500 hover:text-red-700 transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EducationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [educationEntries, setEducationEntries] = useState<Education[]>([]);
  const [viewingEducation, setViewingEducation] = useState<Education | null>(null);
  const [showForm, setShowForm] = useState<{
    show: boolean;
    mode: 'create' | 'edit';
    data?: Omit<Education, '_id'> & { _id?: string };
  }>({
    show: false,
    mode: 'create'
  });

  const fetchEducation = async () => {
    try {
      setLoading(true);
      console.log('🎓 Fetching education data...');
      
      const response = await fetch('/api/experience/education?status=all');
      console.log('📡 Education API Response Status:', response.status);
      
      const data = await response.json();
      console.log('📊 Education API Response Data:', data);

      if (data.success) {
        const educationData = data.data.education || [];
        console.log('✅ Education entries found:', educationData.length);
        console.log('📚 Education data:', educationData);
        setEducationEntries(educationData);
      } else {
        console.error('❌ API returned error:', data.error);
        setError(data.error || 'Failed to fetch education entries');
      }
    } catch (error) {
      console.error('💥 Error fetching education:', error);
      setError('Failed to fetch education entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return;

    try {
      const response = await fetch(`/api/experience/education/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        fetchEducation();
      } else {
        alert('Failed to delete education entry');
      }
    } catch (error) {
      console.error('Error deleting education:', error);
      alert('Failed to delete education entry');
    }
  };

  const handleEdit = (education: Education) => {
    // Convert Education to EducationData by making _id optional
    const { _id, ...rest } = education;
    setShowForm({
      show: true,
      mode: 'edit',
      data: { _id, ...rest }
    });
  };

  const handleView = (education: Education) => {
    setViewingEducation(education);
  };

  const handleCloseForm = () => {
    setShowForm({ show: false, mode: 'create', data: undefined });
    fetchEducation();
  };

  const handleCloseView = () => {
    setViewingEducation(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Loading education entries...</div>
      </div>
    );
  }

  if (showForm.show) {
    return (
      <EducationForm
        mode={showForm.mode}
        initialData={showForm.data}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Education Management</h1>
          <p className="text-gray-600 mt-1">Manage your educational background and qualifications</p>
        </div>
        <button
          onClick={() => setShowForm({ show: true, mode: 'create' })}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          Add Education
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <School className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Education</p>
              <p className="text-2xl font-bold text-gray-900">{educationEntries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <GraduationCap className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {educationEntries.filter(edu => edu.status === 'published').length}
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
                {educationEntries.filter(edu => edu.featured).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">With Honors</p>
              <p className="text-2xl font-bold text-gray-900">
                {educationEntries.filter(edu => edu.honors && edu.honors.length > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Education List */}
      {educationEntries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No education entries found</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first education entry.</p>
          <button
            onClick={() => setShowForm({ show: true, mode: 'create' })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            Add Education
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {educationEntries.map((education) => (
            <EducationCard
              key={education._id}
              education={education}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Education Details Modal */}
      {viewingEducation && (
        <EducationDetailsModal
          education={viewingEducation}
          onClose={handleCloseView}
        />
      )}
    </div>
  );
} 