"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import DraftEditor from '../shared/DraftEditor';
import {
  ExperienceType,
  ExperienceFormData,
  IWorkExperience,
  IEducation,
  EmploymentType,
  ExperienceStatus,
  ExperienceApiResponse
} from '@/types/experience';

interface ExperienceFormProps {
  initialData?: Partial<ExperienceFormData>;
  type: ExperienceType;
  mode: 'create' | 'edit';
  onClose: () => void;
}

type ArrayFieldKey = keyof Pick<ExperienceFormData, 
  'technologies' | 
  'achievements' | 
  'responsibilities' | 
  'activities' | 
  'honors' | 
  'coursework'
>;

type FormDataState = Partial<ExperienceFormData> & {
  [K in ArrayFieldKey]?: string[];
};

type ArrayInputProps = {
  field: ArrayFieldKey;
  label: string;
  placeholder: string;
  values: string[];
  onAdd: (field: ArrayFieldKey, value: string) => void;
  onRemove: (field: ArrayFieldKey, index: number) => void;
};

const ArrayInput: React.FC<ArrayInputProps> = ({
  field,
  label,
  placeholder,
  values,
  onAdd,
  onRemove
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleAddValue = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAdd(field, inputValue.trim());
      setInputValue('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        onAdd(field, inputValue.trim());
        setInputValue('');
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={handleAddValue}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaPlus />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((item, index) => (
          <span
            key={`${field}-${index}-${item}`}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm group"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(field, index)}
              className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaTimes className="text-xs" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default function ExperienceForm({ initialData, type, mode, onClose }: ExperienceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormDataState>(initialData || {});

  // Auto-sync organization and title fields
  useEffect(() => {
    if (type === 'work') {
      const newTitle = formData.level && formData.jobTitle 
        ? `${formData.level} ${formData.jobTitle}` 
        : formData.jobTitle;
      setFormData(prev => ({ 
        ...prev, 
        organization: prev.company || '',
        title: newTitle || prev.title
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        organization: prev.institution || '',
        title: prev.degree || prev.title
      }));
    }
  }, [formData.company, formData.institution, formData.jobTitle, formData.level, formData.degree, type]);

  const handleDescriptionChange = (value: string) => {
    try {
      // If empty, set to empty string
      if (!value.trim()) {
        setFormData(prev => ({ ...prev, description: '' }));
        return;
      }

      // Try to parse as Draft.js content
      const content = JSON.parse(value);
      if (content.blocks && Array.isArray(content.blocks)) {
        // Valid Draft.js content
        setFormData(prev => ({ ...prev, description: value }));
      } else {
        // Invalid Draft.js content, store as plain text
        setFormData(prev => ({ ...prev, description: value }));
      }
    } catch (error) {
      // If parsing fails, store as plain text
      console.warn('Failed to parse description content:', error);
      setFormData(prev => ({ ...prev, description: value }));
    }
  };

  const handleArrayFieldAdd = (field: ArrayFieldKey, value: string) => {
    if (!value.trim()) return;

    setFormData(prev => {
      const currentArray = prev[field] as string[] || [];
      return {
        ...prev,
        [field]: [...currentArray, value.trim()]
      };
    });
  };

  const handleArrayFieldRemove = (field: ArrayFieldKey, index: number) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[] || [];
      return {
        ...prev,
        [field]: currentArray.filter((_, i) => i !== index)
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Ensure arrays are properly initialized
      const arrayFields: ArrayFieldKey[] = ['technologies', 'achievements', 'responsibilities', 'activities', 'honors', 'coursework'];
      const initializedArrays = arrayFields.reduce((acc, field) => ({
        ...acc,
        [field]: formData[field] || []
      }), {});

      const submitData = {
        ...formData,
        ...initializedArrays,
        type,
        // Convert empty strings to null
        ...Object.fromEntries(
          Object.entries(formData).map(([key, value]) => [
            key,
            value === '' ? null : (Array.isArray(value) ? value : value)
          ])
        ),
        // Convert string dates to ISO strings
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        // Convert string numbers to actual numbers
        gpa: formData.gpa ? parseFloat(formData.gpa as string) : null,
        maxGpa: formData.maxGpa ? parseFloat(formData.maxGpa as string) : null,
      };

      // For work experience, ensure we have both old and new structure
      if (type === 'work') {
        if (!submitData.jobTitle && submitData.title) {
          submitData.jobTitle = submitData.title;
        }
        if (submitData.company && !submitData.organization) {
          submitData.organization = submitData.company;
        }
        if (!submitData.title && submitData.jobTitle) {
          submitData.title = submitData.level 
            ? `${submitData.level} ${submitData.jobTitle}` 
            : submitData.jobTitle;
        }
      }

      // For education experience
      if (type === 'education') {
        if (!submitData.title && submitData.degree) {
          submitData.title = submitData.degree;
        }
        if (submitData.institution && !submitData.organization) {
          submitData.organization = submitData.institution;
        }
      }

      const endpoint = mode === 'create'
        ? `/api/experience/${type}`
        : `/api/experience/${type}/${initialData?._id}`;

      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result: ExperienceApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save experience');
      }

      setSuccess('Experience saved successfully');
      router.refresh();
      
      // Close form after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error saving experience:', err);
      setError(err instanceof Error ? err.message : 'Failed to save experience');
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
                      onChange={(e) => setFormData(prev => ({ ...prev, employmentType: e.target.value as EmploymentType }))}
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
                        value={formData.gpa || ''}
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
                        value={formData.maxGpa || ''}
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
                  value={formData.startDate instanceof Date ? formData.startDate.toISOString().split('T')[0] : formData.startDate || ''}
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
                  value={formData.endDate instanceof Date ? formData.endDate.toISOString().split('T')[0] : formData.endDate || ''}
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
                Description
              </label>
              <DraftEditor
                value={formData.description || ''}
                onChange={handleDescriptionChange}
                className="min-h-[200px]"
                placeholder={
                  type === 'work'
                    ? 'Describe your role, responsibilities, and achievements...'
                    : 'Describe your studies, projects, and academic achievements...'
                }
              />
            </div>

            {/* Type-specific array fields */}
            {type === 'work' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ArrayInput 
                  field="technologies"
                  label="Technologies"
                  placeholder="React, Node.js, Python..."
                  values={formData.technologies || []}
                  onAdd={handleArrayFieldAdd}
                  onRemove={handleArrayFieldRemove}
                />
                <ArrayInput 
                  field="achievements"
                  label="Key Achievements"
                  placeholder="Increased performance by 40%..."
                  values={formData.achievements || []}
                  onAdd={handleArrayFieldAdd}
                  onRemove={handleArrayFieldRemove}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ArrayInput 
                  field="honors"
                  label="Honors & Awards"
                  placeholder="Dean's List, Summa Cum Laude..."
                  values={formData.honors || []}
                  onAdd={handleArrayFieldAdd}
                  onRemove={handleArrayFieldRemove}
                />
                <ArrayInput 
                  field="activities"
                  label="Activities"
                  placeholder="Student Council, Research Assistant..."
                  values={formData.activities || []}
                  onAdd={handleArrayFieldAdd}
                  onRemove={handleArrayFieldRemove}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ExperienceStatus }))}
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