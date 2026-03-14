"use client";

import { useState } from "react";
import SectionHeader from "./shared/SectionHeader";
import { useExperience } from "@/lib/swr";
import { IWorkExperience, IEducation, DraftContent } from "@/types/experience";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: string | Date | undefined | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function draftToText(content: string | DraftContent): string {
  if (typeof content === "string") {
    const t = content.trim();
    if (t.startsWith("{") && t.includes('"blocks"')) {
      try {
        const parsed = JSON.parse(t) as DraftContent;
        return parsed.blocks.map((b) => b.text).filter(Boolean).join(" ");
      } catch { /* fall through */ }
    }
    return t;
  }
  return (content.blocks || []).map((b) => b.text).filter(Boolean).join(" ");
}

// ── Tag variants ──────────────────────────────────────────────────────────────

type TagVariant = "default" | "orange" | "teal" | "blue";

const tagClass: Record<TagVariant, string> = {
  default: "border-cream-deeper text-warm-brown hover:border-sand hover:text-ink",
  orange:  "border-accent-orange/25 text-accent-orange bg-accent-orange/[0.06] hover:border-accent-orange/50",
  teal:    "border-accent-teal/25 text-accent-teal bg-accent-teal/[0.06] hover:border-accent-teal/50",
  blue:    "border-accent-blue/25 text-accent-blue bg-accent-blue/[0.06] hover:border-accent-blue/50",
};

function Tag({ label, variant = "default" }: { label: string; variant?: TagVariant }) {
  return (
    <span className={`font-mono text-[0.62rem] tracking-wide px-2.5 py-[0.2rem] border rounded-full bg-cream-dark transition-all duration-150 cursor-default ${tagClass[variant]}`}>
      {label}
    </span>
  );
}

// ── Meta chip ─────────────────────────────────────────────────────────────────

