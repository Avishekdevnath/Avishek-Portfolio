'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function NewPlatformPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [needsReferral, setNeedsReferral] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/job-hunt/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          url,
          note,
          needsReferral,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to create platform');
      }

      toast.success('Platform saved');
      router.push('/dashboard/job-hunt/platforms');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create platform');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#8a7a6a] font-mono">Platform Store</p>
        <h1 className="text-2xl font-semibold text-[#2a2118] mt-1">Add New Platform</h1>
        <p className="text-sm text-[#6b5c4e] mt-1">Add source link, personal note, and referral intent.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[#e8e3db] bg-white p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4c3f33] mb-1">Platform name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Linkedin"
              className="w-full rounded-md border border-[#d8d0c5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d4622a]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4c3f33] mb-1">Platform URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.linkedin.com/jobs"
              className="w-full rounded-md border border-[#d8d0c5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d4622a]/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4c3f33] mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What kind of roles this platform is best for"
            className="w-full rounded-md border border-[#d8d0c5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d4622a]/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4c3f33] mb-1">My note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Need referral from X team, focus on backend roles, etc."
            className="w-full rounded-md border border-[#d8d0c5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d4622a]/30"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-[#4c3f33]">
          <input
            type="checkbox"
            checked={needsReferral}
            onChange={(e) => setNeedsReferral(e.target.checked)}
            className="h-4 w-4 rounded border-[#c9beb0] text-[#d4622a] focus:ring-[#d4622a]/30"
          />
          I need referral for this platform
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#d4622a] px-4 py-2 text-sm font-medium text-white hover:bg-[#b85424] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Platform'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/job-hunt/platforms')}
            className="rounded-md border border-[#d8d0c5] px-4 py-2 text-sm text-[#4c3f33] hover:bg-[#f8f5f2]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
