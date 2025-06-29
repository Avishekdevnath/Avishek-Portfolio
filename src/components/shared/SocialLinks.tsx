"use client";

import React from 'react';
import { FaGlobe, FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { useSettings } from '@/hooks/useSettings';

interface SocialLinksProps {
  className?: string;
  iconClassName?: string;
  showLabels?: boolean;
}

const PLATFORM_ICONS = {
  website: FaGlobe,
  github: FaGithub,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
  instagram: FaInstagram,
  youtube: FaYoutube
} as const;

const PLATFORM_COLORS = {
  website: 'bg-blue-500 hover:bg-blue-600',
  github: 'bg-gray-800 hover:bg-gray-900',
  linkedin: 'bg-blue-600 hover:bg-blue-700',
  twitter: 'bg-sky-500 hover:bg-sky-600',
  instagram: 'bg-pink-600 hover:bg-pink-700',
  youtube: 'bg-red-600 hover:bg-red-700'
} as const;

const PLATFORM_LABELS = {
  website: 'Website',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  instagram: 'Instagram',
  youtube: 'YouTube'
} as const;

export default function SocialLinks({ 
  className = '', 
  iconClassName = 'w-5 h-5',
  showLabels = false 
}: SocialLinksProps) {
  const { settings, loading } = useSettings();

  if (loading || !settings) {
    return (
      <div className={`flex gap-4 animate-pulse ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  const socialLinks = settings.socialLinks.filter(link => link.url.trim() !== '');

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {socialLinks.map((link) => {
        const Icon = PLATFORM_ICONS[link.platform];
        const color = PLATFORM_COLORS[link.platform];
        const label = PLATFORM_LABELS[link.platform];

        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 text-white ${color} rounded-lg p-3 transition-all duration-300 transform hover:-translate-y-1`}
            title={label}
          >
            <Icon className={iconClassName} />
            {showLabels && (
              <span className="text-sm font-medium">{label}</span>
            )}
          </a>
        );
      })}
    </div>
  );
} 