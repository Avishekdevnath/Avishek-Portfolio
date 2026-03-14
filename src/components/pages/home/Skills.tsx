"use client";

import { useState, useEffect, useRef } from "react";
import { useSkills } from "@/lib/swr";

// ── Skill name → emoji map ──
const skillEmoji: Record<string, string> = {
  "TensorFlow": "🔶",
  "PyTorch": "🔥",
  "Scikit-learn": "📊",
  "OpenCV": "👁️",
  "Pandas": "🐼",
  "FastAPI": "⚡",
  "Django": "🐍",
  "Node.js": "🟢",
  "Express.js": "🌐",
  "MongoDB": "🍃",
  "PostgreSQL": "🐘",
  "Python": "🐍",
  "React": "⚛️",
  "Next.js": "▲",
  "TypeScript": "🟦",
  "Tailwind CSS": "💨",
  "HTML5/CSS3": "🌐",
  "HTML5 / CSS3": "🌐",
  "Photoshop": "🖼️",
  "Figma": "🎭",
  "Illustrator": "✏️",
  "Canva": "🟦",
  "Microsoft Office": "📘",
  "Google Workspace": "🌐",
  "Notion": "📝",
  "Trello": "📋",
  "JavaScript": "🟨",
  "Java": "☕",
  "C++": "⚙️",
  "Flutter": "💙",
  "Docker": "🐳",
  "Git": "📂",
  "Linux": "🐧",
  "AWS": "☁️",
  "Firebase": "🔥",
  "Redis": "🔴",
  "GraphQL": "◆",
  "REST API": "🔗",
  "NumPy": "🔢",
};

function getSkillIcon(skill: { name: string; icon?: string }): string {
  return skillEmoji[skill.name] || "•";
}

// ── Category visual config ──
const categoryConfig: Record<
  string,
  { icon: string; iconBg: string; barGradient: string }
> = {
  "AI & Machine Learning": {
    icon: "🤖",
    iconBg: "bg-[rgba(124,58,237,0.1)]",
    barGradient: "from-[#7c3aed] to-[#a855f7]",
  },
  "Backend Development": {
    icon: "⚙️",
    iconBg: "bg-accent-teal/10",
    barGradient: "from-accent-blue to-accent-teal",
  },
  "Frontend Development": {
    icon: "🎨",
    iconBg: "bg-accent-blue/10",
    barGradient: "from-accent-blue to-[#4a90d9]",
  },
  "Graphics & Design": {
    icon: "🖌️",
    iconBg: "bg-[rgba(219,39,119,0.1)]",
    barGradient: "from-[#9333ea] to-[#ec4899]",
  },
  "Office & Productivity": {
    icon: "📋",
    iconBg: "bg-[rgba(196,132,26,0.1)]",
    barGradient: "from-[#92400e] to-[#c4841a]",
  },
};

const categoryOrder = [
  "AI & Machine Learning",
  "Backend Development",
  "Frontend Development",
  "Graphics & Design",
  "Office & Productivity",
];

interface Skill {
  _id: string;
  name: string;
  proficiency: number;
  icon?: string;
  description?: string;
  featured?: boolean;
  order?: number;
}

// ── Dot rating ──
function DotRating({ value, max = 5 }: { value: number; max?: number }) {
  const full = Math.floor(value);
  const hasHalf = value % 1 >= 0.25;
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: max }).map((_, i) => {
        if (i < full) {
          return <div key={i} className="w-[7px] h-[7px] rounded-full bg-accent-orange" />;
        }
        if (i === full && hasHalf) {
          return (
            <div
              key={i}
              className="w-[7px] h-[7px] rounded-full"
              style={{ background: "linear-gradient(90deg, #d4622a 50%, #ddd5c5 50%)" }}
            />
          );
        }
        return <div key={i} className="w-[7px] h-[7px] rounded-full bg-cream-deeper" />;
      })}
    </div>
  );
}

