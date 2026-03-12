"use client";

import { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number; // 2 or 3
}

interface BlogTOCProps {
  items: TOCItem[];
}

export default function BlogTOC({ items }: BlogTOCProps) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (items.length === 0) return;

    const handleScroll = () => {
      let current = "";
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          current = item.id;
        }
      }
      setActiveId(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="bg-off-white border border-cream-deeper rounded-[.85rem] overflow-hidden">
      <div className="px-4 py-3 border-b border-cream-deeper bg-[rgba(240,236,227,.5)] flex items-center gap-2">
        <svg className="w-[13px] h-[13px] text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        <span className="font-mono text-[.62rem] tracking-[.12em] uppercase text-text-muted">
          Table of Contents
        </span>
      </div>
      <ul className="list-none py-3">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block py-1.5 font-body transition-all duration-150 border-l-2 ${
                item.level === 3 ? "pl-7 text-[.75rem]" : "pl-4 text-[.8rem]"
              } ${
                activeId === item.id
                  ? "text-accent-orange border-l-accent-orange bg-[rgba(212,98,42,.04)]"
                  : "text-text-muted border-l-transparent hover:text-accent-orange hover:border-l-accent-orange hover:bg-[rgba(212,98,42,.04)]"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
