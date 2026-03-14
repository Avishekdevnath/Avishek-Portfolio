"use client";

import React from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ExperienceSection from "@/components/ExperienceSection";
import PageReadyOnMount from "@/components/shared/PageReadyOnMount";
import {
  FaGraduationCap,
  FaBook,
  FaAward,
  FaUsers,
  FaLightbulb,
  FaCertificate,
} from "react-icons/fa";

const ACCENT_COLORS = ["bg-accent-orange", "bg-accent-teal", "bg-accent-blue", "bg-[#c4841a]"];
const ICON_BG = [
  "bg-accent-orange/10 text-accent-orange",
  "bg-accent-teal/10 text-accent-teal",
  "bg-accent-blue/10 text-accent-blue",
  "bg-[rgba(196,132,26,0.10)] text-[#c4841a]",
];

export default function EducationPage() {
  const educationHighlights = [
    {
      icon: <FaGraduationCap className="w-5 h-5" />,
      title: "Academic Excellence",
      description:
        "Pursuing advanced studies in Computer Science with a focus on cutting-edge technologies and research methodologies.",
    },
    {
      icon: <FaBook className="w-5 h-5" />,
      title: "Research & Learning",
      description:
        "Engaged in continuous learning and research, exploring new technologies and contributing to academic projects.",
    },
    {
      icon: <FaAward className="w-5 h-5" />,
      title: "Academic Achievements",
      description:
        "Recognition for academic performance, participation in honors programs, and contributions to the academic community.",
    },
    {
      icon: <FaUsers className="w-5 h-5" />,
      title: "Community Involvement",
      description:
        "Active participation in student organizations, clubs, and academic initiatives that enhance the learning experience.",
    },
  ];

  const academicFocus = [
    {
      icon: <FaLightbulb className="w-4 h-4" />,
      area: "Computer Science",
      description:
        "Core computer science principles, algorithms, and software engineering practices",
    },
    {
      icon: <FaCertificate className="w-4 h-4" />,
      area: "Research Methods",
      description:
        "Academic research methodologies and scientific inquiry approaches",
    },
    {
      icon: <FaBook className="w-4 h-4" />,
      area: "Technology Innovation",
      description:
        "Emerging technologies and their practical applications in modern software development",
    },
  ];

  return (
    <div className="min-h-screen bg-cream font-body">
      <PageReadyOnMount />
      <div className="pt-6">
        <Header />
      </div>

      <main>
        <div className="max-w-[1100px] mx-auto px-4 py-16 space-y-16">

          {/* ── Page header ── */}
          <div className="text-center">
            <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-accent-orange opacity-50" />
              Academic Journey
              <span className="w-8 h-px bg-accent-orange opacity-50" />
            </p>
            <h1
              className="font-heading font-light text-ink mb-4 leading-[1.05]"
              style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
            >
              <em className="italic text-warm-brown">Education</em>
            </h1>
            <p className="text-[0.9rem] text-text-muted max-w-[54ch] mx-auto leading-[1.75] font-light">
              My educational background, academic achievements, and continuous
              learning journey in computer science and technology.
            </p>
          </div>

          {/* ── Highlights ── */}
          <div>
            <div className="text-center mb-10">
              <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
                <span className="w-8 h-px bg-accent-orange opacity-50" />
                Highlights
                <span className="w-8 h-px bg-accent-orange opacity-50" />
              </p>
              <h2
                className="font-heading font-light text-ink mb-4 leading-[1.05]"
                style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
              >
                Educational <em className="italic text-warm-brown">Excellence</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {educationHighlights.map((highlight, i) => (
                <div
                  key={i}
                  className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-6 py-6 hover:border-sand hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${ACCENT_COLORS[i % ACCENT_COLORS.length]} rounded-l-[0.9rem]`} />
                  <div className={`w-10 h-10 rounded-lg ${ICON_BG[i % ICON_BG.length]} flex items-center justify-center mb-4`}>
                    {highlight.icon}
                  </div>
                  <h3 className="font-heading text-[1.05rem] font-semibold text-ink mb-2 leading-snug">
                    {highlight.title}
                  </h3>
                  <p className="font-body text-[0.83rem] text-text-muted leading-[1.7] font-light">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Academic Focus Areas ── */}
          <div>
            <div className="text-center mb-10">
              <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
                <span className="w-8 h-px bg-accent-orange opacity-50" />
                Focus Areas
                <span className="w-8 h-px bg-accent-orange opacity-50" />
              </p>
              <h2
                className="font-heading font-light text-ink mb-4 leading-[1.05]"
                style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
              >
                Academic Focus <em className="italic text-warm-brown">Areas</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {academicFocus.map((focus, i) => (
                <div
                  key={i}
                  className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-6 py-5 flex items-start gap-4 hover:border-sand hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${ACCENT_COLORS[i % ACCENT_COLORS.length]} rounded-l-[0.9rem]`} />
                  <div className={`w-9 h-9 rounded-lg ${ICON_BG[i % ICON_BG.length]} flex items-center justify-center shrink-0`}>
                    {focus.icon}
                  </div>
                  <div>
                    <h4 className="font-heading text-[1rem] font-semibold text-ink mb-1">
                      {focus.area}
                    </h4>
                    <p className="font-body text-[0.83rem] text-text-muted leading-[1.7] font-light">
                      {focus.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Dynamic Education Entries ── */}
          <ExperienceSection
            type="education"
            variant="detailed"
            showFeaturedOnly={false}
            title={<>Educational <em className="italic text-warm-brown">Background</em></>}
            subtitle="Academic institutions, degrees, and qualifications"
            className="bg-transparent py-0"
          />

          {/* ── CTA ── */}
          <div className="relative bg-ink rounded-[0.9rem] px-8 py-10 text-center overflow-hidden">
            <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-sand mb-3 flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-sand opacity-50" />
              Lifelong Learning
              <span className="w-8 h-px bg-sand opacity-50" />
            </p>
            <h3
              className="font-heading font-light text-cream mb-4 leading-[1.05]"
              style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)" }}
            >
              Continuous Learning
            </h3>
            <p className="font-body text-[0.9rem] text-sand opacity-80 max-w-[50ch] mx-auto leading-[1.75] font-light mb-8">
              Education is a lifelong journey. I&apos;m always exploring new
              technologies, methodologies, and opportunities to expand my
              knowledge and skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 font-body bg-accent-orange text-off-white px-7 py-3 rounded-md text-[0.83rem] font-medium tracking-wide border-[1.5px] border-accent-orange hover:bg-off-white hover:text-ink hover:border-off-white transition-all duration-250"
              >
                Discuss Opportunities
              </a>
              <a
                href="/projects"
                className="inline-flex items-center justify-center gap-2 font-body bg-transparent text-cream px-7 py-3 rounded-md text-[0.83rem] font-medium tracking-wide border-[1.5px] border-sand/40 hover:border-cream hover:text-off-white transition-all duration-250"
              >
                View Projects
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
