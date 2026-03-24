'use client';

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: '#0A66C2',
  indeed: '#003DA5',
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

interface Props {
  platform: string;
}

export default function PlatformBadge({ platform }: Props) {
  const color = PLATFORM_COLORS[platform.toLowerCase()] || PLATFORM_COLORS.others;
  const displayName = platform
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return (
    <span
      className="inline-block px-2 py-1 text-xs font-semibold text-white rounded"
      style={{ backgroundColor: color }}
    >
      {displayName}
    </span>
  );
}
