"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import BlogForm from '@/components/dashboard/BlogForm';

export default function NewBlogPost() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/dashboard/posts');
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard/posts');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      {/* Back Button Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
      
      <BlogForm 
        key="new-blog-form"
        mode="create" 
        onClose={handleClose}
      />
    </div>
  );
}