'use client';

import { useState } from 'react';
import { Reply, Archive, Trash2, ChevronDown, ChevronUp, X, MailOpen, Mail } from 'lucide-react';
import { MessageStatus } from '@/types/message';
import { MessageWithId } from '@/app/dashboard/messages/page';

interface Props {
  message: MessageWithId;
  onStatusChange: (id: string, status: MessageStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// ── helpers ──────────────────────────────────────────────
function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function relativeTime(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = 60_000, h = 3_600_000, d = 86_400_000;
  if (diff < m)       return 'just now';
  if (diff < h)       return `${Math.floor(diff / m)}m ago`;
  if (diff < d)       return `${Math.floor(diff / h)}h ago`;
  if (diff < 7 * d)   return `${Math.floor(diff / d)}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const STATUS_CFG: Record<string, { label: string; border: string; badge: string; avatarBg: string }> = {
  unread:   { label: 'Unread',   border: 'border-l-[#d4622a]', badge: 'bg-[#fdf0eb] text-[#d4622a]',  avatarBg: 'bg-[#d4622a]' },
  read:     { label: 'Read',     border: 'border-l-[#ddd5c5]', badge: 'bg-[#f3f1ee] text-[#8a7a6a]',  avatarBg: 'bg-[#8b7355]' },
  replied:  { label: 'Replied',  border: 'border-l-[#3a7d6e]', badge: 'bg-[#e6f2ee] text-[#2a6b4f]',  avatarBg: 'bg-[#3a7d6e]' },
  archived: { label: 'Archived', border: 'border-l-[#c8c0b4]', badge: 'bg-[#f3f1ee] text-[#8a7a6a]',  avatarBg: 'bg-[#b0a090]' },
};

const CATEGORY_BADGE: Record<string, string> = {
  'Job Opportunity':       'bg-[#e8f0fc] text-[#2d4eb3]',
  'Project Collaboration': 'bg-[#f0ebfc] text-[#6b2db3]',
  'General Inquiry':       'bg-[#fef3e2] text-[#92510a]',
};

// ─────────────────────────────────────────────────────────
export default function MessageRow({ message, onStatusChange, onDelete }: Props) {
  const [loading, setLoading]       = useState(false);
  const [expanded, setExpanded]     = useState(false);
  const [showReply, setShowReply]   = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [replyText, setReplyText]   = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);

  const cfg = STATUS_CFG[message.status] ?? STATUS_CFG.read;
  const isUnread = message.status === MessageStatus.UNREAD;

  const wrap = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); } catch { /* silently handled */ } finally { setLoading(false); }
  };

  const toggleRead = () => wrap(() =>
    onStatusChange(message._id, isUnread ? MessageStatus.READ : MessageStatus.UNREAD)
  );

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplyError(null);
    await wrap(async () => {
      const res  = await fetch(`/api/messages/${message._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyMessage: replyText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reply');
      setReplyText('');
      setShowReply(false);
      setShowThread(true);
      await onStatusChange(message._id, MessageStatus.REPLIED);
    });
    if (replyError) setReplyError('Failed to send reply');
  };

  const closeReply = () => { setShowReply(false); setReplyText(''); setReplyError(null); };

