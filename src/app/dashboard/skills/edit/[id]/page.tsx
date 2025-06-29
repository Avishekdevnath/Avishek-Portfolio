"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import IconSelector from '@/components/IconSelector';

const CATEGORIES = [
  'Core Languages',
  'Front End',
  'Back End',
  'Frameworks',
  'Tools',
  'Graphic Design',
  'Video Editing',
  'Office & Productivity',
  'Language'
] as const;

interface SkillFormData {
  name: string;
  category: typeof CATEGORIES[number];
  proficiency: number;
  icon: string;
  iconSet: string;
  description?: string;
  yearsOfExperience?: number;
  featured: boolean;
}

export default function EditSkillPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SkillFormData>({
    name: '',
    category: 'Front End',
    proficiency: 3,
    icon: '',
    iconSet: '',
    description: '',
    yearsOfExperience: undefined,
    featured: false
  });

  // Fetch skill data
  useEffect(() => {
    const fetchSkill = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/skills/${params.id}`);
        const { success, data, error } = await response.json();

        if (!success || !response.ok) {
          throw new Error(error || 'Failed to fetch skill');
        }

        if (!data) {
          throw new Error('Skill not found');
        }

        setFormData({
          name: data.name,
          category: data.category,
          proficiency: data.proficiency,
          icon: data.icon || '',
          iconSet: data.iconSet || '',
          description: data.description || '',
          yearsOfExperience: data.yearsOfExperience,
          featured: data.featured
        });
      } catch (error) {
        console.error('Error fetching skill:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch skill');
      } finally {
        setLoading(false);
      }
    };

    fetchSkill();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/skills/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const { success, error } = await response.json();

      if (!success || !response.ok) {
        throw new Error(error || 'Failed to update skill');
      }

      // Redirect to skills page
      router.push('/dashboard/skills');
      router.refresh(); // Refresh the page to update the skills list
    } catch (error) {
      console.error('Error updating skill:', error);
      setError(error instanceof Error ? error.message : 'Failed to update skill');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleIconChange = (value: { icon: string; iconSet: string }) => {
    setFormData(prev => ({
      ...prev,
      icon: value.icon,
      iconSet: value.iconSet
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/dashboard/skills"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Edit Skill</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., React.js"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Proficiency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proficiency Level *
              </label>
              <input
                type="number"
                name="proficiency"
                value={formData.proficiency}
                onChange={handleChange}
                min="1"
                max="5"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">Rate from 1 to 5</p>
            </div>

            {/* Icon Selector */}
            <div className="col-span-2">
              <IconSelector
                value={{ icon: formData.icon, iconSet: formData.iconSet }}
                onChange={handleIconChange}
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of your experience with this skill"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience || ''}
                onChange={handleChange}
                min="0"
                step="0.5"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Featured */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Featured Skill
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard/skills"
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 