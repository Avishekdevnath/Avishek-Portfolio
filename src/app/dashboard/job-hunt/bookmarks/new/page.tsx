'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import BookmarkForm from '@/components/dashboard/BookmarkForm';

export default function NewBookmarkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/job-hunt/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'saved',
          bookmarkedDate: new Date(),
        }),
      });

      if (response.ok) {
        toast.success('Bookmark created successfully!');
        router.push('/dashboard/job-hunt/bookmarks');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create bookmark');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Bookmark</h1>
        <p className="text-gray-600">Save an interesting job posting for later</p>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <BookmarkForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard/job-hunt/bookmarks')}
        />
      </div>
    </div>
  );
}
