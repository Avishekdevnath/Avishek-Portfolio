"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaImage, FaTimes, FaEye, FaCode, FaPalette, FaPlus, FaUser, FaSearch } from 'react-icons/fa';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

interface BlogFormProps {
  initialData?: {
    id?: string;
    _id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    coverImageId?: string;
    category: string;
    tags: string[];
    author: {
      name: string;
      email?: string;
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
    publishedAt?: string;
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
    structuredData?: Record<string, unknown>;
    lineSpacing?: string;
  };
  mode: 'create' | 'edit';
  onClose: () => void;
}

const categories = ['General', 'Technology', 'Programming', 'Web Development', 'Career'];
const RichTextEditor = dynamic(() => import('@/components/shared/RichTextEditor'), { ssr: false });

export default function BlogForm({ initialData, mode, onClose }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.coverImage || null);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [showSeoFields, setShowSeoFields] = useState(false);
  const [showAuthorFields, setShowAuthorFields] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [authorName, setAuthorName] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    coverImage: initialData?.coverImage || '',
    coverImageId: initialData?.coverImageId || '',
    category: initialData?.category || 'General',
    tags: initialData?.tags || [],
    author: {
      name: initialData?.author?.name || authorName || 'Portfolio Admin',
      email: initialData?.author?.email || '',
      bio: initialData?.author?.bio || '',
      avatar: initialData?.author?.avatar || '',
      social: {
        twitter: initialData?.author?.social?.twitter || '',
        linkedin: initialData?.author?.social?.linkedin || '',
        github: initialData?.author?.social?.github || '',
        website: initialData?.author?.social?.website || '',
      }
    },
    status: initialData?.status || 'published',
    featured: initialData?.featured || false,
    publishedAt: initialData?.publishedAt || '',
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    canonicalUrl: initialData?.canonicalUrl || '',
    noIndex: initialData?.noIndex || false,
    structuredData: initialData?.structuredData || {},
    lineSpacing: initialData?.lineSpacing || '10',
  });

  // Fetch settings when component mounts and hydrate author defaults from DB
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data?.success && data?.data) {
          const s = data.data as any;
          const fullName = s.fullName || '';
          const email = s.contactInfo?.email || '';
          const bio = s.bio || '';
          const avatar = s.profileImage || '';

          if (fullName) setAuthorName(fullName);

          // Only auto-fill from settings when creating a new post
          setFormData(prev => {
            if (initialData) return prev; // editing - don't override
            return {
              ...prev,
              author: {
                ...prev.author,
                name: prev.author.name || fullName || 'Portfolio Admin',
                email: prev.author.email || email,
                bio: prev.author.bio || bio,
                avatar: prev.author.avatar || avatar,
                social: {
                  twitter: prev.author.social?.twitter || (s.socialLinks?.find((l: any) => l.platform === 'twitter')?.url || ''),
                  linkedin: prev.author.social?.linkedin || (s.socialLinks?.find((l: any) => l.platform === 'linkedin')?.url || ''),
                  github: prev.author.social?.github || (s.socialLinks?.find((l: any) => l.platform === 'github')?.url || ''),
                  website: prev.author.social?.website || (s.socialLinks?.find((l: any) => l.platform === 'website')?.url || ''),
                }
              }
            };
          });
        }
      } catch (error) {
        // Failed to fetch settings
      }
    };
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update author name when settings are fetched
  useEffect(() => {
    if (authorName && !initialData?.author?.name) {
      setFormData(prev => ({
        ...prev,
        author: {
          ...prev.author,
          name: authorName
        }
      }));
    }
  }, [authorName, initialData?.author?.name]);

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === 'create' && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, mode]);

  // Calculate reading time
  useEffect(() => {
    if (formData.content) {
      const text = formData.content as string;
      const wordsPerMinute = 200;
      const wordCount = text.trim().split(/\s+/).length;
      const readTime = Math.ceil(wordCount / wordsPerMinute);
      setFormData(prev => ({ ...prev, readTime }));
    }
  }, [formData.content]);

  // Handle publish date when status changes to published
  useEffect(() => {
    if (formData.status === 'published' && !formData.publishedAt) {
      setFormData(prev => ({ ...prev, publishedAt: new Date().toISOString() }));
    }
  }, [formData.status]);

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        throw new Error('Unsupported file type');
      }
      const maxSize = isImage ? 5 * 1024 * 1024 : 100 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File size must be less than ${isImage ? '5MB' : '100MB'}`);
      }
      const form = new FormData();
      form.append(isImage ? 'image' : 'video', file);
      const endpoint = isImage ? '/api/blogs/upload-image' : '/api/blogs/upload-video';
      const res = await fetch(endpoint, { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) return data.url as string;
      throw new Error(data.error || 'Failed to upload');
    } catch (err) {
      // Media upload error
      toast.error(err instanceof Error ? err.message : 'Upload failed');
      throw err; // Re-throw the error instead of returning null
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const imageUrl = await handleImageUpload(file);
      setImagePreview(imageUrl);
      setFormData(prev => ({ ...prev, coverImage: imageUrl }));
      toast.success('Cover image uploaded successfully');
    } catch (error) {
      // Cover image upload error
      toast.error(error instanceof Error ? error.message : 'Failed to upload cover image');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      try {
        setLoading(true);
        const imageUrl = await handleImageUpload(file);
        setImagePreview(imageUrl);
        setFormData(prev => ({ ...prev, coverImage: imageUrl }));
        toast.success('Cover image uploaded successfully');
      } catch (error) {
        // Cover image upload error
        toast.error(error instanceof Error ? error.message : 'Failed to upload cover image');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = currentTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateContent = (content: string): { isValid: boolean; error?: string } => {
    if (!content || !content.trim()) {
      return { isValid: false, error: 'Content must not be empty' };
    }
    return { isValid: true };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate required fields
    const missingFields: string[] = [];
    
    if (!formData.title?.trim()) missingFields.push('Title');
    if (!formData.excerpt?.trim()) missingFields.push('Excerpt');
    if (!formData.category?.trim()) missingFields.push('Category');
    if (!formData.author?.name?.trim()) missingFields.push('Author Name');

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate content format and length
    const contentValidation = validateContent(formData.content);
    if (!contentValidation.isValid) {
      setError(contentValidation.error || 'Invalid content');
      setLoading(false);
      toast.error(contentValidation.error || 'Invalid content');
      return;
    }

    try {
      const editSlug = initialData?.slug || initialData?._id;
      const endpoint = mode === 'create' ? '/api/blogs' : `/api/blogs/${encodeURIComponent(String(editSlug || ''))}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      // Generate structured data if not provided
      if (!formData.structuredData || Object.keys(formData.structuredData).length === 0) {
        const structuredData = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": formData.metaTitle || formData.title,
          "description": formData.metaDescription || formData.excerpt,
          "author": {
            "@type": "Person",
            "name": formData.author.name,
            "url": formData.author.social?.website
          },
          "datePublished": formData.publishedAt,
          "dateModified": new Date().toISOString(),
          "image": formData.coverImage,
          "publisher": {
            "@type": "Organization",
            "name": "Avishek Portfolio",
            "logo": {
              "@type": "ImageObject",
              "url": "/logo.png"
            }
          }
        };
        setFormData(prev => ({ ...prev, structuredData }));
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (data.success) {
        setSuccess(mode === 'create' ? 'Blog post created successfully!' : 'Blog post updated successfully!');
        toast.success(mode === 'create' ? 'Blog post created!' : 'Blog post updated!');
        router.refresh();
        onClose();
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (error) {
      // Form submission error
      setError(error instanceof Error ? error.message : 'Failed to save blog post');
      toast.error(error instanceof Error ? error.message : 'Failed to save blog post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
            !formData.title ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter blog post title"
          required
        />
        {!formData.title && (
          <p className="mt-1 text-sm text-red-500">Title is required</p>
        )}
      </div>

      {/* Author Settings */}
      <div className="border-t pt-6">
        <button
          type="button"
          onClick={() => setShowAuthorFields(!showAuthorFields)}
          className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
        >
          <FaUser className="w-4 h-4" />
          <span className="font-medium">Author Settings</span>
          <span className="text-sm text-gray-500">({showAuthorFields ? 'Hide' : 'Show'})</span>
        </button>
        
        {showAuthorFields && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.author.name}
                onChange={(e) => setFormData({
                  ...formData,
                  author: { ...formData.author, name: e.target.value }
                })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  !formData.author.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter author name"
                required
              />
              {!formData.author.name && (
                <p className="mt-1 text-sm text-red-500">Author name is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.author.email}
                onChange={(e) => setFormData({
                  ...formData,
                  author: { ...formData.author, email: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter author email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.author.bio}
                onChange={(e) => setFormData({
                  ...formData,
                  author: { ...formData.author, bio: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={3}
                placeholder="Enter author bio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                value={formData.author.avatar}
                onChange={(e) => setFormData({
                  ...formData,
                  author: { ...formData.author, avatar: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter avatar URL"
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Social Links</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter Profile
                </label>
                <input
                  type="url"
                  value={formData.author.social?.twitter}
                  onChange={(e) => setFormData({
                    ...formData,
                    author: {
                      ...formData.author,
                      social: { ...formData.author.social, twitter: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Twitter profile URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={formData.author.social?.linkedin}
                  onChange={(e) => setFormData({
                    ...formData,
                    author: {
                      ...formData.author,
                      social: { ...formData.author.social, linkedin: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="LinkedIn profile URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  value={formData.author.social?.github}
                  onChange={(e) => setFormData({
                    ...formData,
                    author: {
                      ...formData.author,
                      social: { ...formData.author.social, github: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="GitHub profile URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Website
                </label>
                <input
                  type="url"
                  value={formData.author.social?.website}
                  onChange={(e) => setFormData({
                    ...formData,
                    author: {
                      ...formData.author,
                      social: { ...formData.author.social, website: e.target.value }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Personal website URL"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={formData.content}
          onChange={(html: string) => setFormData(prev => ({ ...prev, content: html }))}
          lineSpacing={formData.lineSpacing}
          onLineSpacingChange={(lineSpacing: string) => setFormData(prev => ({ ...prev, lineSpacing }))}
          minHeight="300px"
        />
        {!formData.content && (
          <p className="mt-1 text-sm text-red-500">Content is required</p>
        )}
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Excerpt <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
            !formData.excerpt ? 'border-red-300' : 'border-gray-300'
          }`}
          rows={3}
          placeholder="Enter a brief excerpt of your blog post"
          required
        />
        {!formData.excerpt && (
          <p className="mt-1 text-sm text-red-500">Excerpt is required</p>
        )}
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors duration-200 ${
                isDragging 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-400'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="cover-image"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="cover-image"
                      name="cover-image"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                {loading && (
                  <div className="mt-2 text-sm text-purple-600">
                    <span className="animate-spin inline-block mr-2">⌛</span>
                    Uploading...
                  </div>
                )}
              </div>
            </div>
          </div>
          {imagePreview && (
            <div className="relative w-24 h-24">
              <Image
                src={imagePreview}
                alt="Cover image preview"
                fill
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setFormData(prev => ({ ...prev, coverImage: '' }));
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <FaTimes size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
            !formData.category ? 'border-red-300' : 'border-gray-300'
          }`}
          required
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {!formData.category && (
          <p className="mt-1 text-sm text-red-500">Category is required</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 inline-flex items-center justify-center"
              >
                <FaTimes size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Add a tag"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <FaPlus size={16} />
          </button>
        </div>
      </div>

      {/* Status and Featured */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-600">Featured</span>
          </label>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="border-t pt-6">
        <button
          type="button"
          onClick={() => setShowSeoFields(!showSeoFields)}
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <FaSearch className="w-4 h-4" />
          <span className="font-medium">SEO Settings</span>
          <span className="text-sm text-gray-500">({showSeoFields ? 'Hide' : 'Show'})</span>
        </button>
        
        {showSeoFields && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter meta title for SEO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={3}
                placeholder="Enter meta description for SEO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canonical URL
              </label>
              <input
                type="url"
                value={formData.canonicalUrl}
                onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter canonical URL if this is a duplicate"
              />
            </div>

            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.noIndex}
                  onChange={(e) => setFormData({ ...formData, noIndex: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-600">Prevent search engines from indexing this post</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {/* Success Message */}
      {success && (
        <div className="text-green-500 text-sm">{success}</div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="animate-spin">⌛</span>
              Saving...
            </>
          ) : (
            <>
              <FaSave />
              Save
            </>
          )}
        </button>
      </div>
    </form>
  );
} 