"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Import rich text editor dynamically
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import './quill.css';

interface EducationFormProps {
  mode: 'create' | 'edit';
  initialData?: any;
  onClose: () => void;
}

export default function EducationForm({ mode, initialData, onClose }: EducationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    
    // Education-specific fields
    degree: initialData?.degree || '',
    institution: initialData?.institution || '',
    fieldOfStudy: initialData?.fieldOfStudy || '',
    gpa: initialData?.gpa || '',
    maxGpa: initialData?.maxGpa || 4,
    activities: initialData?.activities || [],
    honors: initialData?.honors || [],
    coursework: initialData?.coursework || [],
    
    // Thesis fields
    thesisTitle: initialData?.thesisTitle || '',
    thesisDescription: initialData?.thesisDescription || '',
    thesisSupervisor: initialData?.thesisSupervisor || '',
  });

  // Auto-sync logic for organization and title
  useEffect(() => {
    if (formData.institution && !formData.organization) {
      setFormData(prev => ({ ...prev, organization: formData.institution }));
    }
  }, [formData.institution]);

  useEffect(() => {
    if (formData.degree && !formData.title) {
      setFormData(prev => ({ ...prev, title: formData.degree }));
    }
  }, [formData.degree]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleArrayChange = (field: string, values: string[]) => {
    setFormData(prev => ({ ...prev, [field]: values }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare data for submission
      const submitData = { ...formData };
      
      // Convert empty strings to null for optional fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          submitData[key] = null;
        }
      });

      // Ensure institution matches organization
      if (submitData.institution && !submitData.organization) {
        submitData.organization = submitData.institution;
      }

      // Ensure title matches degree
      if (submitData.degree && !submitData.title) {
        submitData.title = submitData.degree;
      }

      // Handle thesis data
      if (submitData.thesisTitle || submitData.thesisDescription || submitData.thesisSupervisor) {
        submitData.thesis = {
          title: submitData.thesisTitle,
          description: submitData.thesisDescription,
          supervisor: submitData.thesisSupervisor,
        };
      }

      // Remove thesis individual fields from main object
      delete submitData.thesisTitle;
      delete submitData.thesisDescription;
      delete submitData.thesisSupervisor;

      const url = mode === 'edit' 
        ? `/api/experience/education/${initialData?._id}`
        : `/api/experience/education`;
      
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Request failed`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Operation failed');
      }

      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'edit' ? 'Edit Education' : 'Add New Education'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Bachelor of Science"
                  required
                />
              </div>

              {/* Organization */}
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., University Name"
                  required
                />
              </div>

              {/* Institution */}
              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-2">
                  Institution <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., BGC Trust University Bangladesh"
                  required
                />
              </div>

              {/* Degree */}
              <div>
                <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-2">
                  Degree <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Bachelor of Science"
                  required
                />
              </div>

              {/* Field of Study */}
              <div>
                <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-700 mb-2">
                  Field of Study <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fieldOfStudy"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Computer Science & Engineering"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Chittagong, Bangladesh"
                  required
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={formData.isCurrent}
                />
              </div>
            </div>

            {/* Current Education Checkbox */}
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="isCurrent"
                name="isCurrent"
                checked={formData.isCurrent}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="isCurrent" className="ml-2 text-sm text-gray-700">
                I am currently studying here
              </label>
            </div>

            {/* GPA Section */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GPA */}
              <div>
                <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 mb-2">
                  GPA
                </label>
                <input
                  type="number"
                  id="gpa"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="3.8"
                />
              </div>

              {/* Max GPA */}
              <div>
                <label htmlFor="maxGpa" className="block text-sm font-medium text-gray-700 mb-2">
                  Max GPA
                </label>
                <input
                  type="number"
                  id="maxGpa"
                  name="maxGpa"
                  value={formData.maxGpa}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="4.0"
                />
              </div>
            </div>

            {/* Description - Rich Text Editor */}
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <ReactQuill
                value={formData.description}
                onChange={handleDescriptionChange}
                className="bg-white"
                theme="snow"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['blockquote', 'code-block'],
                    ['link'],
                    ['clean']
                  ],
                }}
                formats={[
                  'header', 'bold', 'italic', 'underline', 'strike',
                  'list', 'bullet', 'blockquote', 'code-block', 'link'
                ]}
                placeholder="Describe your education experience, key learnings, projects, etc."
              />
            </div>
          </div>

          {/* Array Fields */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Additional Details</h2>
            
            {/* Activities */}
            <ArrayField
              label="Activities & Organizations"
              placeholder="e.g., Computer Science Club, Student Council"
              values={formData.activities}
              onChange={(values) => handleArrayChange('activities', values)}
            />

            {/* Honors */}
            <ArrayField
              label="Honors & Awards"
              placeholder="e.g., Dean's List, Summa Cum Laude"
              values={formData.honors}
              onChange={(values) => handleArrayChange('honors', values)}
            />

            {/* Coursework */}
            <ArrayField
              label="Relevant Coursework"
              placeholder="e.g., Data Structures, Algorithms, Database Systems"
              values={formData.coursework}
              onChange={(values) => handleArrayChange('coursework', values)}
            />
          </div>

          {/* Thesis Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Thesis/Research (Optional)</h2>
            
            <div className="space-y-4">
              {/* Thesis Title */}
              <div>
                <label htmlFor="thesisTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Thesis Title
                </label>
                <input
                  type="text"
                  id="thesisTitle"
                  name="thesisTitle"
                  value={formData.thesisTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Machine Learning Applications in Web Development"
                />
              </div>

              {/* Thesis Description */}
              <div>
                <label htmlFor="thesisDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Thesis Description
                </label>
                <textarea
                  id="thesisDescription"
                  name="thesisDescription"
                  value={formData.thesisDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description of your thesis research and findings"
                />
              </div>

              {/* Thesis Supervisor */}
              <div>
                <label htmlFor="thesisSupervisor" className="block text-sm font-medium text-gray-700 mb-2">
                  Thesis Supervisor
                </label>
                <input
                  type="text"
                  id="thesisSupervisor"
                  name="thesisSupervisor"
                  value={formData.thesisSupervisor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Dr. John Smith"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Order */}
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              {/* Featured */}
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Education</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {loading ? 'Saving...' : (mode === 'edit' ? 'Update Education' : 'Create Education')}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <X size={20} />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Array Field Component
function ArrayField({ 
  label, 
  placeholder, 
  values, 
  onChange 
}: { 
  label: string; 
  placeholder: string; 
  values: string[]; 
  onChange: (values: string[]) => void; 
}) {
  const [inputValue, setInputValue] = useState('');

  const addValue = () => {
    if (inputValue.trim() && !values.includes(inputValue.trim())) {
      onChange([...values, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeValue = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue();
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={addValue}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Add
        </button>
      </div>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
            >
              {value}
              <button
                type="button"
                onClick={() => removeValue(index)}
                className="text-purple-600 hover:text-purple-800"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
} 