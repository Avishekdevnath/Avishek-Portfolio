'use client';

import { useEffect, useState } from 'react';

interface Platform {
  _id: string;
  name: string;
  description?: string;
  url?: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: '#0A66C2',
  indeed:' #003DA5',
  glassdoor: '#1B1C1D',
  'github jobs': '#24292E',
  angellist: '#000000',
  buildin: '#6366F1',
  wellfound: '#FF6B35',
  'stack overflow jobs': '#F48024',
  remoteok: '#00B4EF',
  weworkremotely: '#2E3E51',
  others: '#6B7280',
};

export default function PlatformSelector({
  value,
  onChange,
  required = false,
  placeholder = 'Select a platform...',
}: Props) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/job-hunt/platforms');
      const json = await response.json();
      if (json.success) {
        setPlatforms(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={loading}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
    >
      <option value="">{placeholder}</option>
      {platforms.map((platform) => (
        <option key={platform._id} value={platform.name}>
          {platform.name.charAt(0).toUpperCase() + platform.name.slice(1)}
        </option>
      ))}
    </select>
  );
}