// ── Animated progress bar ──
function ProgressBar({ percentage, gradient }: { percentage: number; gradient: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setWidth(percentage);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [percentage]);

  return (
    <div ref={ref} className="h-[3px] bg-cream-deeper rounded-[3px] overflow-hidden">
      <div
        className={`h-full rounded-[3px] bg-gradient-to-r ${gradient} transition-[width] duration-[1.1s] ease-[cubic-bezier(0.4,0,0.2,1)]`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

// ── Skill row ──
function SkillRow({ skill, gradient }: { skill: Skill; gradient: string }) {
  const pct = (skill.proficiency / 5) * 100;
  return (
    <div className="px-6 py-[0.9rem] border-b border-cream-deeper last:border-b-0 transition-colors hover:bg-cream/50">
      <div className="flex items-center justify-between mb-[0.55rem] gap-3">
        <div className="flex items-center gap-[0.6rem] min-w-0">
          <div className="w-5 h-5 rounded-[0.3rem] flex-shrink-0 flex items-center justify-center text-[0.85rem] bg-cream-dark border border-cream-deeper">
            {getSkillIcon(skill)}
          </div>
          <span className="font-body text-[0.9rem] font-medium text-ink whitespace-nowrap overflow-hidden text-ellipsis">
            {skill.name}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-mono text-[0.68rem] text-text-muted whitespace-nowrap">
            {skill.proficiency} / 5
          </span>
          <DotRating value={skill.proficiency} />
        </div>
      </div>
      <ProgressBar percentage={pct} gradient={gradient} />
      {skill.description && (
        <p className="font-body text-[0.78rem] text-text-muted leading-[1.5] font-light mt-[0.45rem]">
          {skill.description}
        </p>
      )}
    </div>
  );
}

// ── Category card ──
function CategoryCard({ category, skills }: { category: string; skills: Skill[] }) {
  const config = categoryConfig[category] || {
    icon: "📦",
    iconBg: "bg-cream-dark",
    barGradient: "from-warm-brown to-sand",
  };

  return (
    <div className="bg-off-white border border-cream-deeper rounded-[0.85rem] overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-sand hover:shadow-[0_8px_28px_rgba(74,55,40,0.09)]">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 pt-[1.4rem] pb-[1.1rem] gap-4 border-b border-cream-deeper">
        <div className="flex items-center gap-[0.85rem]">
          <div className={`w-10 h-10 rounded-[0.6rem] flex items-center justify-center text-[1.15rem] flex-shrink-0 ${config.iconBg}`}>
            {config.icon}
          </div>
          <div>
            <div className="font-heading text-[1.2rem] font-semibold text-ink leading-[1.1]">
              {category}
            </div>
            <div className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-text-muted mt-[0.18rem]">
              {skills.length} Skill{skills.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        <span className="font-mono text-[0.58rem] tracking-[0.14em] uppercase text-text-muted bg-cream-dark border border-cream-deeper px-[0.65rem] py-[0.22rem] rounded-full whitespace-nowrap">
          Focus Area
        </span>
      </div>

      {/* Skill rows */}
      <div className="py-[0.4rem]">
        {skills
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((skill) => (
            <SkillRow key={skill._id} skill={skill} gradient={config.barGradient} />
          ))}
      </div>
    </div>
  );
}

// ── Main ──
export default function Skills() {
  const { grouped, isLoading: loading } = useSkills();

  const categories = categoryOrder.filter(
    (cat) => grouped[cat] && grouped[cat].length > 0
  );

  return (
    <section className="w-full max-w-[1100px] mx-auto px-6 py-20">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-[0.7rem]">
          <span className="block w-8 h-px bg-accent-orange opacity-50" />
          Technical Expertise
          <span className="block w-8 h-px bg-accent-orange opacity-50" />
        </p>
        <h2 className="font-heading text-[clamp(2.2rem,5vw,3.6rem)] font-light leading-[1.05] text-ink mb-[0.9rem]">
          Professional <em className="text-warm-brown">Skills</em>
        </h2>
        <p className="text-[0.9rem] text-text-muted max-w-[54ch] mx-auto leading-[1.75] font-light">
          A clean, focused snapshot of the tools and domains I work with across
          backend, frontend, and product delivery.
        </p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-off-white border border-cream-deeper rounded-[0.85rem] h-64 animate-pulse" />
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((cat) => (
            <CategoryCard key={cat} category={cat} skills={grouped[cat]} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && categories.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-muted text-sm">No skills added yet.</p>
        </div>
      )}
    </section>
  );
}
