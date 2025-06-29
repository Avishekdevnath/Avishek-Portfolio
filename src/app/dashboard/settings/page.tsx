"use client";

import { User, Mail, Globe, Github, Linkedin, Twitter, Instagram, Youtube, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ISettings, ISocialLink, IContactInfo } from '@/models/Settings';
import { useToast } from '@/context/ToastContext';

const SOCIAL_PLATFORMS = [
  { platform: 'website', icon: Globe, label: 'Website', placeholder: 'https://yourwebsite.com' },
  { platform: 'github', icon: Github, label: 'GitHub', placeholder: 'https://github.com/username' },
  { platform: 'linkedin', icon: Linkedin, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { platform: 'twitter', icon: Twitter, label: 'Twitter', placeholder: 'https://twitter.com/username' },
  { platform: 'instagram', icon: Instagram, label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { platform: 'youtube', icon: Youtube, label: 'YouTube', placeholder: 'https://youtube.com/@username' },
] as const;

export default function SettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Partial<ISettings>>({
    fullName: '',
    bio: '',
    contactInfo: {
      email: '',
      phone: '',
      location: '',
      responseTime: 'Within 24 hours'
    },
    socialLinks: [],
    websiteSettings: {
      siteTitle: '',
      metaDescription: '',
      enableDarkMode: false
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      showToast({
        title: 'Error',
        description: 'Failed to load settings. Please try again.',
        status: 'error',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: 'contactInfo' | 'websiteSettings'
  ) => {
    const { name, value, type } = e.target;
    
    setSettings(prev => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
          }
        };
      }
      return {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      };
    });
  };

  const handleSocialLinkChange = (platform: string, url: string) => {
    setSettings(prev => {
      const existingLinks = prev.socialLinks || [];
      const linkIndex = existingLinks.findIndex(link => link.platform === platform);
      
      if (linkIndex >= 0) {
        const newLinks = [...existingLinks];
        newLinks[linkIndex] = { ...newLinks[linkIndex], url };
        return { ...prev, socialLinks: newLinks };
      } else {
        return {
          ...prev,
          socialLinks: [...existingLinks, { platform, url } as ISocialLink]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        showToast({
          title: 'Success',
          description: 'Settings saved successfully',
          status: 'success',
          duration: 3000
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        status: 'error',
        duration: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your profile and website settings</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                {settings.profileImage ? (
                  <img
                    src={settings.profileImage}
                    alt={settings.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-gray-400" />
                )}
              </div>
              <div>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Change Photo
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Recommended: Square JPG, PNG, or GIF, at least 500px
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={settings.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={settings.contactInfo?.email}
                  onChange={(e) => handleInputChange(e, 'contactInfo')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={settings.contactInfo?.phone}
                  onChange={(e) => handleInputChange(e, 'contactInfo')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={settings.contactInfo?.location}
                  onChange={(e) => handleInputChange(e, 'contactInfo')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City, Country"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Time
                </label>
                <input
                  type="text"
                  name="responseTime"
                  value={settings.contactInfo?.responseTime}
                  onChange={(e) => handleInputChange(e, 'contactInfo')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Within 24 hours"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={settings.bio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Write a short bio about yourself..."
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Social Links</h2>
          <div className="space-y-4">
            {SOCIAL_PLATFORMS.map((social) => {
              const Icon = social.icon;
              const currentLink = settings.socialLinks?.find(
                link => link.platform === social.platform
              );
              
              return (
                <div key={social.platform} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Icon size={20} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {social.label}
                    </label>
                    <input
                      type="url"
                      value={currentLink?.url || ''}
                      onChange={(e) => handleSocialLinkChange(social.platform, e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={social.placeholder}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Website Settings */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Website Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Title
              </label>
              <input
                type="text"
                name="siteTitle"
                value={settings.websiteSettings?.siteTitle}
                onChange={(e) => handleInputChange(e, 'websiteSettings')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your Portfolio"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={settings.websiteSettings?.metaDescription}
                onChange={(e) => handleInputChange(e, 'websiteSettings')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="A brief description of your portfolio for search engines..."
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="enableDarkMode"
                  checked={settings.websiteSettings?.enableDarkMode}
                  onChange={(e) => handleInputChange(e, 'websiteSettings')}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable dark mode</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 