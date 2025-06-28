"use client";

import BlogForm from '@/components/dashboard/BlogForm';

export default function NewBlogPost() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <BlogForm mode="create" />
    </div>
  );
}