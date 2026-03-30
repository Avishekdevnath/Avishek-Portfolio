'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import NoteEditor from '../NoteEditor';
import type { ApplicationNoteItem } from '@/types/job-hunt';

interface Props {
  sourceType: 'application' | 'bookmark';
  sourceId: string;
}

export default function NotesTab({ sourceType, sourceId }: Props) {
  const baseUrl = sourceType === 'bookmark'
    ? `/api/job-hunt/bookmarks/${sourceId}/notes`
    : `/api/job-hunt/applications/${sourceId}/notes`;

  const [notes, setNotes] = useState<ApplicationNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(baseUrl);
        const data = await res.json();
        if (data.success) setNotes(data.data);
      } catch {
        toast.error('Failed to load notes');
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [baseUrl]);

  const handleCreate = async (body: string) => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    const data = await res.json();
    if (data.success) {
      setNotes((prev) => [data.data, ...prev]);
      setAdding(false);
      toast.success('Note saved');
    } else {
      toast.error('Failed to save note');
      throw new Error();
    }
  };

  const handleEdit = async (id: string, body: string) => {
    const res = await fetch(`${baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    const data = await res.json();
    if (data.success) {
      setNotes((prev) => prev.map((n) => n._id === id ? data.data : n));
      setEditingId(null);
      toast.success('Note updated');
    } else {
      toast.error('Failed to update note');
      throw new Error();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      const res = await fetch(`${baseUrl}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => prev.filter((n) => n._id !== id));
        toast.success('Note deleted');
      }
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const renderMarkdown = (text: string) =>
    text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-[#f3f1ee] px-1 rounded text-[0.78rem]">$1</code>')
      .replace(/\n/g, '<br />');

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
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </p>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setEditingId(null); }}
            className="flex items-center gap-2 px-3 py-2 bg-[#d4622a] text-white text-xs rounded-lg hover:bg-[#c04d1a] transition-colors"
          >
            <Plus size={14} /> Add Note
          </button>
        )}
      </div>

      {adding && (
        <NoteEditor onSave={handleCreate} onCancel={() => setAdding(false)} />
      )}

      {notes.length === 0 && !adding ? (
        <div className="py-14 text-center bg-[#faf8f4] rounded-xl border border-[#e8e3db]">
          <p className="text-[#8a7a6a] text-sm mb-1">No notes yet</p>
          <p className="text-[#c0b8ae] text-xs">Add notes, interview tips, or anything relevant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) =>
            editingId === note._id ? (
              <NoteEditor
                key={note._id}
                initialValue={note.body}
                onSave={(body) => handleEdit(note._id, body)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div key={note._id} className="bg-white border border-[#e8e3db] rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-[0.65rem] font-mono text-[#8a7a6a]">
                    {new Date(note.updatedAt || note.createdAt || '').toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { setEditingId(note._id); setAdding(false); }}
                      className="p-1 text-[#c0b8ae] hover:text-[#d4622a] transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(note._id)}
                      className="p-1 text-[#c0b8ae] hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div
                  className="text-[0.875rem] text-[#2a2118] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(note.body) }}
                />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
