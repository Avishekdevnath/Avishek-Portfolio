'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, BellOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { JobApplicationItem } from '@/types/job-hunt';

const STATUS_COLORS: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-700',
  'Phone Screen': 'bg-purple-100 text-purple-700',
  Interview: 'bg-amber-100 text-amber-700',
  Offer: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  'No Response': 'bg-gray-100 text-gray-600',
};

interface Props {
  application: JobApplicationItem;
  onUpdate: (updated: Partial<JobApplicationItem>) => void;
}

export default function ApplicationDetailHeader({ application, onUpdate }: Props) {
  const reminderDate = application.followUpReminderAt
    ? new Date(application.followUpReminderAt).toISOString().slice(0, 10)
    : '';
  const [reminder, setReminder] = useState(reminderDate);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleReminderChange = (value: string) => {
    setReminder(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/job-hunt/applications/${application._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followUpReminderAt: value || null }),
        });
        const data = await res.json();
        if (data.success) {
          onUpdate({ followUpReminderAt: value || undefined });
          toast.success(value ? 'Reminder set' : 'Reminder cleared');
        } else {
          toast.error('Failed to save reminder');
        }
      } catch {
        toast.error('Failed to save reminder');
      }
    }, 600);
  };

  const hasReminder = !!reminder;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e8e3db]">
      <div className="flex items-start gap-3">
        <Link
          href="/dashboard/job-hunt/applications"
          className="mt-1 p-1.5 rounded-lg text-[#8a7a6a] hover:bg-[#f3f1ee] hover:text-[#2a2118] transition-colors shrink-0"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">
            {application.company}
          </p>
          <h1 className="text-lg font-semibold text-[#2a2118] leading-tight">{application.jobTitle}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[application.status] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {application.status}
            </span>
            {application.location && (
              <span className="text-xs text-[#8a7a6a]">{application.location}</span>
            )}
            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#d4622a] hover:underline font-mono"
              >
                View posting →
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Follow-up reminder */}
      <div className="flex items-center gap-2 sm:shrink-0">
        <span className={`transition-colors ${hasReminder ? 'text-amber-500' : 'text-[#c0b8ae]'}`}>
          {hasReminder ? <Bell size={16} /> : <BellOff size={16} />}
        </span>
        <div>
          <label className="block text-[0.6rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1">
            Follow-up reminder
          </label>
          <input
            type="date"
            value={reminder}
            onChange={(e) => handleReminderChange(e.target.value)}
            className="bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-2.5 py-1.5 text-[0.78rem] text-[#2a2118] focus:outline-none focus:ring-1 focus:ring-[#d4622a]"
          />
        </div>
      </div>
    </div>
  );
}
