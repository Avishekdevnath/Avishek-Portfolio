"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SectionHeader from "./shared/SectionHeader";
import {
  programmingCategories,
  softwareCategories,
  languageItems,
  languagePills,
  dsaStats,
  dsaTopics,
  type SkillItem,
  type SkillCategory,
  type PillItem,
  type PillGroup,
  type BarColor,
  type IconBg,
} from "../data/data";

// ── Color maps ──
const barColorClass: Record<BarColor, string> = {
  orange: "bg-gradient-to-r from-[#c4841a] to-accent-orange",
  teal: "bg-gradient-to-r from-[#2d5a8e] to-accent-teal",
  blue: "bg-gradient-to-r from-accent-blue to-[#4a90d9]",
  warm: "bg-gradient-to-r from-deep-brown to-warm-brown",
};

const levelBadgeClass: Record<string, string> = {
  Expert: "bg-accent-orange/10 text-accent-orange",
  Advanced: "bg-accent-teal/10 text-accent-teal",
  Proficient: "bg-accent-blue/10 text-accent-blue",
  Learning: "bg-[#c4841a]/10 text-[#c4841a]",
};

const iconBgClass: Record<IconBg, string> = {
  orange: "bg-accent-orange/10",
  teal: "bg-accent-teal/10",
  blue: "bg-accent-blue/10",
  amber: "bg-[#c4841a]/10",
  warm: "bg-warm-brown/[0.12]",
};

const badgeVariantClass: Record<string, string> = {
  native: "bg-accent-orange/10 text-accent-orange",
  professional: "bg-accent-teal/10 text-accent-teal",
  conversational: "bg-accent-blue/10 text-accent-blue",
};

const langBorderClass: Record<string, string> = {
  native: "before:bg-accent-orange",
  professional: "before:bg-accent-teal",
  conversational: "before:bg-accent-blue",
};

// ── Tab config ──
type TabKey = "programming" | "software" | "languages" | "dsa";
const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "programming", label: "Programming", icon: "⌨️" },
  { key: "software", label: "Software", icon: "🛠️" },
  { key: "languages", label: "Languages", icon: "🌐" },
  { key: "dsa", label: "DSA", icon: "🧩" },
];

