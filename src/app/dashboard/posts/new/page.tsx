"use client";

import { useRouter } from 'next/navigation';
import BlogForm from '@/components/dashboard/BlogForm';

export default function NewBlogPost() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/dashboard/posts');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <BlogForm 
        key="new-blog-form"
        mode="create" 
        onClose={handleClose}
      />
    </div>
  );
}