'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import PlatformSelector from './PlatformSelector';
import CompanyCombobox from './CompanyCombobox';

interface BookmarkFormProps {
  initialBookmark?: {
    jobTitle: string;
    company: string;
    platform: string;
    jobUrl: string;
    notes?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function BookmarkForm({ initialBookmark, onSubmit, onCancel }: BookmarkFormProps) {
  const [form, setForm] = useState({
    jobTitle: initialBookmark?.jobTitle || '',
    company: initialBookmark?.company || '',
    platform: initialBookmark?.platform || '',
    jobUrl: initialBookmark?.jobUrl || '',
    notes: initialBookmark?.notes || '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
    if (!form.company.trim()) newErrors.company = 'Company is required';
    if (!form.platform) newErrors.platform = 'Platform is required';
    if (!form.jobUrl.trim()) newErrors.jobUrl = 'Job URL is required';
    else {
      try {
        new URL(form.jobUrl);
      } catch {
        newErrors.jobUrl = 'Invalid URL format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
      toast.success('Bookmark saved!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save bookmark');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
        <input
          type="text"
          value={form.jobTitle}
          onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
          placeholder="e.g., Senior React Developer"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 ${
            errors.jobTitle ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.jobTitle && <p className="text-xs text-red-600 mt-1">{errors.jobTitle}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
        <CompanyCombobox
          value={form.company}
          onChange={(value) => setForm({ ...form, company: value })}
          error={errors.company}
        />
        {errors.company && <p className="text-xs text-red-600 mt-1">{errors.company}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
        <PlatformSelector
          value={form.platform}
          onChange={(value) => setForm({ ...form, platform: value })}
          required
          placeholder="Select a platform..."
        />
        {errors.platform && <p className="text-xs text-red-600 mt-1">{errors.platform}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job URL *</label>
        <input
          type="url"
          value={form.jobUrl}
          onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
          placeholder="https://..."
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500 ${
            errors.jobUrl ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.jobUrl && <p className="text-xs text-red-600 mt-1">{errors.jobUrl}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Add optional notes..."
          maxLength={500}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
        <p className="text-xs text-gray-500 mt-1">{form.notes.length}/500</p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-[#d4622a] text-white rounded-md hover:bg-[#2a2118] disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Bookmark'}
        </button>
      </div>
    </form>
  );
}
