'use client';

import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import OutreachDraftCard from '../OutreachDraftCard';
import type { ApplicationContactItem, ApplicationOutreachDraftItem, JobApplicationItem } from '@/types/job-hunt';

function CopyBlock({ label, content }: { label: string; content: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success(`${label} copied`);
  };
  return (
    <div className="bg-[#faf8f4] border border-[#e8e3db] rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a]">{label}</p>
        <button onClick={copy} className="flex items-center gap-1 text-[0.7rem] text-[#8a7a6a] hover:text-[#d4622a] transition-colors">
          {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="text-[0.78rem] text-[#4a3728] whitespace-pre-wrap leading-relaxed font-sans">{content}</pre>
    </div>
  );
}

function buildGeneralEmail(app: JobApplicationItem) {
  return `Subject: Interest in ${app.jobTitle} role at ${app.company}

Hi [Contact Name],

I came across the ${app.jobTitle} position at ${app.company} and wanted to reach out directly. I'm a software developer with experience in [Your Key Skills], and I believe my background aligns well with what you're looking for.

I'd love to learn more about the team and the role. Would you be open to a quick chat this week?

Looking forward to hearing from you.

Best regards,
[Your Name]`;
}

function buildGeneralDM(app: JobApplicationItem) {
  return `Hi [Name], I applied for the ${app.jobTitle} role at ${app.company} and wanted to connect. I'd love to learn more about the team. Open to a quick chat?`;
}

interface Props {
  applicationId: string;
  application: JobApplicationItem;
}

export default function OutreachTab({ applicationId, application }: Props) {
  const [contacts, setContacts] = useState<ApplicationContactItem[]>([]);
  const [drafts, setDrafts] = useState<ApplicationOutreachDraftItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [contactsRes, draftsRes] = await Promise.all([
          fetch(`/api/job-hunt/applications/${applicationId}/contacts`),
          fetch(`/api/job-hunt/applications/${applicationId}/outreach`),
        ]);
        const [contactsData, draftsData] = await Promise.all([contactsRes.json(), draftsRes.json()]);
        if (contactsData.success) setContacts(contactsData.data);
        if (draftsData.success) setDrafts(draftsData.data);
      } catch {
        toast.error('Failed to load outreach data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [applicationId]);

  const handleDraftUpdate = (updated: ApplicationOutreachDraftItem) => {
    setDrafts((prev) => {
      const idx = prev.findIndex((d) => d.contactId === updated.contactId);
      if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next; }
      return [...prev, updated];
    });
  };

  const handleDraftDelete = (contactId: string) => {
    setDrafts((prev) => prev.filter((d) => d.contactId !== contactId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section A: General templates */}
      <div>
        <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a] mb-3">General Templates</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <CopyBlock label="Cold Email Template" content={buildGeneralEmail(application)} />
          <CopyBlock label="LinkedIn DM Template" content={buildGeneralDM(application)} />
        </div>
      </div>

      {/* Section B: Per-contact AI drafts */}
      <div>
        <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a] mb-3">
          AI-Generated Per Contact
        </p>

        {contacts.length === 0 ? (
          <div className="py-10 text-center bg-[#faf8f4] rounded-xl border border-[#e8e3db]">
            <p className="text-sm text-[#8a7a6a]">No contacts added yet</p>
            <p className="text-xs text-[#c0b8ae] mt-1">Add contacts in the Key People tab to generate personalized outreach</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <OutreachDraftCard
                key={contact._id}
                applicationId={applicationId}
                contact={contact}
                draft={drafts.find((d) => d.contactId === contact._id) ?? null}
                onDraftUpdate={handleDraftUpdate}
                onDraftDelete={handleDraftDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
