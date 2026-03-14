"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "@/components/shared/LoadingScreen";
import { Code, Palette, Server, Brain, FileText, Laptop } from "lucide-react";
import { SiMicrosoftoffice, SiGoogle, SiNotion, SiTrello, SiCanva } from "react-icons/si";
import "../../../styles/skills.css";

interface Skill {
  _id: string;
  name: string;
  proficiency: number;
  icon?: string;
  iconSet?: string;
  description?: string;
  featured: boolean;
  order: number;
}

interface ApiResponse {
  success: boolean;
  data: Record<string, Skill[]>;
  error?: string;
}

const ACCENT_COLORS = ["bg-accent-orange", "bg-accent-teal", "bg-accent-blue", "bg-[#c4841a]"];
const ICON_BG = [
  "bg-accent-orange/10 text-accent-orange",
  "bg-accent-teal/10 text-accent-teal",
  "bg-accent-blue/10 text-accent-blue",
  "bg-[rgba(196,132,26,0.10)] text-[#c4841a]",
];

// Category icons mapping
const CategoryIcons: Record<string, JSX.Element> = {
  "Frontend Development": <Palette className="w-5 h-5" />,
  "Backend Development": <Server className="w-5 h-5" />,
  "AI & Machine Learning": <Brain className="w-5 h-5" />,
  "Graphics & Design": <Laptop className="w-5 h-5" />,
  "Office & Productivity": <FileText className="w-5 h-5" />,
};

// Skill-specific icons mapping
const SkillIcons: Record<string, JSX.Element> = {
  "Microsoft Office": <SiMicrosoftoffice className="w-4 h-4" />,
  "Google Workspace": <SiGoogle className="w-4 h-4" />,
  "Notion": <SiNotion className="w-4 h-4" />,
  "Trello": <SiTrello className="w-4 h-4" />,
  "Canva": <SiCanva className="w-4 h-4" />,
};

export default function Experience() {
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, Skill[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);

        const skillsResponse = await fetch("/api/skills");
        if (!skillsResponse.ok) {
          throw new Error("Failed to fetch skills");
        }
        const skillsData = (await skillsResponse.json()) as ApiResponse;
        if (!skillsData.success) {
          throw new Error(skillsData.error || "Failed to fetch skills");
        }
        setSkillsByCategory(skillsData.data);
        setTimeout(() => setAnimate(true), 100);
      } catch (error) {
        console.error("Error fetching skills:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch skills");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return null;

  const categoryEntries = Object.entries(skillsByCategory);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4 bg-cream font-body">
      {/* Header Section */}
      <div className="text-center mb-12">
        <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-accent-orange opacity-50" />
          Technical Expertise
          <span className="w-8 h-px bg-accent-orange opacity-50" />
        </p>
        <h2
          className="font-heading font-light text-ink leading-[1.05] mb-4"
          style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
        >
          Professional <em className="italic text-warm-brown">Skills</em>
        </h2>
        <p className="text-[0.9rem] text-text-muted max-w-[54ch] mx-auto leading-[1.75] font-light">
          A clean, focused snapshot of the tools and domains I work with across
          backend, frontend, and product delivery.
        </p>
      </div>

      {/* Skills Grid */}
      <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 gap-5">
        {categoryEntries.map(([category, skills], index) => (
          <div
            key={category}
            className={`relative bg-off-white border border-cream-deeper rounded-[0.9rem] p-6 overflow-hidden transition-all duration-300 hover:border-sand hover:shadow-lg ${
              animate ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 80}ms` }}
          >
            {/* Left accent bar */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-[3px] ${ACCENT_COLORS[index % ACCENT_COLORS.length]} rounded-l-[0.9rem]`}
            />

            {/* Category Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg ${ICON_BG[index % ICON_BG.length]} flex items-center justify-center shrink-0`}
                >
                  {CategoryIcons[category] || <Code className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-heading text-[1.1rem] font-semibold text-ink leading-none">
                    {category}
                  </h3>
                  <p className="font-mono text-[0.62rem] tracking-wider uppercase text-text-muted mt-0.5">
                    {skills.length} {skills.length === 1 ? "Skill" : "Skills"}
                  </p>
                </div>
              </div>
              <span className="font-mono text-[0.6rem] tracking-wider uppercase text-text-muted bg-cream-dark px-2.5 py-0.5 rounded-full">
                Focus Area
              </span>
            </div>

            {/* Skills List */}
            <div className="space-y-3">
              {skills
                .sort((a, b) => a.order - b.order)
                .map((skill) => (
                  <div
                    key={skill._id}
                    className="bg-cream border border-cream-deeper rounded-[0.6rem] px-4 py-3 hover:border-sand hover:bg-off-white transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {SkillIcons[skill.name] && (
                          <span className="text-warm-brown">
                            {SkillIcons[skill.name]}
                          </span>
                        )}
                        <span className="font-body text-[0.88rem] font-medium text-ink">
                          {skill.name}
                        </span>
                      </div>
                      <span className="font-mono text-[0.6rem] font-semibold text-text-muted">
                        {skill.proficiency}/5
                      </span>
                    </div>
                    <div className="mt-2 h-1 w-full rounded-full bg-cream-deeper overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#c4841a] to-accent-orange transition-all duration-1000"
                        style={{ width: `${(skill.proficiency / 5) * 100}%` }}
                      />
                    </div>
                    {skill.description && (
                      <p className="mt-2 font-body text-[0.8rem] text-text-muted leading-[1.6] font-light">
                        {skill.description}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
