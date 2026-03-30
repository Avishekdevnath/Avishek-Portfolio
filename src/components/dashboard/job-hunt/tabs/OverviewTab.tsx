'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { APPLICATION_STATUSES, JOB_TYPES } from '@/lib/job-hunt-utils';
import type { JobApplicationItem } from '@/types/job-hunt';
import StatusTimeline from '../StatusTimeline';

interface Props {
  application: JobApplicationItem;
  onUpdate: (updated: Partial<JobApplicationItem>) => void;
}

interface InlineFieldProps {
  label: string;
  value: string;
  onSave: (val: string) => Promise<void>;
  type?: 'text' | 'url' | 'date' | 'email';
  placeholder?: string;
}

function InlineField({ label, value, onSave, type = 'text', placeholder }: InlineFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (draft === value) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div>
        <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1">{label}</label>
        <input
          type={type}
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
          disabled={saving}
          placeholder={placeholder}
          className="w-full bg-[#faf8f4] border border-[#d4622a] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:ring-1 focus:ring-[#d4622a]"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1">{label}</label>
      <button
        onClick={() => { setDraft(value); setEditing(true); }}
        className="w-full text-left bg-[#faf8f4] border border-[#e8e3db] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] hover:border-[#d4622a] transition-colors"
      >
        {value || <span className="text-[#c0b8ae] italic">{placeholder || 'Click to edit'}</span>}
      </button>
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  onSave: (val: string) => Promise<void>;
}

function SelectField({ label, value, options, onSave }: SelectFieldProps) {
  const [saving, setSaving] = useState(false);

  const handleChange = async (newVal: string) => {
    if (newVal === value) return;
    setSaving(true);
    try { await onSave(newVal); } finally { setSaving(false); }
  };

  return (
    <div>
      <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1">{label}</label>
      <select
        value={value}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full bg-[#faf8f4] border border-[#e8e3db] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:ring-1 focus:ring-[#d4622a]"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function OverviewTab({ application, onUpdate }: Props) {
  const patch = async (field: string, value: string) => {
    try {
      const res = await fetch(`/api/job-hunt/applications/${application._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdate({ [field]: value } as Partial<JobApplicationItem>);
        toast.success('Saved');
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InlineField label="Company" value={application.company} onSave={(v) => patch('company', v)} placeholder="Company name" />
        <InlineField label="Job Title" value={application.jobTitle} onSave={(v) => patch('jobTitle', v)} placeholder="Job title" />
        <InlineField label="Job URL" value={application.jobUrl || ''} onSave={(v) => patch('jobUrl', v)} type="url" placeholder="https://..." />
        <InlineField label="Location" value={application.location || ''} onSave={(v) => patch('location', v)} placeholder="City, Remote, etc." />
        <InlineField label="Salary Range" value={application.salaryRange || ''} onSave={(v) => patch('salaryRange', v)} placeholder="e.g. $80k–$100k" />
        <InlineField label="Date Applied" value={application.dateApplied ? application.dateApplied.slice(0, 10) : ''} onSave={(v) => patch('dateApplied', v)} type="date" />
        <SelectField label="Status" value={application.status} options={APPLICATION_STATUSES} onSave={(v) => patch('status', v)} />
        <SelectField label="Job Type" value={application.jobType || ''} options={['', ...JOB_TYPES]} onSave={(v) => patch('jobType', v)} />
        <InlineField label="Contact Name" value={application.contactName || ''} onSave={(v) => patch('contactName', v)} placeholder="Recruiter name" />
        <InlineField label="Contact Email" value={application.contactEmail || ''} onSave={(v) => patch('contactEmail', v)} type="email" placeholder="recruiter@company.com" />
        <div className="sm:col-span-2">
          <InlineField label="Resume Link" value={application.resumeLink || ''} onSave={(v) => patch('resumeLink', v)} type="url" placeholder="https://drive.google.com/…" />
        </div>
      </div>

      {/* Notes — full width textarea */}
      <div>
        <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1">Notes</label>
        <NotesTextarea value={application.notes || ''} onSave={(v) => patch('notes', v)} />
      </div>

      <StatusTimeline history={application.statusHistory || []} />
    </div>
  );
}

function NotesTextarea({ value, onSave }: { value: string; onSave: (v: string) => Promise<void> }) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const dirty = draft !== value;

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    try { await onSave(draft); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        placeholder="Add application notes..."
        className="w-full bg-[#faf8f4] border border-[#e8e3db] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:ring-1 focus:ring-[#d4622a] resize-none"
      />
      {dirty && (
        <button
          onClick={save}
          disabled={saving}
          className="px-3 py-1.5 bg-[#d4622a] text-white text-xs rounded-lg hover:bg-[#c04d1a] disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Notes'}
        </button>
      )}
    </div>
  );
}
