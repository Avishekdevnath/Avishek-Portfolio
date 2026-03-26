'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BookmarkFormData {
  _id?: string;
  jobTitle: string;
  company: string;
  platform: string;
  jobUrl: string;
  notes: string;
  bookmarkedDate: string;
}

interface CreateBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  platforms: Array<{ _id: string; name: string }>;
  mode?: 'create' | 'edit';
  initialData?: Partial<BookmarkFormData> | null;
}

export default function CreateBookmarkModal({
  isOpen,
  onClose,
  onSuccess,
  platforms = [],
  mode = 'create',
  initialData = null,
}: CreateBookmarkModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BookmarkFormData>({
    jobTitle: '',
    company: '',
    platform: '',
    jobUrl: '',
    notes: '',
    bookmarkedDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && initialData) {
      setFormData({
        _id: initialData._id,
        jobTitle: initialData.jobTitle || '',
        company: initialData.company || '',
        platform: initialData.platform || '',
        jobUrl: initialData.jobUrl || '',
        notes: initialData.notes || '',
        bookmarkedDate: initialData.bookmarkedDate
          ? new Date(initialData.bookmarkedDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      });
      return;
    }

    setFormData({
      jobTitle: '',
      company: '',
      platform: '',
      jobUrl: '',
      notes: '',
      bookmarkedDate: new Date().toISOString().split('T')[0],
    });
  }, [isOpen, initialData, mode]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(mode === 'edit' ? `/api/job-hunt/bookmarks/${formData._id}` : '/api/job-hunt/bookmarks', {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bookmarkedDate: new Date(formData.bookmarkedDate).toISOString(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(mode === 'edit' ? 'Bookmark updated successfully' : 'Bookmark created successfully');
        // Reset form with today's date
        setFormData({
          jobTitle: '',
          company: '',
          platform: '',
          jobUrl: '',
          notes: '',
          bookmarkedDate: new Date().toISOString().split('T')[0],
        });
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || (mode === 'edit' ? 'Failed to update bookmark' : 'Failed to create bookmark'));
      }
    } catch (error) {
      toast.error(mode === 'edit' ? 'Error updating bookmark' : 'Error creating bookmark');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const prettifyPlatformName = (name: string) =>
    name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-200"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 pointer-events-none">
    <div
      className="w-full max-w-2xl bg-white rounded-lg sm:rounded-2xl shadow-2xl pointer-events-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#2a2118] to-[#3d2f22] px-4 sm:px-6 py-4 sm:py-5 border-b border-[#d4622a]/20">
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1 sm:p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg sm:text-xl font-semibold text-white pr-8">{mode === 'edit' ? 'Edit Bookmark' : 'Add New Bookmark'}</h2>
        <p className="text-xs sm:text-sm text-white/60 mt-1">{mode === 'edit' ? 'Update saved opportunity details' : 'Save a job opportunity you found'}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {/* Job Title */}
        <div className="space-y-1.5">
          <label htmlFor="jobTitle" className="block text-xs sm:text-sm font-medium text-[#2a2118]">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            id="jobTitle"
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleInputChange}
            placeholder="e.g., Senior React Developer"
            required
            className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border border-[#e8e3db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4622a] focus:border-transparent transition-all text-sm text-[#2a2118] placeholder-gray-400"
          />
        </div>

        {/* Company */}
        <div className="space-y-1.5">
          <label htmlFor="company" className="block text-xs sm:text-sm font-medium text-[#2a2118]">
            Company <span className="text-red-500">*</span>
          </label>
          <input
            id="company"
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            placeholder="e.g., Tech Corp Inc."
            required
            className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border border-[#e8e3db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4622a] focus:border-transparent transition-all text-sm text-[#2a2118] placeholder-gray-400"
          />
        </div>

        {/* Platform and Job URL - Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

          {/* Platform */}
          <div className="space-y-1.5">
            <label htmlFor="platform" className="block text-xs sm:text-sm font-medium text-[#2a2118]">
              Platform <span className="text-red-500">*</span>
            </label>
            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
              required
              className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border border-[#e8e3db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4622a] focus:border-transparent transition-all text-sm text-[#2a2118] bg-white"
            >
              <option value="">Select a platform...</option>
              {platforms.map((p) => (
                <option key={p._id} value={p.name}>
                  {prettifyPlatformName(p.name)}
                </option>
              ))}
            </select>
          </div>

          {/* Job URL */}
          <div className="space-y-1.5">
            <label htmlFor="jobUrl" className="block text-xs sm:text-sm font-medium text-[#2a2118]">
              Job URL <span className="text-red-500">*</span>
            </label>
            <input
              id="jobUrl"
              type="url"
              name="jobUrl"
              value={formData.jobUrl}
              onChange={handleInputChange}
              placeholder="https://..."
              required
              className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border border-[#e8e3db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4622a] focus:border-transparent transition-all text-sm text-[#2a2118] placeholder-gray-400"
            />
          </div>
        </div>

        {/* Bookmarked Date */}
        <div className="space-y-1.5 bg-gradient-to-r from-[#f7f3ea] to-white p-3 sm:p-3.5 rounded-lg border border-[#d4622a]/20">
          <label htmlFor="bookmarkedDate" className="block text-xs sm:text-sm font-medium text-[#2a2118]">
            📅 Bookmarked Date <span className="text-red-500">*</span>
          </label>
          <input
            id="bookmarkedDate"
            type="date"
            name="bookmarkedDate"
            value={formData.bookmarkedDate}
            onChange={handleInputChange}
            required
            className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border border-[#d4622a]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4622a] focus:border-transparent transition-all text-sm text-[#2a2118] bg-white"
          />
          <p className="text-xs text-gray-500 mt-1">This will help you track when you bookmarked this job</p>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label htmlFor="notes" className="block text-xs sm:text-sm font-medium text-[#2a2118]">
            Notes <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Add any notes about this job..."
            rows={3}
            className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 border border-[#e8e3db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4622a] focus:border-transparent transition-all text-sm text-[#2a2118] placeholder-gray-400 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 sm:py-3 border border-[#e8e3db] text-sm text-[#2a2118] font-medium rounded-lg hover:bg-[#f7f3ea] transition-colors order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#d4622a] to-[#c04d1a] text-sm text-white font-medium rounded-lg hover:from-[#c04d1a] hover:to-[#a83f15] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl order-1 sm:order-2"
          >
            {loading ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Bookmark' : 'Create Bookmark')}
          </button>
        </div>
      </form>
    </div>
  </div>
    </>
  );
}
