"use client";

import { useEffect, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Image from "next/image";
import { FaEnvelope, FaLinkedin } from "react-icons/fa";

import ProjectGrid from "@/components/ProjectGrid";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import WorkEduSection from "@/components/WorkEduSection";
import SkillsSection from "@/components/SkillsSection";
import { useSettings, useProjects, useExperience } from "@/lib/swr";
import { usePageReady } from "@/context/PageReadyContext";

export default function About() {
  const { profileImage: fetchedImage, isLoading: settingsLoading } = useSettings();
  const profileImage = fetchedImage || "/assets/home/profile-img.jpg";
  const { projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { isLoading: experienceLoading } = useExperience(); // SWR deduplicates with WorkEduSection
  const error = projectsError ? "Failed to fetch projects" : null;

  const isPageLoading = settingsLoading || projectsLoading || experienceLoading;

  const { setReady } = usePageReady();
  useEffect(() => {
    if (!isPageLoading) setReady();
  }, [isPageLoading, setReady]);

  const introAnimation = useScrollAnimation();
  const experienceAnimation = useScrollAnimation();
  const projectsAnimation = useScrollAnimation();
  const contactAnimation = useScrollAnimation();

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-cream font-ui">
      <div className="pt-6">
        <Header />
      </div>

      <main>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-[1100px] mx-auto">

            {/* ── HERO TOP ── */}
            <section
              ref={introAnimation.ref}
              className={`mb-5 transition-all duration-700 ease-out ${
                introAnimation.isVisible || prefersReducedMotion
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              {/* Hero header */}
              <div className="text-center flex flex-col items-center gap-4 mb-8">
                {/* Role badge */}
                <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.18em] uppercase text-warm-brown bg-off-white border border-cream-deeper px-4 py-2 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-orange shrink-0" />
                  Backend Engineer · System Design Ownership
                </span>

                {/* Name */}
                <h1 className="font-heading font-light text-ink leading-none" style={{ fontSize: "clamp(3rem,7vw,5.5rem)" }}>
                  Avishek <em className="italic text-warm-brown not-italic font-light" style={{ fontStyle: "italic" }}>Devnath</em>
                </h1>

                {/* Bio */}
                <p className="font-body text-[0.97rem] leading-[1.75] text-warm-brown max-w-[58ch] font-light text-justify">
                  I design, ship, and maintain backend systems under real operational constraints — from APIs and data models to auth and background processing.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => scrollToSection("experience")}
                    className="font-body bg-ink text-off-white px-7 py-3 rounded-md text-[0.83rem] font-medium tracking-wide border-[1.5px] border-ink hover:bg-accent-orange hover:border-accent-orange transition-all duration-250"
                  >
                    View Experience
                  </button>
                  <button
                    onClick={() => scrollToSection("skills")}
                    className="font-body bg-transparent text-ink px-7 py-3 rounded-md text-[0.83rem] font-medium tracking-wide border-[1.5px] border-sand hover:border-ink transition-all duration-250"
                  >
                    See Skills
                  </button>
                  <button
                    onClick={() => scrollToSection("projects")}
                    className="font-body bg-transparent text-ink px-7 py-3 rounded-md text-[0.83rem] font-medium tracking-wide border-[1.5px] border-sand hover:border-ink transition-all duration-250"
                  >
                    Browse Projects
                  </button>
                </div>
              </div>

              {/* ── MAIN GRID ── */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-5 mb-5">

                {/* Profile card */}
                <div className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] p-8 flex gap-7 items-start hover:border-sand hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {/* Orange left accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-orange rounded-l-[0.9rem]" />

                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full shrink-0 border-[3px] border-cream-deeper overflow-hidden bg-gradient-to-br from-cream-deeper to-sand">
                    <Image
                      src={profileImage}
                      alt="Avishek Devnath"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[0.62rem] tracking-[0.16em] uppercase text-accent-orange mb-2 flex items-center gap-2">
                      <span className="w-4 h-px bg-accent-orange" />
                      What I build and own
                    </p>
                    <h2 className="font-heading text-[1.3rem] font-semibold text-ink mb-3 leading-snug">
                      Backend-first systems, owned end-to-end
                    </h2>
                    <div className="space-y-2.5">
                      <p className="font-body text-[0.86rem] leading-[1.75] text-warm-brown font-light text-justify">
                        Backend-first systems where the job is not just delivery, but ownership: architecture, trade-offs, and long-term maintainability.
                      </p>
                      <p className="font-body text-[0.86rem] leading-[1.75] text-warm-brown font-light text-justify">
                        I've worked on internal and public-facing platforms such as a multi-tenant CRM, a role-based student management system, and an offline, consent-based biometric system.
                      </p>
                      <p className="font-body text-[0.86rem] leading-[1.75] text-warm-brown font-light text-justify">
                        Alongside engineering work, I serve as a Senior CS Instructor at Phitron. Teaching sharpens fundamentals and communication; engineering remains my primary focus.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-5">

                  {/* System ownership card (teal) */}
                  <div className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-6 py-5 hover:border-sand hover:shadow-md hover:translate-x-0.5 transition-all duration-300 overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-teal rounded-l-[0.9rem]" />
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-[34px] h-[34px] rounded-lg bg-accent-teal/10 flex items-center justify-center text-base shrink-0">💼</div>
                      <span className="font-heading text-[1.1rem] font-semibold text-ink">System ownership</span>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {[
                        "API design, contracts, and versioning",
                        "Data modeling, migrations, and integrity",
                        "Auth, RBAC, and secure workflows",
                        "Background processing and async jobs",
                        "Operational reliability and debugging",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2.5 font-body text-[0.84rem] text-warm-brown font-light leading-snug">
                          <span className="w-1 h-1 rounded-full bg-sand shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Academic foundation card (blue) */}
                  <div className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-6 py-5 hover:border-sand hover:shadow-md hover:translate-x-0.5 transition-all duration-300 overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-blue rounded-l-[0.9rem]" />
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-[34px] h-[34px] rounded-lg bg-accent-blue/10 flex items-center justify-center text-base shrink-0">🏛️</div>
                      <span className="font-heading text-[1.1rem] font-semibold text-ink">Academic foundation</span>
                    </div>
                    <p className="font-body text-[0.85rem] leading-[1.7] text-warm-brown font-light text-justify">
                      CSE graduate (BGC Trust University) and currently pursuing an MSc in CSE at the University of Dhaka, strengthening grounding in systems, security, and applied AI.
                    </p>
                  </div>

                </div>
              </div>

              {/* ── STATS ROW ── */}
              <div className="grid grid-cols-3 gap-5 mb-5">
                {[
                  { num: "3+",    label: "Years Building" },
                  { num: "10k+",  label: "Students Taught" },
                  { num: "500+",  label: "DSA Problems" },
                ].map(({ num, label }) => (
                  <div
                    key={label}
                    className="bg-off-white border border-cream-deeper rounded-[0.9rem] px-5 py-5 text-center hover:border-sand hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="font-heading text-[2.4rem] font-semibold text-ink leading-none mb-1.5">{num}</div>
                    <div className="font-mono text-[0.62rem] tracking-[0.1em] uppercase text-text-muted">{label}</div>
                  </div>
                ))}
              </div>

              {/* ── PILLARS ROW ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { icon: "🏗️", name: "Architecture",    desc: "Designing systems for maintainability, not just delivery.",           bg: "bg-accent-orange/10" },
                  { icon: "🗄️", name: "Database Design", desc: "Relational modeling, migrations, and data integrity at scale.",       bg: "bg-accent-blue/10" },
                  { icon: "🔐", name: "Security",         desc: "Auth, RBAC, and secure workflows built from the ground up.",         bg: "bg-accent-teal/10" },
                  { icon: "🎓", name: "Teaching",         desc: "Mentoring 10,000+ students in DSA and backend engineering.",         bg: "bg-[rgba(196,132,26,0.10)]" },
                ].map(({ icon, name, desc, bg }) => (
                  <div
                    key={name}
                    className="bg-off-white border border-cream-deeper rounded-[0.9rem] px-5 py-5 flex flex-col gap-2.5 hover:border-sand hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className={`w-[38px] h-[38px] rounded-lg ${bg} flex items-center justify-center text-[1.1rem]`}>{icon}</div>
                    <div className="font-heading text-[1rem] font-semibold text-ink">{name}</div>
                    <div className="font-body text-[0.78rem] text-text-muted leading-[1.55] font-light">{desc}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── WORK & EDUCATION ── */}
            <section
              id="experience"
              ref={experienceAnimation.ref}
              className={`my-12 transition-all duration-700 ease-out ${
                experienceAnimation.isVisible || prefersReducedMotion
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <WorkEduSection />
            </section>

            {/* ── SKILLS ── */}
            <SkillsSection />

            {/* ── PROJECTS ── */}
            <section
              id="projects"
              ref={projectsAnimation.ref}
              className={`mt-16 mb-10 transition-all duration-700 ease-out ${
                projectsAnimation.isVisible || prefersReducedMotion
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="text-center mb-8">
                <p className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
                  <span className="w-8 h-px bg-accent-orange opacity-60" />
                  Shipped &amp; Maintained
                  <span className="w-8 h-px bg-accent-orange opacity-60" />
                </p>
                <h2 className="font-heading font-light text-ink mb-3" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>Projects</h2>
                <p className="font-body text-[0.9rem] text-text-muted max-w-[55ch] mx-auto leading-[1.7] font-light text-justify">
                  Selected systems where I owned backend architecture, data lifecycle, and reliability.
                </p>
              </div>

              {projectsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-off-white border border-cream-deeper rounded-xl overflow-hidden animate-pulse">
                      <div className="h-32 bg-cream-deeper" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-cream-deeper rounded w-3/4" />
                        <div className="h-3 bg-cream-deeper rounded w-full" />
                        <div className="h-3 bg-cream-deeper rounded w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="flex justify-center py-12">
                  <div className="bg-off-white border border-cream-deeper text-warm-brown px-6 py-4 rounded-xl">
                    {error}
                  </div>
                </div>
              ) : (
                <ProjectGrid projects={projects} />
              )}
            </section>

            {/* ── CONTACT ── */}
            <section
              id="contact"
              ref={contactAnimation.ref}
              className={`mb-10 transition-all duration-700 ease-out ${
                contactAnimation.isVisible || prefersReducedMotion
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="text-center mb-8">
                <p className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
                  <span className="w-8 h-px bg-accent-orange opacity-60" />
                  Get in Touch
                  <span className="w-8 h-px bg-accent-orange opacity-60" />
                </p>
                <h2 className="font-heading font-light text-ink mb-3" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>Contact Me</h2>
                <p className="font-body text-[0.9rem] text-text-muted max-w-[55ch] mx-auto leading-[1.7] font-light text-justify">
                  Ready to collaborate or have a question? Let's connect and discuss how we can work together.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <a
                  href="mailto:avishekdevnath@gmail.com"
                  className="inline-flex items-center gap-2.5 font-body bg-ink text-off-white px-7 py-3 rounded-md text-[0.83rem] font-medium tracking-wide border-[1.5px] border-ink hover:bg-accent-orange hover:border-accent-orange transition-all duration-250 w-full sm:w-auto justify-center"
                >
                  <FaEnvelope />
                  avishekdevnath@gmail.com
                </a>
                <a
                  href="https://www.linkedin.com/in/avishekdevnath"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 font-body bg-transparent text-ink px-7 py-3 rounded-md text-[0.83rem] font-medium tracking-wide border-[1.5px] border-sand hover:border-ink transition-all duration-250 w-full sm:w-auto justify-center"
                >
                  <FaLinkedin />
                  LinkedIn
                </a>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
