'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'analysis', label: 'Job Analysis' },
  { key: 'people', label: 'Key People' },
  { key: 'outreach', label: 'Outreach' },
  { key: 'notes', label: 'Notes' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

interface Props {
  applicationId: string;
}

export default function ApplicationDetailTabs({ applicationId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabKey) || 'overview';

  const navigate = (tab: TabKey) => {
    router.push(`/dashboard/job-hunt/applications/${applicationId}?tab=${tab}`);
  };

  return (
    <div className="flex gap-1 border-b border-[#e8e3db]">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => navigate(tab.key)}
          className={`px-4 py-2.5 text-[0.82rem] font-medium transition-colors border-b-2 -mb-px ${
            activeTab === tab.key
              ? 'border-[#d4622a] text-[#d4622a]'
              : 'border-transparent text-[#8a7a6a] hover:text-[#2a2118]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
