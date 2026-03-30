'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Props {
  initialValue?: string;
  onSave: (body: string) => Promise<void>;
  onCancel: () => void;
}

export default function NoteEditor({ initialValue = '', onSave, onCancel }: Props) {
  const [body, setBody] = useState(initialValue);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const handleSave = async () => {
    if (!body.trim()) return;
    setSaving(true);
    try { await onSave(body.trim()); } finally { setSaving(false); }
  };

  // Very simple markdown renderer (bold, italic, code, line breaks)
  const renderMarkdown = (text: string) => {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-[#f3f1ee] px-1 rounded text-[0.78rem]">$1</code>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="bg-white border border-[#d4622a] rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-[#faf8f4] border-b border-[#e8e3db]">
        <p className="text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a]">
          {initialValue ? 'Edit Note' : 'New Note'} · Markdown supported
        </p>
        <button
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-1 text-[0.7rem] text-[#8a7a6a] hover:text-[#2a2118] transition-colors"
        >
          {preview ? <EyeOff size={12} /> : <Eye size={12} />}
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {preview ? (
        <div
          className="min-h-[120px] px-4 py-3 text-[0.875rem] text-[#2a2118] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(body) || '<span class="text-[#c0b8ae] italic">Nothing to preview</span>' }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="Write your note here… Markdown supported (**bold**, *italic*, `code`)"
          className="w-full px-4 py-3 text-[0.875rem] text-[#2a2118] focus:outline-none resize-none"
        />
      )}

      <div className="flex gap-2 px-4 py-3 border-t border-[#e8e3db] bg-[#faf8f4]">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 border border-[#e8e3db] text-sm text-[#2a2118] rounded-lg hover:bg-[#f0ece3] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !body.trim()}
          className="px-4 py-1.5 bg-[#d4622a] text-white text-sm rounded-lg hover:bg-[#c04d1a] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}
