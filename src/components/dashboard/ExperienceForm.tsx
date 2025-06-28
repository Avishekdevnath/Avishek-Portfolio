"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import dynamic from 'next/dynamic';

// Import rich text editor dynamically
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import './quill.css';

interface ExperienceFormProps {
  initialData?: any;
  type: 'work' | 'education';
  mode: 'create' | 'edit';
  onClose?: () => void;
}

export default function ExperienceForm({ initialData, type, mode, onClose }: ExperienceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Common fields
    title: initialData?.title || '',
    organization: initialData?.organization || '',
    location: initialData?.location || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
    isCurrent: initialData?.isCurrent || false,
    description: initialData?.description || '',
    order: initialData?.order || 0,
    featured: initialData?.featured || false,
    status: initialData?.status || 'published',
    
    // Work-specific fields (handle both old and new structure)
    jobTitle: initialData?.jobTitle || initialData?.position || '',
    level: initialData?.level || '',
    company: initialData?.company || '',
    employmentType: initialData?.employmentType || 'full-time',
    technologies: initialData?.technologies || [],
    achievements: initialData?.achievements || [],
    responsibilities: initialData?.responsibilities || [],
    website: initialData?.website || '',
    companySize: initialData?.companySize || '',
    
    // Education-specific fields
    degree: initialData?.degree || '',
    institution: initialData?.institution || '',
    fieldOfStudy: initialData?.fieldOfStudy || '',
    gpa: initialData?.gpa || '',
    maxGpa: initialData?.maxGpa || '',
    activities: initialData?.activities || [],
    honors: initialData?.honors || [],
    coursework: initialData?.coursework || [],
  });

  // Auto-sync organization and title fields
  useEffect(() => {
    if (type === 'work') {
      const newTitle = formData.level && formData.jobTitle 
        ? `${formData.level} ${formData.jobTitle}` 
        : formData.jobTitle;
      setFormData(prev => ({ 
        ...prev, 
        organization: prev.company,
        title: newTitle || prev.title
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        organization: prev.institution,
        title: prev.degree || prev.title
      }));
    }
  }, [formData.company, formData.institution, formData.jobTitle, formData.level, formData.degree, type]);

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleArrayFieldAdd = (field: string, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
    }
  };

  const handleArrayFieldRemove = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const ArrayFieldInput = ({ field, label, placeholder }: { field: string; label: string; placeholder: string }) => {
    const [inputValue, setInputValue] = useState('');
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleArrayFieldAdd(field, inputValue);
                setInputValue('');
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => {
              handleArrayFieldAdd(field, inputValue);
              setInputValue('');
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(formData[field] as string[]).map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => handleArrayFieldRemove(field, index)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('=== EXPERIENCE FORM SUBMIT DEBUG ===');
      console.log('Form mode:', mode);
      console.log('Experience type:', type);
      console.log('Form data:', JSON.stringify(formData, null, 2));

      // Prepare data for submission
      const submitData = { ...formData };
      
      // Convert empty strings to null for optional fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          submitData[key] = null;
        }
      });

      // For work experience, ensure we have both old and new structure
      if (type === 'work') {
        console.log('Processing work experience data...');
        
        // If jobTitle is missing but we have title, use title as jobTitle
        if (!submitData.jobTitle && submitData.title) {
          submitData.jobTitle = submitData.title;
          console.log('Set jobTitle from title:', submitData.jobTitle);
        }

        // Ensure organization matches company
        if (submitData.company && !submitData.organization) {
          submitData.organization = submitData.company;
          console.log('Set organization from company:', submitData.organization);
        }

        // Generate title from level + jobTitle if needed
        if (!submitData.title && submitData.jobTitle) {
          submitData.title = submitData.level 
            ? `${submitData.level} ${submitData.jobTitle}` 
            : submitData.jobTitle;
          console.log('Generated title:', submitData.title);
        }
      }

      // For education experience
      if (type === 'education') {
        console.log('Processing education data...');
        
        // If title is missing but we have degree, use degree as title
        if (!submitData.title && submitData.degree) {
          submitData.title = submitData.degree;
          console.log('Set title from degree:', submitData.title);
        }

        // Ensure organization matches institution
        if (submitData.institution && !submitData.organization) {
          submitData.organization = submitData.institution;
          console.log('Set organization from institution:', submitData.organization);
        }
      }

      console.log('Final submit data:', JSON.stringify(submitData, null, 2));

      const url = mode === 'edit' 
        ? `/api/experience/${type}/${initialData?._id}`
        : `/api/experience/${type}`;
      
      const method = mode === 'edit' ? 'PUT' : 'POST';
      console.log('API request:', { url, method });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      console.log('API response status:', response.status);
      console.log('API response ok:', response.ok);

      const responseText = await response.text();
      console.log('API response text:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`Invalid response: ${responseText}`);
      }

      console.log('API response data:', JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Request failed`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Operation failed');
      }

      console.log('Experience saved successfully:', result.data);
      onClose();
    } catch (error) {
      console.error('=== EXPERIENCE FORM SUBMIT ERROR ===');
      console.error('Error details:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'create' ? 'Add New' : 'Edit'} {type === 'work' ? 'Work Experience' : 'Education'}
              </h2>
              <p className="text-gray-600 mt-1">
                {type === 'work' 
                  ? 'Add your professional work experience details' 
                  : 'Add your educational background information'
                }
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            )}
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
              {success}
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={type === 'work' ? 'Job title' : 'Degree title'}
                  required
                />
              </div>

              {type === 'work' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Full Stack Developer, Software Engineer..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level
                    </label>
                    <input
                      type="text"
                      value={formData.level}
                      onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Senior, Junior, Lead, Intern..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Company name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Type *
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData(prev => ({ ...prev, employmentType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="freelance">Freelance</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Degree *
                    </label>
                    <input
                      type="text"
                      value={formData.degree}
                      onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Bachelor of Science"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution *
                    </label>
                    <input
                      type="text"
                      value={formData.institution}
                      onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="University name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field of Study *
                    </label>
                    <input
                      type="text"
                      value={formData.fieldOfStudy}
                      onChange={(e) => setFormData(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Computer Science"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GPA
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.gpa}
                        onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="3.8"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max GPA
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.maxGpa}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxGpa: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="4.0"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Location and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City, Country"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={formData.isCurrent}
                />
              </div>
            </div>

            {/* Current Position Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isCurrent}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  isCurrent: e.target.checked,
                  endDate: e.target.checked ? '' : prev.endDate
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                This is my current {type === 'work' ? 'position' : 'education'}
              </label>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <ReactQuill
                value={formData.description}
                onChange={handleDescriptionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={type === 'work' 
                  ? 'Describe your role, responsibilities, and achievements...'
                  : 'Describe your studies, projects, and academic achievements...'
                }
                required
              />
            </div>

            {/* Type-specific array fields */}
            {type === 'work' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ArrayFieldInput 
                  field="technologies" 
                  label="Technologies" 
                  placeholder="React, Node.js, Python..." 
                />
                <ArrayFieldInput 
                  field="achievements" 
                  label="Key Achievements" 
                  placeholder="Increased performance by 40%..." 
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ArrayFieldInput 
                  field="honors" 
                  label="Honors & Awards" 
                  placeholder="Dean's List, Summa Cum Laude..." 
                />
                <ArrayFieldInput 
                  field="activities" 
                  label="Activities" 
                  placeholder="Programming Club, Research Assistant..." 
                />
              </div>
            )}

            {/* Website (for work) */}
            {type === 'work' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://company.com"
                />
              </div>
            )}

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Featured
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaSave />
                <span>{loading ? 'Saving...' : 'Save Experience'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 