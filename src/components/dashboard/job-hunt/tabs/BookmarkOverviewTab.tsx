'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Bell, CheckCircle, Circle } from 'lucide-react';
import type { BookmarkDetailItem } from '@/types/job-hunt';

interface Props {
  bookmark: BookmarkDetailItem;
  onUpdate: (updated: Partial<BookmarkDetailItem>) => void;
}

export default function BookmarkOverviewTab({ bookmark, onUpdate }: Props) {
  const [resumeLink, setResumeLink] = useState(bookmark.resumeLink || '');
  const [notes, setNotes] = useState(bookmark.notes || '');
  const [followUpDate, setFollowUpDate] = useState(
    bookmark.followUpDate ? new Date(bookmark.followUpDate).toISOString().slice(0, 10) : ''
  );
  const [followUpDone, setFollowUpDone] = useState(bookmark.followUpDone ?? false);
  const [saving, setSaving] = useState<string | null>(null);

  const patch = async (field: string, value: any, label: string) => {
    setSaving(field);
    try {
      const res = await fetch(`/api/job-hunt/bookmarks/${bookmark._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate({ [field]: value } as Partial<BookmarkDetailItem>);
        toast.success(`${label} saved`);
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(null);
    }
  };

  const toggleFollowUpDone = async () => {
    const newVal = !followUpDone;
    setFollowUpDone(newVal);
    await patch('followUpDone', newVal, 'Follow-up');
  };

  return (
    <div className="space-y-5">
      {/* Resume Link */}
      <div>
        <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1">
          Resume Link / Version Used
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={resumeLink}
            onChange={(e) => setResumeLink(e.target.value)}
            placeholder="https://drive.google.com/... or version name"
            className="flex-1 bg-[#faf8f4] border border-[#e8e3db] rounded-lg px-3 py-2 text-sm text-[#2a2118] focus:outline-none focus:ring-1 focus:ring-[#d4622a]"
          />
          <button
            onClick={() => patch('resumeLink', resumeLink, 'Resume link')}
            disabled={saving === 'resumeLink'}
            className="px-3 py-2 bg-[#d4622a] text-white text-xs rounded-lg hover:bg-[#c04d1a] disabled:opacity-50"
          >
            {saving === 'resumeLink' ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Follow-up tracker */}
      <div className="bg-[#faf8f4] border border-[#e8e3db] rounded-xl p-4 space-y-3">
        <p className="text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] flex items-center gap-1.5">
          <Bell size={12} /> Follow-up Tracker
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-xs text-[#6b5c4e] mb-1">Follow-up Date</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              onBlur={() => patch('followUpDate', followUpDate || null, 'Follow-up date')}
              className="bg-white border border-[#ddd5c5] rounded-lg px-2.5 py-1.5 text-sm text-[#2a2118] focus:outline-none focus:ring-1 focus:ring-[#d4622a]"
            />
          </div>
          <button
            onClick={toggleFollowUpDone}
            className="flex items-center gap-2 mt-4 text-sm text-[#4a3728]"
          >
            {followUpDone
              ? <CheckCircle size={18} className="text-green-500" />
              : <Circle size={18} className="text-[#c0b8ae]" />}
            {followUpDone ? 'Followed up' : 'Not followed up yet'}
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Any notes about this bookmark…"
          className="w-full bg-[#faf8f4] border border-[#e8e3db] rounded-lg px-3 py-2 text-sm text-[#2a2118] focus:outline-none focus:ring-1 focus:ring-[#d4622a] resize-none"
        />
        {notes !== (bookmark.notes || '') && (
          <button
            onClick={() => patch('notes', notes, 'Notes')}
            disabled={saving === 'notes'}
            className="mt-2 px-3 py-1.5 bg-[#d4622a] text-white text-xs rounded-lg hover:bg-[#c04d1a] disabled:opacity-50"
          >
            {saving === 'notes' ? 'Saving…' : 'Save Notes'}
          </button>
        )}
      </div>
    </div>
  );
}
