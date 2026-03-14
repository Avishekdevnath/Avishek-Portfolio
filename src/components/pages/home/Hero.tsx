"use client";

import Image from "next/image";
import styles from "./hero.module.css";
import Header from "@/components/shared/Header";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSettings } from "@/lib/swr";

const TYPEWRITER_PHRASES = [
  "Building backend-first architectures",
  "Owning systems end-to-end",
  "Teaching 10,000+ CS students",
  "Designing for real trade-offs",
];

const SKILL_ITEMS = [
  "NestJS", "TypeScript", "PostgreSQL", "MongoDB", "Python",
  "REST APIs", "System Design", "React", "Next.js", "Node.js",
  "RBAC", "Auth Systems", "C++", "DSA",
];

export default function Hero() {
  const { settings } = useSettings();

  // Derive values from SWR settings
  const profileImage = settings?.profileImage || "/assets/home/profile-img.jpg";
  const resumeUrl = settings?.resumeUrl || "https://drive.google.com/file/d/1Gn6SkgBT3oA7EVKMFJiM4boAASnwH8T5/view";
  const socialLinks = settings?.socialLinks || [];
  const linkedinUrl =
    socialLinks.find((l: any) => l.platform === "linkedin")?.url ||
    "https://www.linkedin.com/in/avishek-devnath/";
  const githubUrl =
    socialLinks.find((l: any) => l.platform === "github")?.url ||
    "https://github.com/Avishekdevnath";
  const twitterUrl =
    socialLinks.find((l: any) => l.platform === "twitter")?.url ||
    "";

  // Typewriter
  const [twText, setTwText] = useState("");
  const phraseIdx = useRef(0);
  const charIdx = useRef(0);
  const deleting = useRef(false);

  const tick = useCallback(() => {
    const phrase = TYPEWRITER_PHRASES[phraseIdx.current];
    if (!deleting.current) {
      charIdx.current++;
      setTwText(phrase.slice(0, charIdx.current));
      if (charIdx.current === phrase.length) {
        deleting.current = true;
        return 1800;
      }
      return 55;
    } else {
      charIdx.current--;
      setTwText(phrase.slice(0, charIdx.current));
      if (charIdx.current === 0) {
        deleting.current = false;
        phraseIdx.current = (phraseIdx.current + 1) % TYPEWRITER_PHRASES.length;
      }
      return 38;
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const run = () => {
      const delay = tick();
      timer = setTimeout(run, delay);
    };
    timer = setTimeout(run, 900);
    return () => clearTimeout(timer);
  }, [tick]);

  return (
    <div className="relative min-h-screen bg-cream font-body overflow-x-hidden">
      {/* Background texture */}
      <div className={styles.bgTexture} />

      {/* Header */}
      <div className="relative z-10 pt-6">
        <Header />
      </div>

      {/* Hero section */}
      <section className="relative z-[1] min-h-screen flex items-center justify-center px-4 sm:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16 items-center max-w-[1060px] w-full">

          {/* ── LEFT: PHOTO ── */}
          <div className="flex flex-col items-center gap-0 order-first md:order-none">
            <div className={`${styles.photoRing} mx-auto`}>
              <div className={styles.photoCircle}>
                <Image
                  src={profileImage}
                  alt="Avishek Devnath"
                  fill
                  sizes="(max-width: 860px) 300px, 420px"
                  quality={85}
                  priority
                  className="object-cover"
                />
              </div>
            </div>

            {/* Availability pip */}
            <div className="inline-flex items-center gap-2 bg-[rgba(250,248,244,.96)] backdrop-blur-[12px] border border-[rgba(58,125,110,.2)] rounded-full px-4 py-2 mt-5 text-[.75rem] font-medium text-ink shadow-[0_4px_14px_rgba(74,55,40,.08)] whitespace-nowrap">
              <span className="w-[7px] h-[7px] rounded-full bg-[#3ab07a] flex-shrink-0 shadow-[0_0_0_3px_rgba(58,176,122,.2)] animate-pulse-dot" />
              Available for work
            </div>
          </div>

          {/* ── RIGHT: TEXT ── */}
          <div className="flex flex-col text-center md:text-left">

            <p className={`${styles.fadeUp1} font-mono text-[.75rem] tracking-[.2em] uppercase text-text-muted mb-4 flex items-center gap-2.5 justify-center md:justify-start`}>
              <span className="w-6 h-px bg-text-muted" />
              Hello, I'm
            </p>

            <h1 className={`${styles.fadeUp2} font-heading text-[clamp(2.8rem,6vw,4.6rem)] font-semibold leading-none text-ink mb-2`}>
              Avishek <em className="italic font-light text-warm-brown">Devnath</em>
            </h1>

            <p className={`${styles.fadeUp3} font-body text-[clamp(.9rem,1.8vw,1.05rem)] font-medium tracking-[.01em] text-deep-brown mb-5 flex items-center gap-2.5 justify-center md:justify-start`}>
              <span className="w-[5px] h-[5px] rounded-full bg-accent-orange flex-shrink-0" />
              Software Engineer&ensp;·&ensp;Backend & Systems
            </p>

            <p className={`${styles.fadeUp4} text-[.9rem] leading-[1.8] text-warm-brown font-light max-w-[46ch] mb-6 mx-auto md:mx-0`}>
              Designing and operating backend systems with real users, real
              constraints, and long-term ownership.
            </p>

            {/* Typewriter */}
            <div className={`${styles.fadeUp5} inline-flex items-center gap-2 font-mono text-[.78rem] text-text-muted mb-8 justify-center md:justify-start`}>
              <span className="text-accent-orange">~/</span>
              <span className="text-deep-brown">{twText}</span>
              <span className={styles.twCursor} />
            </div>

            {/* CTA Buttons */}
            <div className={`${styles.fadeUp6} flex items-center gap-3.5 flex-wrap mb-8 justify-center md:justify-start`}>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-[1.5px] border-deep-brown bg-transparent text-ink font-body text-[.88rem] font-medium transition-all duration-200 hover:bg-ink hover:text-off-white hover:border-ink"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                Resume
              </a>
              <a
                href="#contact"
                className={`${styles.btnContact} inline-flex items-center gap-2 px-6 py-3 rounded-full border-[1.5px] border-ink bg-ink text-off-white font-body text-[.88rem] font-medium transition-all duration-200 hover:bg-deep-brown hover:border-deep-brown hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(42,33,24,.25)]`}
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Me
              </a>
            </div>

            {/* Social Row */}
            <div className={`${styles.fadeUp7} flex items-center gap-2.5 justify-center md:justify-start`}>
              <span className="font-mono text-[.6rem] tracking-[.14em] uppercase text-text-muted mr-1">
                Find me
              </span>
              {/* LinkedIn */}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full border border-cream-deeper bg-off-white flex items-center justify-center text-deep-brown transition-all duration-200 shadow-[0_2px_6px_rgba(74,55,40,.06)] hover:border-sand hover:bg-cream-dark hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(74,55,40,.12)]"
              >
                <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              {/* GitHub */}
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-full border border-cream-deeper bg-off-white flex items-center justify-center text-deep-brown transition-all duration-200 shadow-[0_2px_6px_rgba(74,55,40,.06)] hover:border-sand hover:bg-cream-dark hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(74,55,40,.12)]"
              >
                <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
              </a>
              {/* Twitter/X */}
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter/X"
                  className="w-9 h-9 rounded-full border border-cream-deeper bg-off-white flex items-center justify-center text-deep-brown transition-all duration-200 shadow-[0_2px_6px_rgba(74,55,40,.06)] hover:border-sand hover:bg-cream-dark hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(74,55,40,.12)]"
                >
                  <svg className="w-[15px] h-[15px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── SCROLLING SKILL STRIP ── */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden py-3 border-t border-cream-deeper bg-gradient-to-b from-transparent to-[rgba(240,236,227,.5)]">
          <div className={styles.stripInner}>
            {/* Duplicate items for seamless loop */}
            {[...SKILL_ITEMS, ...SKILL_ITEMS].map((skill, i) => (
              <span
                key={`${skill}-${i}`}
                className="font-mono text-[.62rem] tracking-[.12em] uppercase text-text-muted whitespace-nowrap flex items-center gap-2 before:content-['·'] before:text-accent-orange before:text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
