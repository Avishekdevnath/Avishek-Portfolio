"use client";

import React from "react";
import ExperienceSection from "./ExperienceSection";
import type { ExperienceType } from "@/types/experience";

interface ExperienceSectionTightProps {
  type?: ExperienceType | "both";
  variant?: "default" | "compact" | "detailed";
  showFeaturedOnly?: boolean;
  limit?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function ExperienceSectionTight({
  type = "both",
  variant = "default",
  showFeaturedOnly = false,
  limit,
  title,
  subtitle,
  className = "",
}: ExperienceSectionTightProps) {
  return (
    <ExperienceSection
      type={type}
      variant={variant}
      showFeaturedOnly={showFeaturedOnly}
      limit={limit}
      title={title}
      subtitle={subtitle}
      className={`pt-0 md:pt-0 ${className}`}
    />
  );
}


