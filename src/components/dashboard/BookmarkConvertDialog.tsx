'use client';

import { useState } from 'react';
import PlatformBadge from './PlatformBadge';

interface ConvertDialogProps {
  bookmark: {
    jobTitle: string;
    company: string;
    platform: string;
  };
  onConfirm: (status: string) => Promise<void>;
  onCancel: () => void;
}

const APP_STATUSES = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected', 'No Response'];

export default function BookmarkConvertDialog({ bookmark, onConfirm, onCancel }: ConvertDialogProps) {
  const [status, setStatus] = useState('Applied');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(status);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Convert Bookmark to Application</h2>

        <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-600">Job Title</p>
            <p className="font-semibold text-gray-900">{bookmark.jobTitle}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-600">Company</p>
            <p className="font-semibold text-gray-900">{bookmark.company}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-600">Platform</p>
            <div className="mt-1">
              <PlatformBadge platform={bookmark.platform} />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Application Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            {APP_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-[#d4622a] text-white rounded-md hover:bg-[#2a2118] disabled:opacity-50"
          >
            {loading ? 'Converting...' : 'Convert'}
          </button>
        </div>
      </div>
    </div>
  );
}
