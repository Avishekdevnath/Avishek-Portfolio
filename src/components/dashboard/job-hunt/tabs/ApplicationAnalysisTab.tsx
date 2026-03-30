'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import type { BookmarkAIAnalysis } from '@/types/job-hunt';

interface Props {
  applicationId: string;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-green-100 text-green-700 border-green-200' :
    score >= 60 ? 'bg-amber-100 text-amber-700 border-amber-200' :
    'bg-red-100 text-red-700 border-red-200';

  const label =
    score >= 80 ? 'Strong Match' :
    score >= 60 ? 'Moderate Match' :
    'Weak Match';

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${color}`}>
      <span className="text-2xl font-bold">{score}%</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function Section({ title, items, color = 'text-[#2a2118]' }: { title: string; items: string[]; color?: string }) {
  const [open, setOpen] = useState(true);
  if (!items || items.length === 0) return null;
  return (
    <div className="border border-[#e8e3db] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#faf8f4] text-left"
      >
        <p className="text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">{title}</p>
        {open ? <ChevronUp size={14} className="text-[#8a7a6a]" /> : <ChevronDown size={14} className="text-[#8a7a6a]" />}
      </button>
      {open && (
        <ul className="px-4 py-3 space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className={`flex items-start gap-2 text-sm ${color}`}>
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#d4622a] shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ApplicationAnalysisTab({ applicationId }: Props) {
  const [jd, setJd] = useState('');
  const [analysis, setAnalysis] = useState<BookmarkAIAnalysis | null>(null);
  const [fromBookmark, setFromBookmark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingJD, setSavingJD] = useState(false);
  const [jdDirty, setJdDirty] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await fetch(`/api/job-hunt/applications/${applicationId}/analysis`);
        const data = await res.json();
        if (data.success) {
          setJd(data.jobDescription || '');
          setAnalysis(data.aiAnalysis || null);
          setFromBookmark(!!data.sourceBookmarkId);
        }
      } catch {
        toast.error('Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [applicationId]);

  const saveJD = async () => {
    setSavingJD(true);
    try {
      const res = await fetch(`/api/job-hunt/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd }),
      });
      const data = await res.json();
      if (data.success) {
        setJdDirty(false);
        toast.success('Job description saved');
      } else {
        toast.error('Failed to save');
      }
    } catch {
      toast.error('Failed to save job description');
    } finally {
      setSavingJD(false);
    }
  };

  const generate = async () => {
    if (!jd.trim()) { toast.error('Paste the job description first'); return; }
    if (jdDirty) await saveJD();
    setGenerating(true);
    try {
      const res = await fetch(`/api/job-hunt/applications/${applicationId}/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.data);
        toast.success('Analysis generated');
      } else {
        toast.error(data.error || 'Generation failed');
      }
    } catch {
      toast.error('Failed to generate analysis');
    } finally {
      setGenerating(false);
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
    <div className="space-y-5">
      {/* JD Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a]">
            Job Description
            {fromBookmark && (
              <span className="ml-2 text-[#c0b8ae] normal-case tracking-normal">(synced from bookmark)</span>
            )}
          </label>
          <div className="flex gap-2">
            {jdDirty && (
              <button
                onClick={saveJD}
                disabled={savingJD}
                className="text-xs px-2.5 py-1 border border-[#e8e3db] text-[#2a2118] rounded-lg hover:bg-[#f3f1ee] disabled:opacity-50"
              >
                {savingJD ? 'Saving…' : 'Save JD'}
              </button>
            )}
            <button
              onClick={generate}
              disabled={generating || !jd.trim()}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#d4622a] text-white rounded-lg hover:bg-[#c04d1a] disabled:opacity-50 transition-colors"
            >
              {generating ? (
                <>
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  {analysis ? <RefreshCw size={12} /> : null}
                  {analysis ? 'Re-analyze' : 'Analyze Match'}
                </>
              )}
            </button>
          </div>
        </div>
        <textarea
          value={jd}
          onChange={(e) => { setJd(e.target.value); setJdDirty(true); }}
          rows={8}
          placeholder="Paste the full job description here… The more detail, the better the analysis."
          className="w-full bg-[#faf8f4] border border-[#e8e3db] rounded-xl px-4 py-3 text-sm text-[#2a2118] focus:outline-none focus:ring-1 focus:ring-[#d4622a] resize-y"
        />
      </div>

      {generating && !analysis && (
        <div className="py-12 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#8a7a6a]">Analyzing job match…</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          <div className="bg-white border border-[#e8e3db] rounded-xl p-4 space-y-3">
            <ScoreBadge score={analysis.relevanceScore} />
            {analysis.relevanceSummary && (
              <p className="text-sm text-[#4a3728] leading-relaxed">{analysis.relevanceSummary}</p>
            )}
            <p className="text-[0.65rem] text-[#c0b8ae] font-mono">
              Generated {new Date(analysis.generatedAt).toLocaleDateString()}
            </p>
          </div>

          <Section title="Interview Preparation Topics" items={analysis.interviewPrep} />
          <Section title="Resume Tips — What to Add / Highlight" items={analysis.resumeTips} />
          <Section title="Skill Gaps — Areas to Strengthen" items={analysis.skillGaps} color="text-red-700" />
        </div>
      )}

      {!analysis && !generating && (
        <div className="py-8 text-center bg-[#faf8f4] rounded-xl border border-[#e8e3db]">
          <p className="text-sm text-[#8a7a6a]">No analysis yet</p>
          <p className="text-xs text-[#c0b8ae] mt-1">Paste the job description above and click Analyze Match</p>
        </div>
      )}
    </div>
  );
}