function MetaChip({ icon, label, accent = false }: { icon: string; label: string; accent?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-[0.63rem] tracking-wide px-2.5 py-[0.22rem] border rounded-full ${
      accent
        ? "text-accent-teal bg-accent-teal/[0.06] border-accent-teal/25"
        : "text-text-muted bg-cream border-cream-deeper"
    }`}>
      <span className="text-[0.7rem]">{icon}</span>
      {label}
    </span>
  );
}

// ── Work Card ─────────────────────────────────────────────────────────────────

function WorkCard({ exp }: { exp: IWorkExperience }) {
  const [open, setOpen] = useState(false);

  const title = exp.level && exp.jobTitle ? `${exp.level} ${exp.jobTitle}` : (exp.jobTitle || exp.title);
  const dateLabel = `${formatDate(exp.startDate)} — ${exp.isCurrent ? "Present" : formatDate(exp.endDate)}`;
  const descText = draftToText(exp.description);

  // Assign tag variants roughly by keyword
  function techVariant(t: string): TagVariant {
    const lo = t.toLowerCase();
    if (["react","next.js","typescript","javascript","html","css","tailwind","redux"].some(k => lo.includes(k))) return "orange";
    if (["mongodb","mysql","postgres","redis","firebase"].some(k => lo.includes(k))) return "teal";
    if (["node","express","python","django","fastapi","go","rust","java"].some(k => lo.includes(k))) return "blue";
    return "default";
  }

  return (
    <div className={`relative bg-off-white border rounded-xl overflow-hidden transition-all duration-250 ${
      open ? "border-sand shadow-md" : "border-cream-deeper hover:border-sand hover:shadow-md hover:-translate-y-0.5"
    }`}>
      {/* Colored left accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl transition-colors duration-300 ${
        open ? "bg-accent-orange" : "bg-cream-deeper"
      }`} />

      {/* Card head */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-4 sm:px-5 pt-5 pb-4 pl-[1.15rem] sm:pl-[1.35rem] cursor-pointer min-h-[8rem] sm:min-h-[10rem] flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="font-heading text-[1.15rem] font-semibold text-ink leading-snug mb-1 flex items-center gap-2 flex-wrap">
              {title}
              {exp.featured && <span className="text-[0.85rem]">⭐</span>}
            </div>
            <div className="font-body text-[0.8rem] text-text-muted flex items-center gap-1.5">
              <span className="text-[0.75rem]">🏢</span>
              {exp.company}
            </div>
          </div>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 border transition-all duration-300 ${
            open ? "bg-ink text-off-white border-ink rotate-180" : "bg-cream text-warm-brown border-cream-deeper"
          }`}>▾</div>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {exp.location && <MetaChip icon="📍" label={exp.location} />}
          <MetaChip icon="📅" label={dateLabel} accent={exp.isCurrent} />
          {exp.employmentType && <MetaChip icon="💼" label={exp.employmentType.replace("-", " ")} />}
        </div>

        {/* Tech tags */}
        {exp.technologies && exp.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {exp.technologies.map((t) => <Tag key={t} label={t} variant={techVariant(t)} />)}
          </div>
        )}
      </button>

      {/* Expandable body */}
      <div className="grid transition-[grid-template-rows] duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden min-h-0">
          <div className="px-4 sm:px-5 pb-5 pl-[1.15rem] sm:pl-[1.35rem] border-t border-cream-deeper pt-4">
            {/* Description */}
            {descText && (
              <p className="font-body text-[0.86rem] leading-relaxed text-warm-brown font-light mb-4">
                {descText}
              </p>
            )}

            {/* Achievements */}
            {exp.achievements && exp.achievements.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                {exp.achievements.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 font-body text-[0.83rem] leading-relaxed text-ink font-light bg-accent-orange/[0.04] border border-accent-orange/[0.12] rounded-lg px-3.5 py-2.5">
                    <div className="w-4 h-4 rounded-full bg-accent-orange/[0.12] flex items-center justify-center shrink-0 mt-0.5 text-[0.6rem] text-accent-orange">✓</div>
                    {a}
                  </div>
                ))}
              </div>
            )}

            {/* Visit link */}
            {exp.website && (
              <a
                href={exp.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] tracking-wider uppercase px-3.5 py-2 border border-cream-deeper rounded-md text-warm-brown bg-cream hover:border-accent-orange hover:text-accent-orange transition-all duration-200"
              >
                ↗ Visit Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Education Card ────────────────────────────────────────────────────────────

function EduCard({ exp }: { exp: IEducation }) {
  const [open, setOpen] = useState(false);

  const dateLabel = `${formatDate(exp.startDate)} — ${exp.isCurrent ? "Present" : formatDate(exp.endDate)}`;
  const descText = draftToText(exp.description);

  return (
    <div className={`relative bg-off-white border rounded-xl overflow-hidden transition-all duration-250 ${
      open ? "border-sand shadow-md" : "border-cream-deeper hover:border-sand hover:shadow-md hover:-translate-y-0.5"
    }`}>
      {/* Left accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl transition-colors duration-300 ${
        open ? "bg-accent-teal" : "bg-cream-deeper"
      }`} />

      {/* Card head */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-4 sm:px-5 pt-5 pb-4 pl-[1.15rem] sm:pl-[1.35rem] cursor-pointer min-h-[8rem] sm:min-h-[10rem] flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="font-heading text-[1.15rem] font-semibold text-ink leading-snug mb-1 flex items-center gap-2 flex-wrap">
              {exp.degree}
              {exp.featured && <span className="text-[0.85rem]">⭐</span>}
            </div>
            <div className="font-body text-[0.8rem] text-text-muted flex items-center gap-1.5">
              <span className="text-[0.75rem]">🏛️</span>
              {exp.institution}
            </div>
          </div>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 border transition-all duration-300 ${
            open ? "bg-ink text-off-white border-ink rotate-180" : "bg-cream text-warm-brown border-cream-deeper"
          }`}>▾</div>
        </div>

        {/* Field of study badge */}
        {exp.fieldOfStudy && (
          <div className="mb-2.5">
            <span className="inline-flex items-center gap-1.5 font-body text-[0.78rem] font-medium text-accent-teal bg-accent-teal/[0.07] border border-accent-teal/[0.18] rounded-md px-2.5 py-1">
              <span className="text-[0.72rem]">📚</span>
              {exp.fieldOfStudy}
            </span>
          </div>
        )}

        {/* Meta chips */}
        <div className="flex flex-wrap gap-1.5">
          {exp.location && <MetaChip icon="📍" label={exp.location} />}
          <MetaChip icon="📅" label={dateLabel} accent={exp.isCurrent} />
        </div>
      </button>

      {/* Expandable body */}
      <div className="grid transition-[grid-template-rows] duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden min-h-0">
          <div className="px-4 sm:px-5 pb-5 pl-[1.15rem] sm:pl-[1.35rem] border-t border-cream-deeper pt-4">
            {descText && (
              <p className="font-body text-[0.86rem] leading-relaxed text-warm-brown font-light mb-4">
                {descText}
              </p>
            )}

            {/* Coursework tags */}
            {exp.coursework && exp.coursework.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {exp.coursework.map((c, i) => <Tag key={i} label={c} variant="teal" />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Column header ─────────────────────────────────────────────────────────────

function ColHeader({ icon, title, subtitle, accent }: { icon: string; title: string; subtitle: string; accent: "orange" | "teal" }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-off-white border border-cream-deeper rounded-xl">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${
        accent === "orange" ? "bg-accent-orange/10" : "bg-accent-teal/10"
      }`}>
        {icon}
      </div>
      <div>
        <h3 className="font-heading text-[1.1rem] font-semibold text-ink leading-none">{title}</h3>
        <p className="font-mono text-[0.62rem] tracking-wider uppercase text-text-muted mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface WorkEduSectionProps {
  className?: string;
}

export default function WorkEduSection({ className = "" }: WorkEduSectionProps) {
  const { work: rawWork, education: rawEducation, isLoading: loading } = useExperience();

  const byDate = (a: { startDate: string | Date }, b: { startDate: string | Date }) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime();

  const work = [...rawWork].sort(byDate) as IWorkExperience[];
  const education = [...rawEducation].sort(byDate) as IEducation[];

  return (
    <section id="experience" className={`w-full max-w-[1100px] mx-auto font-body ${className}`}>
      <SectionHeader
        eyebrow="Professional Journey"
        title={<>Work Experience & <em className="italic text-warm-brown">Education</em></>}
        subtitle="My professional journey and academic background across backend engineering and system building."
        center
        className="mb-12"
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Work column */}
          <div>
            <ColHeader icon="💼" title="Work Experience" subtitle="Professional Career Journey" accent="orange" />
            <div className="flex flex-col gap-3">
              {work.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-8">No work experience found.</p>
              ) : (
                work.map((exp) => <WorkCard key={exp._id} exp={exp} />)
              )}
            </div>
          </div>

          {/* Education column */}
          <div>
            <ColHeader icon="🎓" title="Education" subtitle="Academic Background" accent="teal" />
            <div className="flex flex-col gap-3">
              {education.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-8">No education found.</p>
              ) : (
                education.map((exp) => <EduCard key={exp._id} exp={exp} />)
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
