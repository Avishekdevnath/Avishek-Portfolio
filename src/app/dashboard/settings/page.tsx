"use client";

import { User, Mail, Globe, Github, Linkedin, Twitter, Instagram, Youtube, Loader2, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ISettings, ISocialLink, IContactInfo, IOutreachSettings } from '@/models/Settings';
import { useToast } from '@/context/ToastContext';

const SOCIAL_PLATFORMS = [
  { platform: 'website', icon: Globe, label: 'Website', placeholder: 'https://yourwebsite.com' },
  { platform: 'github', icon: Github, label: 'GitHub', placeholder: 'https://github.com/username' },
  { platform: 'linkedin', icon: Linkedin, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { platform: 'twitter', icon: Twitter, label: 'Twitter', placeholder: 'https://twitter.com/username' },
  { platform: 'instagram', icon: Instagram, label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { platform: 'youtube', icon: Youtube, label: 'YouTube', placeholder: 'https://youtube.com/@username' },
] as const;

const inputCls = 'w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20';
const labelCls = 'block text-[0.75rem] font-mono tracking-[0.08em] uppercase text-[#8a7a6a] mb-1.5';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    resumeUrl: '/assets/resume.pdf',
    portfolioUrl: '',
    websiteSettings: {
      siteTitle: '',
      metaDescription: '',
      enableDarkMode: false
    },
    outreachSettings: {
      defaultTone: 'professional',
      defaultFollowUpGapDays: 7,
      maxFollowUps: 2,
      signatureSnippet: ''
    }
  });

  useEffect(() => { fetchSettings(); }, []);

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
      showToast({ title: 'Error', description: 'Failed to load settings. Please try again.', status: 'error', duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    section?: 'contactInfo' | 'websiteSettings' | 'outreachSettings'
  ) => {
    const { name, value, type } = e.target;
    setSettings(prev => {
      if (section) {
        return { ...prev, [section]: { ...(prev[section] as object || {}), [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value } };
      }
      return { ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value };
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
        return { ...prev, socialLinks: [...existingLinks, { platform, url } as ISocialLink] };
      }
    });
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast({ title: 'Error', description: 'Please select an image file', status: 'error', duration: 3000 });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast({ title: 'Error', description: 'Image size must be less than 5MB', status: 'error', duration: 3000 });
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, profileImage: data.url }));
        showToast({ title: 'Success', description: 'Profile picture uploaded successfully', status: 'success', duration: 3000 });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      showToast({ title: 'Error', description: 'Failed to upload image. Please try again.', status: 'error', duration: 5000 });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (data.success) {
        showToast({ title: 'Success', description: 'Settings saved successfully', status: 'success', duration: 3000 });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      showToast({ title: 'Error', description: 'Failed to save settings. Please try again.', status: 'error', duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">

      {/* Profile Settings */}
      <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e8e3db]">
          <p className="text-[0.875rem] font-semibold text-[#2a2118]">Profile</p>
        </div>
        <div className="p-5 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#f3f1ee] border border-[#e8e3db] flex items-center justify-center overflow-hidden flex-shrink-0">
              {settings.profileImage ? (
                <img src={settings.profileImage} alt={settings.fullName} className="w-full h-full object-cover" />
              ) : (
                <User size={28} className="text-[#8a7a6a]" />
              )}
            </div>
            <div>
              <input type="file" id="profileImage" accept="image/*" onChange={handleProfileImageUpload} className="hidden" />
              <label
                htmlFor="profileImage"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors cursor-pointer"
              >
                {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</> : 'Change Photo'}
              </label>
              <p className="text-[0.72rem] text-[#8a7a6a] mt-1.5">Square JPG/PNG, at least 500px · Max 5MB</p>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input type="text" name="fullName" value={settings.fullName} onChange={handleInputChange} className={inputCls} placeholder="John Doe" required />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" name="email" value={settings.contactInfo?.email} onChange={(e) => handleInputChange(e, 'contactInfo')} className={inputCls} placeholder="john@example.com" required />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input type="tel" name="phone" value={settings.contactInfo?.phone} onChange={(e) => handleInputChange(e, 'contactInfo')} className={inputCls} placeholder="+1 (555) 123-4567" required />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input type="text" name="location" value={settings.contactInfo?.location} onChange={(e) => handleInputChange(e, 'contactInfo')} className={inputCls} placeholder="City, Country" required />
            </div>
            <div>
              <label className={labelCls}>Response Time</label>
              <input type="text" name="responseTime" value={settings.contactInfo?.responseTime} onChange={(e) => handleInputChange(e, 'contactInfo')} className={inputCls} placeholder="Within 24 hours" required />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Bio</label>
              <textarea name="bio" value={settings.bio} onChange={handleInputChange} className={`${inputCls} resize-none`} rows={4} placeholder="Write a short bio about yourself..." required />
            </div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e8e3db]">
          <p className="text-[0.875rem] font-semibold text-[#2a2118]">Social Links</p>
        </div>
        <div className="p-5 space-y-3">
          {SOCIAL_PLATFORMS.map((social) => {
            const Icon = social.icon;
            const currentLink = settings.socialLinks?.find(link => link.platform === social.platform);
            return (
              <div key={social.platform} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#f3f1ee] flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-[#6b5c4e]" />
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={currentLink?.url || ''}
                    onChange={(e) => handleSocialLinkChange(social.platform, e.target.value)}
                    className={inputCls}
                    placeholder={social.placeholder}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resume & Portfolio */}
      <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e8e3db]">
          <p className="text-[0.875rem] font-semibold text-[#2a2118]">Resume & Portfolio</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Resume URL</label>
            <input type="text" name="resumeUrl" value={settings.resumeUrl || ''} onChange={handleInputChange} className={inputCls} placeholder="/assets/resume.pdf or https://..." />
            <p className="text-[0.72rem] text-[#8a7a6a] mt-1">Path to your resume file (e.g., /assets/resume.pdf) or external URL</p>
          </div>
          <div>
            <label className={labelCls}>Portfolio URL</label>
            <input type="url" name="portfolioUrl" value={settings.portfolioUrl || ''} onChange={handleInputChange} className={inputCls} placeholder="https://yourportfolio.com" />
          </div>
        </div>
      </div>

      {/* Website Settings */}
      <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e8e3db]">
          <p className="text-[0.875rem] font-semibold text-[#2a2118]">Website Settings</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Site Title</label>
            <input type="text" name="siteTitle" value={settings.websiteSettings?.siteTitle} onChange={(e) => handleInputChange(e, 'websiteSettings')} className={inputCls} placeholder="Your Portfolio" required />
          </div>
          <div>
            <label className={labelCls}>Meta Description</label>
            <textarea name="metaDescription" value={settings.websiteSettings?.metaDescription} onChange={(e) => handleInputChange(e, 'websiteSettings')} className={`${inputCls} resize-none`} rows={3} placeholder="A brief description for search engines..." required />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="enableDarkMode"
              checked={settings.websiteSettings?.enableDarkMode}
              onChange={(e) => handleInputChange(e, 'websiteSettings')}
              className="w-4 h-4 rounded"
              style={{ accentColor: '#d4622a' }}
            />
            <span className="text-[0.82rem] text-[#4a3728]">Enable dark mode</span>
          </label>
        </div>
      </div>

      {/* Outreach Settings */}
      <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e8e3db] flex items-center gap-2">
          <Settings size={14} className="text-[#8a7a6a]" />
          <p className="text-[0.875rem] font-semibold text-[#2a2118]">Outreach Settings</p>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-[0.78rem] text-[#8a7a6a]">Configure defaults for your cold outreach workflow.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Default Tone</label>
              <select name="defaultTone" value={settings.outreachSettings?.defaultTone || 'professional'} onChange={(e) => handleInputChange(e, 'outreachSettings')} className={inputCls}>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Follow-up Gap (days)</label>
              <input type="number" name="defaultFollowUpGapDays" value={settings.outreachSettings?.defaultFollowUpGapDays || 7} onChange={(e) => handleInputChange(e, 'outreachSettings')} className={inputCls} min={1} max={30} />
            </div>
            <div>
              <label className={labelCls}>Max Follow-ups</label>
              <input type="number" name="maxFollowUps" value={settings.outreachSettings?.maxFollowUps || 2} onChange={(e) => handleInputChange(e, 'outreachSettings')} className={inputCls} min={0} max={5} />
            </div>
            <div>
              <label className={labelCls}>Email Signature</label>
              <textarea name="signatureSnippet" value={settings.outreachSettings?.signatureSnippet || ''} onChange={(e) => handleInputChange(e, 'outreachSettings')} className={`${inputCls} resize-none`} rows={3} placeholder={`Best regards,\nJohn Doe`} />
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

    </form>
  );
}
