"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import PageReadyOnMount from "@/components/shared/PageReadyOnMount";

interface Tool {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  link?: string;
}

const ACCENT_COLORS = ["bg-accent-orange", "bg-accent-teal", "bg-accent-blue", "bg-[#c4841a]"];
const accentCache = new Map<string, number>();
let accentIdx = 0;
function getAccentIdx(category: string) {
  if (!accentCache.has(category)) {
    accentCache.set(category, accentIdx % ACCENT_COLORS.length);
    accentIdx++;
  }
  return accentCache.get(category)!;
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/tools");
        const data = await res.json();
        if (data.success) setTools(data.data);
        else setError(data.error || "Failed to fetch tools");
      } catch {
        setError("Failed to fetch tools");
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  const categories = useMemo(() => {
    return [
      "all",
      ...Array.from(
        new Set(tools.map((tool) => tool.category).filter((c): c is string => !!c))
      ),
    ];
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tool.description && tool.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        selectedCategory === "all" || tool.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tools, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-cream font-body">
      <PageReadyOnMount />
      <div className="pt-6">
        <Header />
      </div>

      <main className="max-w-[1100px] mx-auto px-4 py-16">
        {/* ── Header ── */}
        <div className="text-center mb-12">
          <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-accent-orange opacity-50" />
            Explore My
            <span className="w-8 h-px bg-accent-orange opacity-50" />
          </p>
          <h1
            className="font-heading font-light text-ink mb-4 leading-[1.05]"
            style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
          >
            AI & Utility <em className="italic text-warm-brown">Tools</em>
          </h1>
          <p className="text-[0.9rem] text-text-muted max-w-[54ch] mx-auto leading-[1.75] font-light">
            A collection of powerful tools to help you be more productive.
          </p>
        </div>

        {/* ── Controls ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-9">
          {categories.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[0.82rem] font-medium border-[1.5px] transition-all duration-200 whitespace-nowrap font-body ${
                    selectedCategory === cat
                      ? "bg-ink text-off-white border-ink"
                      : "bg-off-white text-text-muted border-cream-deeper hover:border-sand hover:text-ink"
                  }`}
                >
                  {cat === "all" ? "All Tools" : cat}
                </button>
              ))}
            </div>
          )}

          <div className="relative flex-1 max-w-[320px]">
            <input
              type="text"
              placeholder="Search tools…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 px-4 border-[1.5px] border-cream-deeper rounded-full bg-off-white font-body text-[0.84rem] text-ink outline-none transition-all duration-200 placeholder:text-text-muted focus:border-sand focus:shadow-[0_0_0_3px_rgba(201,185,154,0.2)]"
            />
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-off-white border border-cream-deeper rounded-[0.85rem] p-6 animate-pulse space-y-3"
              >
                <div className="h-8 bg-cream-dark rounded w-8" />
                <div className="h-5 bg-cream-dark rounded w-3/4" />
                <div className="h-4 bg-cream-dark rounded w-full" />
                <div className="h-4 bg-cream-dark rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-off-white border border-cream-deeper text-ink px-6 py-4 rounded-[0.85rem]">
            <p className="font-semibold">Error loading tools</p>
            <p className="text-sm mt-1 text-warm-brown">{error}</p>
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p className="font-heading text-[2.5rem] opacity-20 mb-2">🛠️</p>
            <p className="text-[0.9rem] font-light">No tools have been added yet.</p>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p className="font-heading text-[2.5rem] opacity-20 mb-2">🔍</p>
            <p className="text-[0.9rem] font-light">No tools found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => {
              const ai = getAccentIdx(tool.category || "default");
              return (
                <div
                  key={tool._id}
                  className="group relative bg-off-white border border-cream-deeper rounded-[0.85rem] p-6 overflow-hidden hover:border-sand hover:shadow-[0_8px_28px_rgba(74,55,40,0.1)] hover:-translate-y-[3px] transition-all duration-300"
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-[3px] ${ACCENT_COLORS[ai]} rounded-l-[0.85rem]`}
                  />
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-[1.8rem]">{tool.icon}</div>
                    {!tool.link && (
                      <span className="font-mono text-[0.6rem] tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#c4841a]/10 text-[#c4841a]">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-[1.1rem] font-semibold text-ink mb-2 leading-snug group-hover:text-accent-orange transition-colors duration-200">
                    {tool.name}
                  </h3>
                  <p className="font-body text-[0.83rem] text-text-muted leading-[1.7] font-light mb-4">
                    {tool.description}
                  </p>
                  {tool.link && (
                    <Link
                      href={tool.link}
                      className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] tracking-wider uppercase text-accent-orange hover:text-ink transition-colors duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Try it out
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
