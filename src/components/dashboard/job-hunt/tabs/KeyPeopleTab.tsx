'use client';

import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ContactCard from '../ContactCard';
import ContactFormModal from '../ContactFormModal';
import type { ApplicationContactItem } from '@/types/job-hunt';

interface Props {
  sourceType: 'application' | 'bookmark';
  sourceId: string;
}

export default function KeyPeopleTab({ sourceType, sourceId }: Props) {
  const [contacts, setContacts] = useState<ApplicationContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApplicationContactItem | null>(null);

  const baseUrl = sourceType === 'bookmark'
    ? `/api/job-hunt/bookmarks/${sourceId}/contacts`
    : `/api/job-hunt/applications/${sourceId}/contacts`;

  const fetchContacts = async () => {
    try {
      const res = await fetch(baseUrl);
      const data = await res.json();
      if (data.success) setContacts(data.data);
    } catch {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, [sourceId, sourceType]);

  const handleSaved = (saved: ApplicationContactItem) => {
    setContacts((prev) => {
      const idx = prev.findIndex((c) => c._id === saved._id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [...prev, saved];
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact?')) return;
    try {
      const res = await fetch(`${baseUrl}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) => prev.filter((c) => c._id !== id));
        toast.success('Contact deleted');
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('Failed to delete contact');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-3 py-2 bg-[#d4622a] text-white text-xs rounded-lg hover:bg-[#c04d1a] transition-colors"
        >
          <UserPlus size={14} /> Add Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="py-14 text-center bg-[#faf8f4] rounded-xl border border-[#e8e3db]">
          <p className="text-[#8a7a6a] text-sm mb-3">No contacts yet</p>
          <p className="text-[#c0b8ae] text-xs">Add HR contacts, recruiters, employees, or potential referrers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {contacts.map((contact) => (
            <ContactCard
              key={contact._id}
              contact={contact}
              onEdit={() => { setEditing(contact); setModalOpen(true); }}
              onDelete={() => handleDelete(contact._id)}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <ContactFormModal
          baseUrl={baseUrl}
          contact={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
