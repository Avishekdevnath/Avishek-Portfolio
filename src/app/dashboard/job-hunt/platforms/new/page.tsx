'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import PlatformCombobox from '@/components/dashboard/PlatformCombobox';

export default function NewPlatformPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [needsReferral, setNeedsReferral] = useState(false);
  // Reputation fields
  const [publicReview, setPublicReview] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [reputationScore, setReputationScore] = useState('');
  const [remoteFocusScore, setRemoteFocusScore] = useState('');
  const [curationScore, setCurationScore] = useState('');
  const [payPotentialScore, setPayPotentialScore] = useState('');
  const [priorityScore, setPriorityScore] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Platform name is required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/job-hunt/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description || undefined,
          url: url || undefined,
          note: note || undefined,
          needsReferral,
          publicReview: publicReview || undefined,
          recommendation: recommendation || undefined,
          reputationScore: reputationScore ? Number(reputationScore) : undefined,
          remoteFocusScore: remoteFocusScore ? Number(remoteFocusScore) : undefined,
          curationScore: curationScore ? Number(curationScore) : undefined,
          payPotentialScore: payPotentialScore ? Number(payPotentialScore) : undefined,
          priorityScore: priorityScore ? Number(priorityScore) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create platform');
      toast.success('Platform saved');
      router.push('/dashboard/job-hunt/platforms');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create platform');
    } finally {
      setSaving(false);
    }
  };

  const SCORE_FIELDS = [
    { label: 'Reputation', range: '1–5', value: reputationScore, set: setReputationScore, min: 1, max: 5, step: 0.1 },
    { label: 'Remote Focus', range: '1–5', value: remoteFocusScore, set: setRemoteFocusScore, min: 1, max: 5, step: 0.1 },
    { label: 'Curation / Vetting', range: '1–5', value: curationScore, set: setCurationScore, min: 1, max: 5, step: 0.1 },
    { label: 'Pay Potential', range: '1–5', value: payPotentialScore, set: setPayPotentialScore, min: 1, max: 5, step: 0.1 },
    { label: 'Priority Score', range: '0–100', value: priorityScore, set: setPriorityScore, min: 0, max: 100, step: 1 },
  ] as const;

  const inputCls = 'w-full rounded-md border border-[#d8d0c5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d4622a]/30 bg-white';

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <p className="text-[0.6rem] font-mono tracking-[0.18em] uppercase text-[#8a7a6a]">Platform Store</p>
        <h1 className="text-[1rem] font-semibold text-[#2a2118]">Add New Platform</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-[#e8e3db] bg-white p-5">

        {/* Basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[0.72rem] font-medium text-[#4c3f33] mb-1">Platform name <span className="text-red-500">*</span></label>
            <PlatformCombobox
              value={name}
              onChange={(val) => setName(typeof val === 'string' ? val : (val as any)?.name ?? '')}
            />
            <p className="text-[0.65rem] text-[#8a7a6a] mt-1">Type to check for existing platforms and avoid duplicates.</p>
          </div>
          <div>
            <label className="block text-[0.72rem] font-medium text-[#4c3f33] mb-1">Platform URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.linkedin.com/jobs"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-[0.72rem] font-medium text-[#4c3f33] mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What kind of roles this platform is best for"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-[0.72rem] font-medium text-[#4c3f33] mb-1">My note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Need referral from X team, focus on backend roles, etc."
            className={inputCls}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-[#4c3f33]">
          <input
            type="checkbox"
            checked={needsReferral}
            onChange={(e) => setNeedsReferral(e.target.checked)}
            className="h-4 w-4 rounded border-[#c9beb0] text-[#d4622a]"
          />
          I need referral for this platform
        </label>

        {/* Reputation & Scoring */}
        <div className="border-t border-[#f0ece5] pt-4 space-y-4">
          <p className="text-[0.6rem] font-mono tracking-[0.18em] uppercase text-[#8a7a6a]">Reputation &amp; Scoring <span className="normal-case tracking-normal text-[#c0b8ae]">(optional)</span></p>

          <div>
            <label className="block text-[0.72rem] font-medium text-[#4c3f33] mb-1">Public Review / Reputation Snapshot</label>
            <textarea
              rows={3}
              value={publicReview}
              onChange={(e) => setPublicReview(e.target.value)}
              placeholder="e.g. Public reviews are generally strong; users praise screened listings and legitimacy…"
              className={inputCls + ' resize-y'}
            />
          </div>

          <div>
            <label className="block text-[0.72rem] font-medium text-[#4c3f33] mb-1">Recommendation</label>
            <textarea
              rows={2}
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="e.g. Primary board if you want vetted listings and lower scam risk."
              className={inputCls + ' resize-y'}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {SCORE_FIELDS.map(({ label, range, value, set, min, max, step }) => (
              <div key={label}>
                <label className="block text-[0.65rem] font-mono tracking-wide uppercase text-[#8a7a6a] mb-1">
                  {label}
                  <span className="normal-case tracking-normal ml-1 text-[#c0b8ae]">({range})</span>
                </label>
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={range}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-[#d4622a] text-white rounded-lg text-sm font-medium hover:bg-[#c04d1a] disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Platform'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/job-hunt/platforms')}
            className="px-4 py-2 border border-[#d8d0c5] text-[#4c3f33] rounded-lg text-sm hover:bg-[#f8f5f2] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
