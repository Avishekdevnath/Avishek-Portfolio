'use client';

import { useState } from 'react';
import { Copy, Check, Linkedin, Mail, Phone, Edit2, Trash2 } from 'lucide-react';
import type { ApplicationContactItem } from '@/types/job-hunt';

const TITLE_COLORS: Record<string, string> = {
  HR: 'bg-blue-100 text-blue-700',
  Recruiter: 'bg-purple-100 text-purple-700',
  'Hiring Manager': 'bg-amber-100 text-amber-700',
  Engineer: 'bg-green-100 text-green-700',
  Employee: 'bg-teal-100 text-teal-700',
  Referral: 'bg-orange-100 text-orange-700',
  Other: 'bg-gray-100 text-gray-600',
};

const REFERRAL_COLORS: Record<string, string> = {
  Potential: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  Asked: 'bg-blue-50 text-blue-700 border border-blue-200',
  Confirmed: 'bg-green-50 text-green-700 border border-green-200',
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="p-1 text-[#c0b8ae] hover:text-[#d4622a] transition-colors" title="Copy">
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  );
}

interface Props {
  contact: ApplicationContactItem;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ContactCard({ contact, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white border border-[#e8e3db] rounded-xl p-4 space-y-2.5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.9rem] font-semibold text-[#2a2118]">{contact.name}</p>
          {contact.roleAtCompany && (
            <p className="text-[0.75rem] text-[#6b5c4e]">{contact.roleAtCompany}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} className="p-1.5 text-[#c0b8ae] hover:text-[#d4622a] transition-colors" title="Edit">
            <Edit2 size={13} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-[#c0b8ae] hover:text-red-500 transition-colors" title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${TITLE_COLORS[contact.title] ?? 'bg-gray-100 text-gray-600'}`}>
          {contact.title}
        </span>
        {contact.referralStatus && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${REFERRAL_COLORS[contact.referralStatus]}`}>
            Referral: {contact.referralStatus}
          </span>
        )}
      </div>

      <div className="space-y-1">
        {contact.email && (
          <div className="flex items-center gap-1.5 text-[0.78rem] text-[#4a3728]">
            <Mail size={12} className="text-[#8a7a6a] shrink-0" />
            <span className="truncate">{contact.email}</span>
            <CopyButton value={contact.email} />
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-1.5 text-[0.78rem] text-[#4a3728]">
            <Phone size={12} className="text-[#8a7a6a] shrink-0" />
            <span>{contact.phone}</span>
            <CopyButton value={contact.phone} />
          </div>
        )}
        {contact.linkedinUrl && (
          <div className="flex items-center gap-1.5 text-[0.78rem]">
            <Linkedin size={12} className="text-[#8a7a6a] shrink-0" />
            <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#d4622a] hover:underline truncate">
              LinkedIn
            </a>
            <CopyButton value={contact.linkedinUrl} />
          </div>
        )}
      </div>

      {contact.bio && (
        <p className="text-[0.72rem] text-[#8a7a6a] italic border-t border-[#f3f1ee] pt-2">{contact.bio}</p>
      )}
      {contact.referralNote && (
        <p className="text-[0.72rem] text-[#6b5c4e] border-t border-[#f3f1ee] pt-2">
          <span className="font-medium">Referral note:</span> {contact.referralNote}
        </p>
      )}
    </div>
  );
}
