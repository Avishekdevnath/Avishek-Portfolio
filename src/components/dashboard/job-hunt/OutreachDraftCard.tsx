'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { ApplicationContactItem, ApplicationOutreachDraftItem } from '@/types/job-hunt';

function CopyBtn({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success(`${label} copied`);
  };
  return (
    <button onClick={copy} className="flex items-center gap-1 text-[0.7rem] text-[#8a7a6a] hover:text-[#d4622a] transition-colors px-2 py-1 rounded border border-[#e8e3db] hover:border-[#d4622a]">
      {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
      {copied ? 'Copied!' : `Copy ${label}`}
    </button>
  );
}

interface Props {
  applicationId: string;
  contact: ApplicationContactItem;
  draft: ApplicationOutreachDraftItem | null;
  onDraftUpdate: (draft: ApplicationOutreachDraftItem) => void;
  onDraftDelete: (contactId: string) => void;
}

export default function OutreachDraftCard({ applicationId, contact, draft, onDraftUpdate, onDraftDelete }: Props) {
  const [generating, setGenerating] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);

  const generate = async () => {
    setGenerating(true);
    setConfirmRegen(false);
    try {
      const res = await fetch(`/api/job-hunt/applications/${applicationId}/outreach/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: contact._id }),
      });
      const data = await res.json();
      if (data.success) {
        onDraftUpdate(data.data);
        toast.success('Draft generated');
      } else {
        toast.error(data.error || 'Generation failed');
      }
    } catch {
      toast.error('Failed to generate');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!draft) return;
    try {
      await fetch(`/api/job-hunt/applications/${applicationId}/outreach/${draft._id}`, { method: 'DELETE' });
      onDraftDelete(contact._id);
      toast.success('Draft cleared');
    } catch {
      toast.error('Failed to delete draft');
    }
  };

  return (
    <div className="bg-white border border-[#e8e3db] rounded-xl overflow-hidden">
      {/* Contact header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#faf8f4] border-b border-[#e8e3db]">
        <div>
          <p className="text-sm font-semibold text-[#2a2118]">{contact.name}</p>
          <p className="text-[0.7rem] text-[#8a7a6a]">{contact.title}{contact.roleAtCompany ? ` · ${contact.roleAtCompany}` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {draft && !generating && (
            <button
              onClick={() => setConfirmRegen(true)}
              className="flex items-center gap-1 text-[0.7rem] text-[#8a7a6a] hover:text-[#d4622a] transition-colors"
              title="Regenerate"
            >
              <RefreshCw size={12} /> Regenerate
            </button>
          )}
          {!draft && !generating && (
            <button
              onClick={generate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4622a] text-white text-xs rounded-lg hover:bg-[#c04d1a] transition-colors"
            >
              Generate
            </button>
          )}
          {generating && (
            <div className="flex items-center gap-1.5 text-xs text-[#8a7a6a]">
              <div className="w-3 h-3 border border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" />
              Generating…
            </div>
          )}
        </div>
      </div>

      {/* Confirm regenerate */}
      {confirmRegen && (
        <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3">
          <p className="text-xs text-amber-700">This will overwrite the existing draft for {contact.name}.</p>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setConfirmRegen(false)} className="text-xs px-2 py-1 border border-amber-300 text-amber-700 rounded-lg">Cancel</button>
            <button onClick={generate} className="text-xs px-2 py-1 bg-[#d4622a] text-white rounded-lg">Confirm</button>
          </div>
        </div>
      )}

      {/* Draft content */}
      {draft && (
        <div className="p-4 space-y-4">
          {/* Email */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a]">Cold Email</p>
              <div className="flex gap-1.5">
                <CopyBtn value={draft.emailSubject || ''} label="Subject" />
                <CopyBtn value={draft.emailBody || ''} label="Body" />
              </div>
            </div>
            {draft.emailSubject && (
              <p className="text-xs font-semibold text-[#2a2118] mb-1">Subject: {draft.emailSubject}</p>
            )}
            <pre className="text-[0.78rem] text-[#4a3728] whitespace-pre-wrap bg-[#faf8f4] border border-[#e8e3db] rounded-lg p-3 leading-relaxed font-sans">
              {draft.emailBody}
            </pre>
          </div>

          {/* LinkedIn DM */}
          {draft.linkedinDm && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a]">LinkedIn DM</p>
                <CopyBtn value={draft.linkedinDm} label="DM" />
              </div>
              <pre className="text-[0.78rem] text-[#4a3728] whitespace-pre-wrap bg-[#faf8f4] border border-[#e8e3db] rounded-lg p-3 leading-relaxed font-sans">
                {draft.linkedinDm}
              </pre>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <p className="text-[0.65rem] text-[#c0b8ae]">
              Generated {new Date(draft.generatedAt).toLocaleDateString()}
            </p>
            <button onClick={handleDeleteDraft} className="flex items-center gap-1 text-[0.7rem] text-[#c0b8ae] hover:text-red-500 transition-colors">
              <Trash2 size={11} /> Clear
            </button>
          </div>
        </div>
      )}

      {!draft && !generating && (
        <div className="px-4 py-6 text-center text-[0.78rem] text-[#c0b8ae]">
          No draft yet — click Generate to create a personalized email + DM
        </div>
      )}
    </div>
  );
}
