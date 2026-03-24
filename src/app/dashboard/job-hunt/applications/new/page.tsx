"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { APPLICATION_STATUSES, JOB_TYPES } from '@/lib/job-hunt-utils';

interface FormState {
  company: string;
  jobTitle: string;
  jobUrl: string;
  dateApplied: string;
  status: string;
  jobType: string;
  location: string;
  salaryRange: string;
  contactName: string;
  contactEmail: string;
  notes: string;
}

const initialForm: FormState = {
  company: '',
  jobTitle: '',
  jobUrl: '',
  dateApplied: new Date().toISOString().slice(0, 10),
  status: 'Applied',
  jobType: '',
  location: '',
  salaryRange: '',
  contactName: '',
  contactEmail: '',
  notes: '',
};

export default function NewJobApplicationPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...form,
        dateApplied: new Date(form.dateApplied).toISOString(),
        jobType: form.jobType || undefined,
        jobUrl: form.jobUrl || undefined,
        location: form.location || undefined,
        salaryRange: form.salaryRange || undefined,
        contactName: form.contactName || undefined,
        contactEmail: form.contactEmail || undefined,
        notes: form.notes || undefined,
      };

      const response = await fetch('/api/job-hunt/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { success: boolean; error?: string };
      if (!data.success) throw new Error(data.error || 'Failed to create application');

      router.push('/dashboard/job-hunt/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create application');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'mt-1 w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a]';

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">Applications</p>
        <h1 className="text-[1.05rem] font-semibold text-[#2a2118] mt-1">Log New Application</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="bg-white border border-[#e8e3db] rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Company *</label>
          <input required value={form.company} onChange={(e) => updateField('company', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Job Title *</label>
          <input required value={form.jobTitle} onChange={(e) => updateField('jobTitle', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Date Applied *</label>
          <input type="date" required value={form.dateApplied} onChange={(e) => updateField('dateApplied', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Status *</label>
          <select value={form.status} onChange={(e) => updateField('status', e.target.value)} className={inputClass}>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Job Posting URL</label>
          <input value={form.jobUrl} onChange={(e) => updateField('jobUrl', e.target.value)} className={inputClass} placeholder="https://..." />
        </div>

        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Job Type</label>
          <select value={form.jobType} onChange={(e) => updateField('jobType', e.target.value)} className={inputClass}>
            <option value="">Select</option>
            {JOB_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Location</label>
          <input value={form.location} onChange={(e) => updateField('location', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Salary Range</label>
          <input value={form.salaryRange} onChange={(e) => updateField('salaryRange', e.target.value)} className={inputClass} placeholder="$80k - $100k" />
        </div>

        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Contact Name</label>
          <input value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Contact Email</label>
          <input value={form.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)} className={inputClass} type="email" />
        </div>

        <div className="md:col-span-2">
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Notes</label>
          <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} className={`${inputClass} min-h-[120px]`} />
        </div>

        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard/job-hunt/applications')}
            className="px-4 py-2 border border-[#ddd5c5] text-[#4a3728] rounded-lg text-[0.82rem]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
