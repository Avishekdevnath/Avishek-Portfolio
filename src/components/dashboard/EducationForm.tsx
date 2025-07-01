"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ThesisData {
  title?: string;
  description?: string;
  supervisor?: string;
}

interface EducationData {
  _id?: string;
  type: 'education';
  title: string;
  degree: string;
  institution: string;
  organization: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  featured: boolean;
  order: number;
  status: 'draft' | 'published';
  fieldOfStudy: string;
  gpa?: number | null;
  maxGpa?: number | null;
  activities: string[];
  honors: string[];
  coursework: string[];
  thesis?: ThesisData | null;
}

interface FormData extends Omit<EducationData, 'thesis' | 'type'> {
  thesisTitle: string;
  thesisDescription: string;
  thesisSupervisor: string;
}

interface EducationFormProps {
  mode: 'create' | 'edit';
  initialData?: EducationData;
  onClose: () => void;
}

interface ArrayFieldProps {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}

function ArrayField({ label, placeholder, values, onChange }: ArrayFieldProps) {
  const [newValue, setNewValue] = useState('');

  const addValue = () => {
    if (newValue.trim()) {
      onChange([...values, newValue.trim()]);
      setNewValue('');
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
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={addValue}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {values.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {values.map((value, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
              >
                {value}
                <button
                  type="button"
                  onClick={() => removeValue(index)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const EMPTY_CONTENT = {
  blocks: [
    {
      text: '',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    },
  ],
  entityMap: {},
};

export default function EducationForm({ mode, initialData, onClose }: EducationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Convert DraftContent to string if needed
  const getInitialDescription = (desc: string | undefined): string => {
    if (!desc) return EMPTY_CONTENT;
    if (typeof desc === 'string') {
      try {
        // Check if it's already a JSON string
        return JSON.parse(desc);
      } catch {
        // If not, convert it to DraftContent format
        return {
          blocks: [
            {
              text: desc,
              type: 'unstyled',
              depth: 0,
              inlineStyleRanges: [],
              entityRanges: [],
              data: {},
            },
          ],
          entityMap: {},
        };
      }
    }
    return desc;
  };

  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    organization: initialData?.organization || '',
    location: initialData?.location || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    isCurrent: initialData?.isCurrent || false,
    description: getInitialDescription(initialData?.description),
    order: initialData?.order || 0,
    featured: initialData?.featured || false,
    status: initialData?.status || 'published',
    degree: initialData?.degree || '',
    institution: initialData?.institution || '',
    fieldOfStudy: initialData?.fieldOfStudy || '',
    gpa: initialData?.gpa || undefined,
    maxGpa: initialData?.maxGpa || 4,
    activities: (initialData?.activities || []) as string[],
    honors: (initialData?.honors || []) as string[],
    coursework: (initialData?.coursework || []) as string[],
    thesisTitle: initialData?.thesis?.title || '',
    thesisDescription: getInitialDescription(initialData?.thesis?.description),
    thesisSupervisor: initialData?.thesis?.supervisor || '',
  });

  // Auto-sync logic for organization and title
  useEffect(() => {
    if (formData.institution && !formData.organization) {
      setFormData(prev => ({ ...prev, organization: prev.institution }));
    }
  }, [formData.institution]);

  useEffect(() => {
    if (formData.degree && !formData.title) {
      setFormData(prev => ({ ...prev, title: prev.degree }));
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

  const handleThesisDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, thesisDescription: value }));
  };

  const handleArrayChange = (field: keyof Pick<FormData, 'activities' | 'honors' | 'coursework'>) => (values: string[]) => {
    setFormData(prev => ({ ...prev, [field]: values }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'create' 
        ? '/api/experience/education'
        : `/api/experience/education/${initialData?._id}`;

      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          description: typeof formData.description === 'string' 
            ? JSON.parse(formData.description) 
            : formData.description,
          thesis: {
            title: formData.thesisTitle,
            description: typeof formData.thesisDescription === 'string'
              ? JSON.parse(formData.thesisDescription)
              : formData.thesisDescription,
            supervisor: formData.thesisSupervisor,
          },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to save education');
      }

      onClose();
    } catch (error) {
      console.error('Error saving education:', error);
      setError(error instanceof Error ? error.message : 'Failed to save education');
    } finally {
      setLoading(false);
    }
  };

  // Media upload handler for Quill editor
  const handleEditorMediaUpload = async (file: File): Promise<string> => {
    try {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) throw new Error('Unsupported file type');
      const maxSize = isImage ? 5 * 1024 * 1024 : 100 * 1024 * 1024;
      if (file.size > maxSize) throw new Error(`File size must be less than ${isImage ? '5MB' : '100MB'}`);
      const form = new FormData();
      form.append(isImage ? 'image' : 'video', file);
      const endpoint = isImage ? '/api/blogs/upload-image' : '/api/blogs/upload-video';
      const res = await fetch(endpoint, { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) return data.url as string;
      throw new Error(data.error || 'Failed to upload');
    } catch (err) {
      console.error('Media upload error', err);
      toast.error(err instanceof Error ? err.message : 'Upload failed');
      throw err; // Re-throw the error instead of returning null
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Add Education' : 'Edit Education'}
            </h1>
            <p className="text-gray-600">
              {mode === 'create'
                ? 'Add a new education entry to your profile'
                : 'Update your education information'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Education'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Degree
            </label>
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Bachelor of Science"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institution
            </label>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Stanford University"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field of Study
            </label>
            <input
              type="text"
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Computer Science"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Stanford, CA"
              required
            />
          </div>
        </div>

        {/* Dates and Status */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={formData.isCurrent}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="isCurrent"
                checked={formData.isCurrent}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              Currently Studying Here
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              Featured
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GPA
              </label>
              <input
                type="number"
                name="gpa"
                value={formData.gpa || ''}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 3.8"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max GPA
              </label>
              <input
                type="number"
                name="maxGpa"
                value={formData.maxGpa || ''}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 4.0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="min-h-[100px] w-full border rounded-md p-2"
          placeholder="Describe your education..."
          required
        />
      </div>

      {/* Activities, Honors, and Coursework */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ArrayField
            label="Activities & Organizations"
            placeholder="Add an activity or organization"
            values={formData.activities}
            onChange={handleArrayChange('activities')}
          />

          <ArrayField
            label="Honors & Awards"
            placeholder="Add an honor or award"
            values={formData.honors}
            onChange={handleArrayChange('honors')}
          />
        </div>

        <div className="space-y-6">
          <ArrayField
            label="Relevant Coursework"
            placeholder="Add a course"
            values={formData.coursework}
            onChange={handleArrayChange('coursework')}
          />

          {/* Thesis Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Thesis/Research</h3>
            <input
              type="text"
              name="thesisTitle"
              value={formData.thesisTitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Thesis Title"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thesis Description
              </label>
              <textarea
                value={formData.thesisDescription || ''}
                onChange={e => setFormData(prev => ({ ...prev, thesisDescription: e.target.value }))}
                className="min-h-[100px] w-full border rounded-md p-2"
                placeholder="Describe your thesis..."
              />
            </div>
            <input
              type="text"
              name="thesisSupervisor"
              value={formData.thesisSupervisor}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Thesis Supervisor"
            />
          </div>
        </div>
      </div>

      {/* Order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Order
        </label>
        <input
          type="number"
          name="order"
          value={formData.order}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          min="0"
          step="1"
        />
        <p className="mt-1 text-sm text-gray-500">
          Lower numbers will be displayed first
        </p>
      </div>
    </form>
  );
}