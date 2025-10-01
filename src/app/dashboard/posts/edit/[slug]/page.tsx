"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import BlogForm from '@/components/dashboard/BlogForm';

interface Blog {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage?: string;
  author: {
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    social?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
      website?: string;
    };
  };
  status: 'draft' | 'published';
  featured: boolean;
  readTime?: number;
  lineSpacing?: string;
}

export default function EditBlogPost() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleClose = () => {
    router.push('/dashboard/posts');
  };

  const handleBack = () => {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to posts page if no history
      router.push('/dashboard/posts');
    }
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const slug = encodeURIComponent(String(params.slug || ''));
        const response = await fetch(`/api/blogs/${slug}`, { cache: 'no-store' });
        const data = await response.json();

        if (data.success && data.data) {
          // Map MongoDB _id to id for compatibility
          const blogData = {
            ...data.data,
            id: data.data._id || data.data.id
          };
          setBlog(blogData);
        } else {
          throw new Error(data.error || data.message || 'Failed to fetch blog post');
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch blog post. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchBlog();
    } else {
      setError('Blog slug is missing');
      setLoading(false);
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button Header */}
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-40 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button Header */}
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Error Loading Blog Post</h3>
            <p>{error}</p>
            <div className="mt-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Back to Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button Header */}
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Blog Post Not Found</h3>
            <p>The requested blog post could not be found or may have been deleted.</p>
            <div className="mt-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Back to Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        key={`edit-blog-form-${blog._id}`}
        mode="edit"
        initialData={blog}
        onClose={handleClose}
      />
    </div>
  );
}