'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { APPLICATION_CONTACT_TITLES, REFERRAL_STATUSES } from '@/lib/job-hunt-utils';
import type { ApplicationContactItem } from '@/types/job-hunt';

interface Props {
  baseUrl: string;
  contact?: ApplicationContactItem | null;
  onClose: () => void;
  onSaved: (contact: ApplicationContactItem) => void;
}

const EMPTY = {
  name: '', title: 'Other' as const, company: '', roleAtCompany: '',
  linkedinUrl: '', email: '', phone: '', bio: '', referralStatus: '' as any, referralNote: '',
};

export default function ContactFormModal({ baseUrl, contact, onClose, onSaved }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name,
        title: contact.title,
        company: contact.company || '',
        roleAtCompany: contact.roleAtCompany || '',
        linkedinUrl: contact.linkedinUrl || '',
        email: contact.email || '',
        phone: contact.phone || '',
        bio: contact.bio || '',
        referralStatus: contact.referralStatus || '',
        referralNote: contact.referralNote || '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [contact]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const url = contact ? `${baseUrl}/${contact._id}` : baseUrl;
      const res = await fetch(url, {
        method: contact ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          referralStatus: form.referralStatus || undefined,
          company: form.company || undefined,
          roleAtCompany: form.roleAtCompany || undefined,
          linkedinUrl: form.linkedinUrl || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
          bio: form.bio || undefined,
          referralNote: form.referralNote || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(contact ? 'Contact updated' : 'Contact added');
        onSaved(data.data);
        onClose();
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save contact');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl pointer-events-auto overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-[#2a2118] to-[#3d2f22] px-5 py-4 flex items-center justify-between">
            <h2 className="text-white font-semibold">{contact ? 'Edit Contact' : 'Add Contact'}</h2>
            <button onClick={onClose} className="p-1 text-white/70 hover:text-white"><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#2a2118] mb-1">Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Full name"
                  className="w-full border border-[#e8e3db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4622a]" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2a2118] mb-1">Title</label>
                <select value={form.title} onChange={(e) => set('title', e.target.value)}
                  className="w-full border border-[#e8e3db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4622a]">
                  {APPLICATION_CONTACT_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2a2118] mb-1">Referral Status</label>
                <select value={form.referralStatus} onChange={(e) => set('referralStatus', e.target.value)}
                  className="w-full border border-[#e8e3db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4622a]">
                  <option value="">None</option>
                  {REFERRAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2a2118] mb-1">Company</label>
                <input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Their company"
                  className="w-full border border-[#e8e3db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4622a]" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2a2118] mb-1">Role at Company</label>
                <input value={form.roleAtCompany} onChange={(e) => set('roleAtCompany', e.target.value)} placeholder="e.g. Backend Engineer"
                  className="w-full border border-[#e8e3db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4622a]" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2a2118] mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@company.com"
                  className="w-full border border-[#e8e3db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4622a]" />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2a2118] mb-1">Phone</label>
                <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 234 567 8900"
                  className="w-full border border-[#e8e3db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4622a]" />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#2a2118] mb-1">LinkedIn URL</label>
                <input type="url" value={form.linkedinUrl} onChange={(e) => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/..."
                  className="w-full border border-[#e8e3db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4622a]" />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#2a2118] mb-1">Bio / Notes <span className="text-[#8a7a6a] font-normal">(used for AI email generation)</span></label>
                <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={2} placeholder="Brief note about this person..."
                  className="w-full border border-[#e8e3db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4622a] resize-none" />
              </div>

              {form.referralStatus && (
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#2a2118] mb-1">Referral Note</label>
                  <textarea value={form.referralNote} onChange={(e) => set('referralNote', e.target.value)} rows={2} placeholder="How you know them, context..."
                    className="w-full border border-[#e8e3db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#d4622a] resize-none" />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-[#e8e3db] text-sm text-[#2a2118] rounded-lg hover:bg-[#f7f3ea] transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 px-4 py-2.5 bg-[#d4622a] text-white text-sm rounded-lg hover:bg-[#c04d1a] disabled:opacity-60 transition-colors">
                {saving ? 'Saving…' : contact ? 'Update' : 'Add Contact'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
