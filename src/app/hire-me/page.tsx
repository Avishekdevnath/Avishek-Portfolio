"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ExperienceSection from "@/components/ExperienceSection";
import Stats from "@/components/pages/home/Stats";
import { useToast } from "@/context/ToastContext";
import { FaCode, FaUsers, FaLightbulb, FaBuilding, FaEnvelope, FaTag, FaComment } from "react-icons/fa";
import PageReadyOnMount from "@/components/shared/PageReadyOnMount";

const inputBase = "block w-full px-4 py-2.5 text-[0.88rem] font-body bg-cream border rounded-md transition-colors duration-200 focus:outline-none focus:ring-1 placeholder:text-text-muted/50 text-ink border-cream-deeper focus:border-accent-orange focus:ring-accent-orange";

export default function HireMe() {
  const { showToast } = useToast();
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "/contact";
  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState({ company: "", email: "", role: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.message) {
      showToast({ title: "Please complete required fields", description: "Email and message are required.", status: "error", duration: 4000 });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/hiring-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to send");
      showToast({ title: "Thanks!", description: "Your inquiry has been sent. I'll reply shortly.", status: "success", duration: 5000 });
      setForm({ company: "", email: "", role: "", message: "" });
      formRef.current?.reset();
    } catch (err) {
      showToast({ title: "Could not send message", description: err instanceof Error ? err.message : "Please try again later", status: "error", duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  const keySkills = [
    {
      accent: "bg-accent-orange",
      iconBg: "bg-accent-orange/10 text-accent-orange",
      icon: <FaCode className="w-5 h-5" />,
      title: <>Backend-Focused Software Engineer</>,
      description: <>Designing, building, and maintaining backend systems — APIs, data models, auth, RBAC, and background processing — under real operational constraints.</>,
    },
    {
      accent: "bg-accent-teal",
      iconBg: "bg-accent-teal/10 text-accent-teal",
      icon: <FaUsers className="w-5 h-5" />,
      title: "500+ Algorithm Problems",
      description: "Strong foundation in algorithms and data structures with expertise in system design, networking, OS, and cybersecurity.",
    },
    {
      accent: "bg-accent-blue",
      iconBg: "bg-accent-blue/10 text-accent-blue",
      icon: <FaLightbulb className="w-5 h-5" />,
      title: "Open Source Contributor",
      description: "Created multiple Python and NPM packages, student mentorship system, and AI toolbox with comprehensive development utilities.",
    },
  ];

  const faqs = [
    {
      q: "How soon can we start?",
      a: "I can typically start within 1–2 weeks depending on the project scope and current commitments. For urgent projects, we can discuss accelerated timelines.",
    },
    {
      q: "What's your communication style?",
      a: "Async-first with scheduled check-ins, crisp updates, and demo-driven milestones. I provide regular progress reports and maintain clear documentation throughout.",
    },
    {
      q: "Do you provide documentation and handover?",
      a: "Yes — comprehensive code walkthrough, README documentation, deployment guides, and handover notes are included. I also offer training sessions for your team.",
    },
    {
      q: "What about mentoring and knowledge transfer?",
      a: "With experience mentoring 10,000+ students, I specialise in knowledge transfer. I provide detailed code reviews and can conduct training sessions for your development team.",
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
              Available for Opportunities
              <span className="w-8 h-px bg-accent-orange opacity-50" />
            </p>
            <h1
              className="font-heading font-light text-ink mb-4 leading-none"
              style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
            >
              Let&apos;s Build Something <em className="italic text-warm-brown">Together</em>
            </h1>
            <p className="font-body text-[0.9rem] text-text-muted max-w-[60ch] mx-auto leading-[1.7] font-light text-justify">
              Software Engineer specializing in backend systems — with 500+ algorithm problems solved, 10,000+ students mentored, and a proven track record building scalable, production-grade platforms.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <Link
                href={bookingUrl}
                className="inline-flex items-center gap-2 font-body bg-ink text-off-white px-7 py-3 rounded-md text-[0.83rem] font-medium tracking-wide border-[1.5px] border-ink hover:bg-accent-orange hover:border-accent-orange transition-all duration-250"
              >
                Book an intro call
              </Link>
              <a
                href="#inquiry-form"
                className="inline-flex items-center gap-2 font-body bg-transparent text-ink px-7 py-3 rounded-md text-[0.83rem] font-medium tracking-wide border-[1.5px] border-sand hover:border-ink transition-all duration-250"
              >
                Send a brief →
              </a>
            </div>
          </div>

          {/* ── Quick proof stats ── */}
          <div className="grid grid-cols-3 gap-2 sm:gap-5">
            {[
              { num: "500+", label: "Algorithm Problems" },
              { num: "3+",   label: "Years Dev & Teaching" },
              { num: "10k+", label: "Students Mentored" },
            ].map(({ num, label }) => (
              <div
                key={label}
                className="bg-off-white border border-cream-deeper rounded-[0.9rem] px-2 sm:px-5 py-4 sm:py-6 text-center hover:border-sand hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="font-heading text-[1.6rem] sm:text-[2.4rem] font-semibold text-ink leading-none mb-1">{num}</div>
                <div className="font-mono text-[0.55rem] sm:text-[0.62rem] tracking-[0.08em] sm:tracking-[0.1em] uppercase text-text-muted">{label}</div>
              </div>
            ))}
          </div>

          {/* ── Achievement stats ── */}
          <Stats />

          {/* ── Why hire me ── */}
          <div>
            <div className="text-center mb-10">
              <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
                <span className="w-8 h-px bg-accent-orange opacity-50" />
                Why Choose Me
                <span className="w-8 h-px bg-accent-orange opacity-50" />
              </p>
              <h2
                className="font-heading font-light text-ink mb-4 leading-[1.05]"
                style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
              >
                Why Hire <em className="italic text-warm-brown">Me?</em>
              </h2>
              <p className="font-body text-[0.9rem] text-text-muted max-w-[55ch] mx-auto leading-[1.7] font-light text-justify">
                A unique combination of technical expertise, teaching experience, and proven problem-solving abilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {keySkills.map((skill, i) => (
                <div
                  key={i}
                  className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-6 py-6 hover:border-sand hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${skill.accent} rounded-l-[0.9rem]`} />
                  <div className={`w-10 h-10 rounded-lg ${skill.iconBg} flex items-center justify-center mb-4`}>
                    {skill.icon}
                  </div>
                  <h3 className="font-heading text-[1.05rem] font-semibold text-ink mb-2 leading-snug">
                    {skill.title}
                  </h3>
                  <p className="font-body text-[0.83rem] text-text-muted leading-[1.7] font-light text-justify">
                    {skill.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Work experience ── */}
          <ExperienceSection
            type="work"
            variant="detailed"
            showFeaturedOnly={false}
            limit={5}
            title={<>Work <em className="italic text-warm-brown">Experience</em></>}
            subtitle="My professional journey as a Software Engineer, with a strong focus on backend systems, system design, and technical excellence."
            className="bg-transparent py-0"
          />

          {/* ── Education ── */}
          <ExperienceSection
            type="education"
            variant="detailed"
            showFeaturedOnly={false}
            limit={5}
            title={<><em className="italic text-warm-brown">Education</em></>}
            subtitle="Strong academic foundation in Computer Science with ongoing advanced studies and practical application."
            className="bg-transparent py-0"
          />

          {/* ── FAQ ── */}
          <div>
            <div className="text-center mb-10">
              <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
                <span className="w-8 h-px bg-accent-orange opacity-50" />
                Common Questions
                <span className="w-8 h-px bg-accent-orange opacity-50" />
              </p>
              <h2
                className="font-heading font-light text-ink mb-4 leading-[1.05]"
                style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
              >
                Frequently Asked <em className="italic text-warm-brown">Questions</em>
              </h2>
              <p className="font-body text-[0.9rem] text-text-muted max-w-[55ch] mx-auto leading-[1.7] font-light text-justify">
                Quick answers about working together and my availability.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group relative bg-off-white border border-cream-deeper rounded-[0.9rem] overflow-hidden hover:border-sand transition-all duration-300"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-orange rounded-l-[0.9rem]" />
                  <summary className="pl-6 pr-5 py-5 font-body text-[0.9rem] font-medium text-ink cursor-pointer list-none flex items-center justify-between gap-3 select-none">
                    {faq.q}
                    <span className="font-mono text-text-muted text-[0.8rem] shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
                  </summary>
                  <p className="pl-6 pr-5 pb-5 font-body text-[0.85rem] text-text-muted leading-[1.7] font-light text-justify border-t border-cream-deeper pt-4">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* ── Inquiry form ── */}
          <div
            id="inquiry-form"
            className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-7 py-8 overflow-hidden hover:border-sand hover:shadow-md transition-all duration-300"
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-orange rounded-l-[0.9rem]" />

            <div className="text-center mb-8">
              <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
                <span className="w-8 h-px bg-accent-orange opacity-50" />
                Get in Touch
                <span className="w-8 h-px bg-accent-orange opacity-50" />
              </p>
              <h2
                className="font-heading font-light text-ink mb-4 leading-[1.05]"
                style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
              >
                Interested in Hiring <em className="italic text-warm-brown">Me?</em>
              </h2>
              <p className="font-body text-[0.9rem] text-text-muted max-w-[50ch] mx-auto leading-[1.7] font-light text-justify">
                Ready to discuss opportunities? Send me a message with details about the role and I&apos;ll get back to you promptly.
              </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">

              {/* Company */}
              <div>
                <label className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.08em] uppercase text-warm-brown mb-1.5">
                  <FaBuilding className="w-3 h-3" />
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Your Company Name"
                  className={inputBase}
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.08em] text-warm-brown mb-1.5">
                  <FaEnvelope className="w-3 h-3" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your.email@company.com"
                  className={inputBase}
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.08em] uppercase text-warm-brown mb-1.5">
                  <FaTag className="w-3 h-3" />
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="e.g. Senior Backend Engineer"
                  className={inputBase}
                />
              </div>

              {/* Message */}
              <div>
                <label className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.08em] uppercase text-warm-brown mb-1.5">
                  <FaComment className="w-3 h-3" />
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell me about the opportunity, role requirements, and what you're looking for…"
                  className={`${inputBase} resize-none`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full flex items-center justify-center gap-2.5 font-body bg-ink text-off-white px-6 py-3 rounded-md text-[0.83rem] font-medium tracking-wide border-[1.5px] border-ink transition-all duration-250
                  ${submitting ? "opacity-60 cursor-not-allowed" : "hover:bg-accent-orange hover:border-accent-orange"}`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-off-white/30 border-t-off-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Submit Inquiry"
                )}
              </button>
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