// ── Progress bar with intersection animation ──
function SkillBar({ percentage, barColor }: { percentage: number; barColor: BarColor }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setWidth(percentage); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [percentage]);

  return (
    <div ref={ref} className="relative">
      <div className="h-1 bg-cream-deeper rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${barColorClass[barColor]}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

// ── Skill card ──
function SkillCard({ skill }: { skill: SkillItem }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`group bg-cream border border-cream-deeper rounded-[0.6rem] p-4 transition-all duration-250 cursor-default relative overflow-hidden ${
        skill.wide ? "col-span-2 max-sm:col-span-1" : ""
      } hover:border-sand hover:bg-off-white hover:-translate-y-0.5 hover:shadow-md`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[0.88rem] font-medium text-ink flex items-center gap-2">
          <span className="text-[0.95rem]">{skill.emoji}</span>
          {skill.name}
        </span>
        <span className={`font-ui text-[0.6rem] tracking-wider uppercase px-2.5 py-0.5 rounded-full ${levelBadgeClass[skill.level]}`}>
          {skill.level}
        </span>
      </div>
      <div className="relative">
        <span className={`absolute right-0 -top-5 font-ui text-[0.6rem] text-text-muted transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}>
          {skill.percentage}%
        </span>
        <SkillBar percentage={skill.percentage} barColor={skill.barColor} />
      </div>
    </div>
  );
}

// ── Pill cloud ──
function PillCloud({ pills }: { pills: PillItem[] }) {
  const variantClass: Record<string, string> = {
    default: "border-cream-deeper text-warm-brown hover:border-accent-orange hover:text-accent-orange hover:bg-accent-orange/[0.04]",
    featured: "border-sand text-ink text-[0.72rem] px-4 py-1.5",
    teal: "border-accent-teal/30 text-accent-teal hover:border-accent-teal hover:bg-accent-teal/[0.05]",
    blue: "border-accent-blue/30 text-accent-blue hover:border-accent-blue hover:bg-accent-blue/[0.05]",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((pill) => (
        <span
          key={pill.name}
          className={`font-ui text-[0.68rem] tracking-wide px-3.5 py-1 border rounded-full bg-off-white transition-all duration-200 cursor-default ${
            variantClass[pill.variant || "default"]
          }`}
        >
          {pill.name}
        </span>
      ))}
    </div>
  );
}

function PillSection({ group }: { group: PillGroup }) {
  return (
    <div>
      <h4 className="font-ui text-[0.65rem] tracking-[0.18em] uppercase text-text-muted mb-3 flex items-center gap-2.5">
        {group.title}
        <span className="flex-1 h-px bg-cream-deeper" />
      </h4>
      <PillCloud pills={group.pills} />
    </div>
  );
}

// ── Accordion ──
function Accordion({
  categories,
  openIndex,
  onToggle,
}: {
  categories: SkillCategory[];
  openIndex: number | null;
  onToggle: (i: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {categories.map((cat, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={cat.label}
            className={`bg-off-white border rounded-xl overflow-hidden transition-all duration-250 ${
              isOpen ? "border-sand shadow-md" : "border-cream-deeper"
            }`}
          >
            {/* Header */}
            <button
              onClick={() => onToggle(i)}
              className="w-full flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors hover:bg-cream/50 gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${iconBgClass[cat.iconBg]}`}>
                  {cat.icon}
                </div>
                <span className="font-ui text-xl font-semibold text-ink">{cat.label}</span>
                <span className="font-ui text-[0.65rem] tracking-wider text-text-muted bg-cream-dark px-2.5 py-0.5 rounded-full">
                  {cat.skills ? `${cat.skills.length} skills` : `${cat.pillGroups?.reduce((n, g) => n + g.pills.length, 0)} items`}
                </span>
              </div>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 border transition-all duration-300 ${
                isOpen
                  ? "bg-ink text-off-white border-ink rotate-180"
                  : "bg-cream text-warm-brown border-cream-deeper"
              }`}>
                ▾
              </div>
            </button>

            {/* Body */}
            <div
              className="grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden min-h-0">
                <div className="px-5 pb-5">
                  {cat.skills && (
                    <div className="grid grid-cols-3 md:grid-cols-3 sm:grid-cols-2 max-sm:grid-cols-1 gap-3">
                      {cat.skills.map((skill) => (
                        <SkillCard key={skill.name} skill={skill} />
                      ))}
                    </div>
                  )}
                  {cat.pillGroups && (
                    <div className="flex flex-col gap-5">
                      {cat.skills && <div className="h-3" />}
                      {cat.pillGroups.map((group) => (
                        <PillSection key={group.title} group={group} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Language card ──
function LanguageCard({ lang }: { lang: typeof languageItems[0] }) {
  const isTextFlag = lang.flag.length <= 3 && !lang.flag.match(/\p{Emoji}/u);
  return (
    <div className={`group relative bg-off-white border border-cream-deeper rounded-xl px-6 py-5 flex items-center gap-5 transition-all duration-250 overflow-hidden hover:border-sand hover:shadow-md hover:translate-x-1 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-l-[3px] before:transition-colors ${langBorderClass[lang.badgeVariant]}`}>
      <div className="w-[52px] h-[52px] rounded-lg bg-cream border border-cream-deeper flex items-center justify-center text-[1.6rem] shrink-0 transition-all group-hover:bg-cream-dark group-hover:border-sand">
        {isTextFlag ? (
          <span className="font-ui text-base font-medium text-ink tracking-wide">{lang.flag}</span>
        ) : (
          lang.flag
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-ui text-xl font-semibold text-ink leading-none mb-1">{lang.name}</div>
        <div className="font-ui text-[0.65rem] tracking-wider uppercase text-text-muted">{lang.description}</div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={`font-ui text-[0.6rem] tracking-wider uppercase px-3 py-0.5 rounded-full ${badgeVariantClass[lang.badgeVariant]}`}>
          {lang.levelLabel}
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, j) => (
            <div
              key={j}
              className={`w-[7px] h-[7px] rounded-full transition-colors ${
                j < lang.dots ? "bg-accent-orange" : "bg-cream-deeper"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DSA stats strip ──
function DsaStrip() {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-4 max-sm:grid-cols-2 gap-3 mb-5">
      {dsaStats.map((stat) => (
        <div key={stat.label} className="bg-ink rounded-[0.65rem] p-5 text-center">
          <div className="font-ui text-4xl font-semibold text-cream leading-none mb-1">{stat.value}</div>
          <div className="font-ui text-[0.6rem] tracking-wider uppercase text-sand/45">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}


// ── Main component ──
interface SkillsSectionProps {
  className?: string;
}

export default function SkillsSection({ className = "" }: SkillsSectionProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("programming");
  const [progOpen, setProgOpen] = useState<number | null>(0);
  const [softOpen, setSoftOpen] = useState<number | null>(0);
  const [dsaOpen, setDsaOpen] = useState<number | null>(0);

  const handleProgToggle = useCallback((i: number) => setProgOpen((prev) => (prev === i ? null : i)), []);
  const handleSoftToggle = useCallback((i: number) => setSoftOpen((prev) => (prev === i ? null : i)), []);
  const handleDsaToggle = useCallback((i: number) => setDsaOpen((prev) => (prev === i ? null : i)), []);

  return (
    <section id="skills" className={`w-full max-w-[1100px] mx-auto font-ui ${className}`}>
      {/* Header */}
      <SectionHeader
        eyebrow="Explore My"
        title="Technical Skills"
        subtitle="A comprehensive overview of my technical skills, programming languages, and software tools expertise."
        center
        className="mb-12"
      />

      {/* Tab switcher */}
      <div className="flex items-center justify-center mb-10">
        <div className="flex items-center gap-1.5 bg-off-white border border-cream-deeper rounded-full p-1 shadow-sm flex-wrap justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`font-ui text-[0.72rem] tracking-wider uppercase px-5 py-2.5 rounded-full border-none flex items-center gap-2 whitespace-nowrap transition-all duration-250 cursor-pointer ${
                activeTab === tab.key
                  ? "bg-ink text-off-white shadow-md"
                  : "bg-transparent text-text-muted hover:text-ink"
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {/* Programming */}
        {activeTab === "programming" && (
          <div className="animate-fadeIn">
            <Accordion categories={programmingCategories} openIndex={progOpen} onToggle={handleProgToggle} />
          </div>
        )}

        {/* Software */}
        {activeTab === "software" && (
          <div className="animate-fadeIn">
            <Accordion categories={softwareCategories} openIndex={softOpen} onToggle={handleSoftToggle} />
          </div>
        )}

        {/* Languages */}
        {activeTab === "languages" && (
          <div className="animate-fadeIn">
            <div className="flex flex-col gap-3 mb-8">
              {languageItems.map((lang) => (
                <LanguageCard key={lang.name} lang={lang} />
              ))}
            </div>
            <PillSection group={{ title: "Technical Communication Skills", pills: languagePills }} />
          </div>
        )}

        {/* DSA */}
        {activeTab === "dsa" && (
          <div className="animate-fadeIn">
            <DsaStrip />
            <Accordion
              categories={[{
                label: "Topics Covered",
                icon: "🧩",
                iconBg: "orange",
                skills: dsaTopics.map((t) => ({
                  name: t.name,
                  emoji: "",
                  level: (t.percentage >= 80 ? "Expert" : t.percentage >= 60 ? "Advanced" : "Proficient") as any,
                  percentage: t.percentage,
                  barColor: t.barColor,
                })),
              }]}
              openIndex={dsaOpen}
              onToggle={handleDsaToggle}
            />
          </div>
        )}
      </div>
    </section>
  );
}
