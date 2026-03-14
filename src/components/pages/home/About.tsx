"use client";

import { useSettings } from "@/lib/swr";

export default function About() {
  const { profileImage: fetchedImage } = useSettings();
  const profileImage = fetchedImage || "/assets/home/profile-img.jpg";

  return (
    <section className="py-16 px-4 bg-cream font-body">
      <div className="w-full max-w-[1100px] mx-auto">

        {/* ── HEADER ── */}
        <div className="text-center mb-16">
          <p className="font-mono text-[.68rem] tracking-[.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-accent-orange opacity-50" />
            Get to Know More
            <span className="w-8 h-px bg-accent-orange opacity-50" />
          </p>
          <h2 className="font-heading text-[clamp(2.2rem,5vw,3.6rem)] font-light leading-[1.05] text-ink mb-4">
            About <em className="italic text-warm-brown">Me</em>
          </h2>
          <p className="text-[.9rem] text-text-muted max-w-[54ch] mx-auto leading-[1.75] font-light text-justify">
            Learn more about my background, experience, and educational journey
            in computer science and software development.
          </p>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-10 items-start">

          {/* ── LEFT: PHOTO COL ── */}
          <div className="flex flex-col gap-5 max-w-[420px] mx-auto lg:max-w-none w-full">
            {/* Photo Frame */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-cream-deeper to-sand aspect-[4/5]">
              <img
                src={profileImage}
                alt="Avishek Devnath"
                className="w-full h-full object-cover block"
              />
              {/* Availability Badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 bg-[rgba(250,248,244,.92)] backdrop-blur-[10px] border border-[rgba(58,125,110,.25)] rounded-full px-4 py-2 whitespace-nowrap text-[.78rem] font-medium text-ink shadow-[0_4px_14px_rgba(74,55,40,.1)]">
                <span className="w-2 h-2 rounded-full bg-[#3ab07a] flex-shrink-0 shadow-[0_0_0_3px_rgba(58,176,122,.2)] animate-pulse-dot" />
                Available for work
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { num: "3+", label: "Years" },
                { num: "10k+", label: "Students" },
                { num: "500+", label: "DSA" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-off-white border border-cream-deeper rounded-xl py-4 px-3 text-center transition-all duration-200 hover:border-sand hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(74,55,40,.08)]"
                >
                  <div className="font-heading text-[1.8rem] font-semibold leading-none text-ink">
                    {s.num}
                  </div>
                  <div className="font-mono text-[.58rem] tracking-[.1em] uppercase text-text-muted mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: CONTENT COL ── */}
          <div className="flex flex-col gap-5">

            {/* Bio Card */}
            <div className="bg-off-white border border-cream-deeper rounded-[.85rem] p-5 sm:p-8 relative overflow-hidden transition-all duration-300 hover:border-sand hover:shadow-[0_8px_28px_rgba(74,55,40,.09)] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-accent-orange before:rounded-l">
              <p className="font-mono text-[.62rem] tracking-[.16em] uppercase text-accent-orange mb-2 flex items-center gap-2">
                <span className="w-4 h-px bg-accent-orange" />
                Software Engineer · Backend & Systems
              </p>
              <h3 className="font-heading text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink mb-4 leading-[1.1]">
                Avishek <em className="italic text-warm-brown">Devnath</em>
              </h3>
              <p className="text-[.88rem] leading-[1.8] text-warm-brown font-light mb-3 text-justify">
                I'm a backend-focused software engineer with hands-on experience
                designing, building, and maintaining systems under real
                operational constraints. My work centers on owning system design
                decisions across APIs, data models, authorization, and background
                processing, and evolving those systems as requirements and usage
                grow.
              </p>
              <p className="text-[.88rem] leading-[1.8] text-warm-brown font-light mb-3 text-justify">
                Beyond engineering, I&apos;ve mentored 10,000+ students in DSA and
                backend development — an experience that sharpens fundamentals
                and communication. My primary professional focus remains building
                and operating backend systems with real users, real trade-offs,
                and long-term ownership.
              </p>
              <p className="text-[.88rem] leading-[1.8] text-warm-brown font-light text-justify">
                I have worked across internal and public-facing platforms,
                balancing scalability, security, and maintainability rather than
                optimizing for frameworks or short-term delivery.
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-5">
                {[
                  { name: "NestJS", featured: true },
                  { name: "TypeScript", featured: true },
                  { name: "PostgreSQL", featured: true },
                  { name: "MongoDB" },
                  { name: "Python" },
                  { name: "System Design" },
                  { name: "RBAC" },
                  { name: "REST APIs" },
                ].map((t) => (
                  <span
                    key={t.name}
                    className={`font-mono text-[.62rem] tracking-[.04em] px-3 py-1 border rounded-full transition-all duration-200 cursor-default hover:border-accent-orange hover:text-accent-orange hover:bg-[rgba(212,98,42,.05)] ${
                      t.featured
                        ? "border-sand text-ink bg-cream-dark"
                        : "border-cream-deeper text-warm-brown bg-cream-dark"
                    }`}
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>

            {/* ── INFO CARDS ROW ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Experience Card */}
              <div className="bg-off-white border border-cream-deeper rounded-[.85rem] p-6 relative overflow-hidden transition-all duration-300 hover:border-sand hover:shadow-[0_6px_20px_rgba(74,55,40,.09)] hover:translate-x-[3px] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-accent-teal before:rounded-l">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(58,125,110,.1)] flex items-center justify-center text-base flex-shrink-0">
                    💼
                  </div>
                  <span className="font-heading text-[1.1rem] font-semibold text-ink">
                    Experience
                  </span>
                </div>
                <p className="text-[.88rem] leading-[1.65] text-warm-brown font-light text-justify">
                  <strong className="font-semibold text-ink">3+ years</strong>{" "}
                  as a backend-focused software engineer, building production
                  systems and mentoring 10,000+ students across DSA, backend
                  engineering, and system design.
                </p>
              </div>

              {/* Education Card */}
              <div className="bg-off-white border border-cream-deeper rounded-[.85rem] p-6 relative overflow-hidden transition-all duration-300 hover:border-sand hover:shadow-[0_6px_20px_rgba(74,55,40,.09)] hover:translate-x-[3px] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-accent-blue before:rounded-l">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(45,90,142,.1)] flex items-center justify-center text-base flex-shrink-0">
                    🎓
                  </div>
                  <span className="font-heading text-[1.1rem] font-semibold text-ink">
                    Education
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="font-body text-[.88rem] font-semibold text-ink mb-0.5">
                      MSc in CSE{" "}
                      <span className="font-normal text-text-muted">
                        (Ongoing)
                      </span>
                    </div>
                    <div className="font-mono text-[.65rem] tracking-[.04em] text-text-muted">
                      📍 University of Dhaka
                    </div>
                  </div>
                  <div className="h-px bg-cream-deeper" />
                  <div>
                    <div className="font-body text-[.88rem] font-semibold text-ink mb-0.5">
                      BSc in CSE{" "}
                      <span className="font-normal text-text-muted">
                        · 2020–2024
                      </span>
                    </div>
                    <div className="font-mono text-[.65rem] tracking-[.04em] text-text-muted">
                      📍 BGC Trust University Bangladesh
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── PHILOSOPHY STRIP ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  num: "01",
                  title: "Own the system",
                  desc: "Delivery is the floor, not the ceiling. I care about what happens after the PR merges.",
                },
                {
                  num: "02",
                  title: "Teach to understand",
                  desc: "Explaining to 10,000 students forces you to actually understand — teaching debugs your knowledge.",
                },
                {
                  num: "03",
                  title: "Constraints clarify",
                  desc: "Real systems operate under real constraints. I work well under them — time, infra, or team size.",
                },
              ].map((p) => (
                <div
                  key={p.num}
                  className="bg-off-white border border-cream-deeper rounded-xl p-5 transition-all duration-300 cursor-default hover:border-sand hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(74,55,40,.08)]"
                >
                  <div className="font-heading text-[2rem] font-light leading-none text-cream-deeper mb-2">
                    {p.num}
                  </div>
                  <div className="font-heading text-[.88rem] font-semibold text-ink mb-1">
                    {p.title}
                  </div>
                  <div className="text-[.78rem] text-text-muted leading-[1.55] font-light text-justify">
                    {p.desc}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