  return (
    <div className={`bg-white border border-[#e8e3db] border-l-4 ${cfg.border} rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[0_4px_16px_rgba(74,55,40,0.08)] ${loading ? 'opacity-60 pointer-events-none' : ''}`}>

      {/* ── Main card ── */}
      <div className="px-4 py-4 sm:px-5 sm:py-4">
        <div className="flex items-start gap-3">

          {/* Avatar */}
          <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[0.7rem] font-bold text-white select-none ${cfg.avatarBg}`}>
            {initials(message.name)}
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0">

            {/* Top row: name + email + badges + time */}
            <div className="flex items-start flex-wrap justify-between gap-x-3 gap-y-1">
              <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
                <span className={`font-body text-[0.875rem] leading-tight ${isUnread ? 'font-semibold text-[#2a2118]' : 'font-medium text-[#4a3728]'}`}>
                  {message.name}
                </span>
                <span className="font-mono text-[0.68rem] text-[#8a7a6a] truncate">{message.email}</span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                {/* Category badge */}
                <span className={`font-mono text-[0.58rem] tracking-[0.06em] px-2 py-0.5 rounded-full ${CATEGORY_BADGE[message.subject] ?? 'bg-[#f3f1ee] text-[#6b5c4e]'}`}>
                  {message.subject}
                </span>
                {/* Status badge */}
                <span className={`font-mono text-[0.58rem] tracking-[0.06em] uppercase px-2 py-0.5 rounded-full ${cfg.badge}`}>
                  {cfg.label}
                </span>
                {/* Replies count */}
                {message.replies?.length > 0 && (
                  <span className="font-mono text-[0.58rem] tracking-[0.06em] px-2 py-0.5 rounded-full bg-[#e6f2ee] text-[#2a6b4f]">
                    {message.replies.length} repl{message.replies.length === 1 ? 'y' : 'ies'}
                  </span>
                )}
                {/* Time */}
                <span className="font-mono text-[0.62rem] text-[#8a7a6a] whitespace-nowrap">
                  {relativeTime(message.createdAt)}
                </span>
              </div>
            </div>

            {/* Message preview */}
            <div className="mt-1.5">
              <p className={`font-body text-[0.82rem] text-[#6b5c4e] leading-[1.65] ${expanded ? '' : 'line-clamp-2'}`}>
                {message.message}
              </p>
              {message.message.length > 140 && (
                <button
                  onClick={() => setExpanded(v => !v)}
                  className="mt-1 font-mono text-[0.62rem] tracking-[0.05em] text-[#8b7355] hover:text-[#d4622a] transition-colors flex items-center gap-1"
                >
                  {expanded
                    ? <><ChevronUp size={10} /> Show less</>
                    : <><ChevronDown size={10} /> Read more</>}
                </button>
              )}
            </div>

            {/* Thread toggle */}
            {message.replies?.length > 0 && (
              <button
                onClick={() => setShowThread(v => !v)}
                className="mt-2 font-mono text-[0.62rem] tracking-[0.05em] text-[#3a7d6e] hover:text-[#2a6b4f] flex items-center gap-1.5 transition-colors"
              >
                <span className="w-3 h-px bg-current" />
                {showThread ? 'Hide' : 'View'} thread
                {showThread ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
            <button
              onClick={() => setShowReply(v => !v)}
              title="Reply"
              className="p-1.5 rounded-lg text-[#8a7a6a] hover:text-[#3a7d6e] hover:bg-[#e6f2ee] transition-colors"
            >
              <Reply size={13} />
            </button>
            <button
              onClick={toggleRead}
              title={isUnread ? 'Mark as read' : 'Mark as unread'}
              className="p-1.5 rounded-lg text-[#8a7a6a] hover:text-[#2d4eb3] hover:bg-[#e8f0fc] transition-colors"
            >
              {isUnread ? <MailOpen size={13} /> : <Mail size={13} />}
            </button>
            <button
              onClick={() => wrap(() => onStatusChange(message._id, MessageStatus.ARCHIVED))}
              title="Archive"
              className="p-1.5 rounded-lg text-[#8a7a6a] hover:text-[#8b7355] hover:bg-[#f3f1ee] transition-colors"
            >
              <Archive size={13} />
            </button>
            <button
              onClick={() => wrap(() => onDelete(message._id))}
              title="Delete"
              className="p-1.5 rounded-lg text-[#8a7a6a] hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Thread ── */}
      {showThread && message.replies?.length > 0 && (
        <div className="border-t border-[#f3f1ee] bg-[#faf8f4] px-5 py-4 space-y-3">
          <p className="font-mono text-[0.58rem] tracking-[0.14em] uppercase text-[#8a7a6a]">Thread</p>
          {message.replies.map((reply, i) => (
            <div key={i} className={`flex ${reply.sentBy === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[76%] rounded-xl px-4 py-2.5 ${
                reply.sentBy === 'admin'
                  ? 'bg-[#2a2118] text-[#f0ece3]'
                  : 'bg-white border border-[#e8e3db] text-[#2a2118]'
              }`}>
                <p className="font-body text-[0.82rem] leading-[1.6]">{reply.message}</p>
                <p className={`font-mono text-[0.6rem] mt-1 ${reply.sentBy === 'admin' ? 'text-[#f0ece3]/55' : 'text-[#8a7a6a]'}`}>
                  {new Date(reply.sentAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Reply panel ── */}
      {showReply && (
        <div className="border-t border-[#e8e3db] bg-[#faf8f4] px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[0.6rem] tracking-[0.12em] uppercase text-[#8a7a6a]">
              Reply to <span className="text-[#4a3728]">{message.name}</span>
            </p>
            <button onClick={closeReply} className="text-[#8a7a6a] hover:text-[#2a2118] transition-colors">
              <X size={13} />
            </button>
          </div>

          {/* Original message context */}
          <div className="mb-3 px-3 py-2.5 bg-white border-l-2 border-[#ddd5c5] rounded-r-lg">
            <p className="font-mono text-[0.58rem] tracking-[0.08em] uppercase text-[#8a7a6a] mb-1">Original</p>
            <p className="font-body text-[0.78rem] text-[#6b5c4e] leading-[1.55] line-clamp-3">{message.message}</p>
          </div>

          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Write your reply…"
            rows={4}
            disabled={loading}
            className="w-full px-3 py-2.5 font-body text-[0.82rem] text-[#2a2118] bg-white border border-[#ddd5c5] rounded-lg resize-none focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20 placeholder:text-[#8a7a6a] disabled:opacity-60 transition-colors"
          />

          {replyError && (
            <p className="mt-1.5 font-body text-[0.75rem] text-[#d4622a]">{replyError}</p>
          )}

          <div className="flex justify-end gap-2 mt-2.5">
            <button
              onClick={closeReply}
              className="px-3.5 py-1.5 font-body text-[0.78rem] text-[#4a3728] border border-[#ddd5c5] rounded-lg hover:border-[#2a2118] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReply}
              disabled={loading || !replyText.trim()}
              className="px-3.5 py-1.5 font-body text-[0.78rem] font-medium bg-[#2a2118] text-[#f0ece3] rounded-lg hover:bg-[#d4622a] disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <Reply size={12} />
              {loading ? 'Sending…' : 'Send Reply'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
