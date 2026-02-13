"use client";

import { useEffect, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Image from "next/image";
import { Code2, Database, Layers, ShieldCheck } from "lucide-react";
import { FaBriefcase, FaEnvelope, FaLinkedin, FaUniversity } from "react-icons/fa";
import ProjectGrid from "@/components/ProjectGrid";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ExperienceSection from "@/components/ExperienceSection";
import SkillsSection from "@/components/SkillsSection";
import { Project, ProjectListApiResponse } from "@/types/dashboard";

export default function About() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState("/assets/home/profile-img.jpg");

  const introAnimation = useScrollAnimation();
  const experienceAnimation = useScrollAnimation();
  const projectsAnimation = useScrollAnimation();
  const contactAnimation = useScrollAnimation();

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();

        if (data.success && data.data?.profileImage) {
          setProfileImage(data.data.profileImage);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/projects?status=published");
      const data: ProjectListApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch projects");
      }

      setProjects(data.data?.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
      <div className="pt-6">
        <Header />
      </div>

      <main className="relative">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Intro (inspired by bento-style, blended with current UI) */}
            <section
              ref={introAnimation.ref}
              className={`mb-6 md:mb-8 transition-all duration-700 ease-out ${
                introAnimation.isVisible
                  ? "opacity-100 translate-y-0"
                  : prefersReducedMotion
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
              }`}
            >
              <header className="text-center mb-5 md:mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-semibold tracking-wider uppercase rounded-full border border-blue-100">
                    Backend Engineer • System Design Ownership
                  </span>
                </div>
                <h1 className="text-h3 md:text-h2 weight-bold text-gray-900 mb-3">
                  Avishek <span className="text-gray-400">Devnath</span>
                </h1>
                <p className="text-body-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  I design, ship, and maintain backend systems under real operational constraints—from APIs and data models to auth and background processing.
                </p>
                <div className="flex flex-wrap gap-3 justify-center pt-4">
                  <button
                    onClick={() => scrollToSection("experience")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-300 text-button font-semibold shadow-lg border border-blue-500"
                  >
                    View Experience
                  </button>
                  <button
                    onClick={() => scrollToSection("skills")}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-300 text-button font-semibold shadow-inner"
                    style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)" }}
                  >
                    See Skills
                  </button>
                  <button
                    onClick={() => scrollToSection("projects")}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-300 text-button font-semibold shadow-inner"
                    style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)" }}
                  >
                    Browse Projects
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div
                  className="lg:col-span-7 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 p-5 md:p-6 shadow-inner"
                  style={{
                    boxShadow:
                      "inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
                    <div className="relative">
                      <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-300 blur-xl opacity-15" />
                      <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden shadow-lg border-4 border-white">
                        <Image
                          src={profileImage}
                          alt="Profile photo"
                          width={144}
                          height={144}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        />
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-h5 md:text-h4 weight-bold text-gray-900 mb-2">
                        What I build and own
                      </h2>
                      <div className="text-body-sm text-gray-600 leading-relaxed space-y-3">
                        <p>
                          Backend-first systems where the job is not just delivery, but ownership: architecture, trade-offs, and long-term maintainability.
                        </p>
                        <p>
                          I've worked on internal and public-facing platforms such as a multi-tenant CRM, a role-based student management system, and an offline, consent-based biometric system.
                        </p>
                        <p>
                          Alongside engineering work, I serve as a Senior CS Instructor at Phitron. Teaching sharpens fundamentals and communication; engineering remains my primary focus.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <div
                    className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 p-5 shadow-inner"
                    style={{
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                      <FaBriefcase className="text-blue-600" />
                      <h3 className="text-body font-semibold text-gray-900">System ownership</h3>
                    </div>
                    <ul className="text-body-sm text-gray-600 space-y-2">
                      <li>API design, contracts, and versioning</li>
                      <li>Data modeling, migrations, and integrity</li>
                      <li>Auth, RBAC, and secure workflows</li>
                      <li>Background processing and async jobs</li>
                      <li>Operational reliability and debugging</li>
                    </ul>
                  </div>

                  <div
                    className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 p-5 shadow-inner"
                    style={{
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                      <FaUniversity className="text-blue-600" />
                      <h3 className="text-body font-semibold text-gray-900">Academic foundation</h3>
                    </div>
                    <p className="text-body-sm text-gray-600 leading-relaxed">
                      CSE graduate (BGC Trust University) and currently pursuing an MSc in CSE at the University of Dhaka, strengthening grounding in systems, security, and applied AI.
                    </p>
                  </div>

                </div>
              </div>
            </section>

            {/* Technical Pillars (inspired by the provided UI) */}
            <section className="mb-12 md:mb-16">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Architecture",
                    icon: <Layers size={18} />,
                    badge: "bg-orange-50 text-orange-700 border-orange-100",
                  },
                  {
                    label: "Database Design",
                    icon: <Database size={18} />,
                    badge: "bg-blue-50 text-blue-700 border-blue-100",
                  },
                  {
                    label: "Security",
                    icon: <ShieldCheck size={18} />,
                    badge: "bg-green-50 text-green-700 border-green-100",
                  },
                  {
                    label: "Teaching",
                    icon: <Code2 size={18} />,
                    badge: "bg-purple-50 text-purple-700 border-purple-100",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 p-5 bg-white border border-stone-200 rounded-2xl shadow-sm hover:border-blue-200 transition-colors group"
                  >
                    <div
                      className={`p-3 rounded-xl border ${item.badge} transition-transform group-hover:scale-110`}
                    >
                      {item.icon}
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Dynamic Experience Section */}
            <section
              id="experience"
              ref={experienceAnimation.ref}
              className={`mb-8 md:mb-10 transition-all duration-700 ease-out ${
                experienceAnimation.isVisible
                  ? "opacity-100 translate-y-0"
                  : prefersReducedMotion
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
              }`}
            >
              <div className="text-center mb-4 md:mb-6">
                <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Professional Journey</h4>
                <h2 className="text-h4 md:text-h3 weight-bold text-gray-900 mb-6">Work Experience & Education</h2>
                <p className="text-body-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  My professional journey and academic background across backend engineering and system building.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                      <FaBriefcase size={16} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Work Experience</h3>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider">Professional career journey</p>
                    </div>
                  </div>
                  <ExperienceSection
                    type="work"
                    variant="compact"
                    showFeaturedOnly={true}
                    limit={6}
                    hideHeader={true}
                    gridClassName="grid-cols-1"
                    containerClassName="max-w-none"
                    className="py-0 md:py-0 px-0"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                    <div className="p-2 bg-purple-600 rounded-lg text-white">
                      <FaUniversity size={16} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Education</h3>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider">Academic background</p>
                    </div>
                  </div>
                  <ExperienceSection
                    type="education"
                    variant="compact"
                    showFeaturedOnly={true}
                    limit={6}
                    hideHeader={true}
                    gridClassName="grid-cols-1"
                    containerClassName="max-w-none"
                    className="py-0 md:py-0 px-0"
                  />
                </div>
              </div>
            </section>

            {/* Skills Section */}
            <SkillsSection />

            {/* Projects Section */}
            <section
              id="projects"
              ref={projectsAnimation.ref}
              className={`mt-16 mb-8 md:mb-10 transition-all duration-700 ease-out ${
                projectsAnimation.isVisible
                  ? "opacity-100 translate-y-0"
                  : prefersReducedMotion
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
              }`}
            >
              <div className="text-center mb-4 md:mb-6">
                <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Shipped & Maintained</h4>
                <h2 className="text-h4 md:text-h3 weight-bold text-gray-900 mb-6">Projects</h2>
                <p className="text-body-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Selected systems where I owned backend architecture, data lifecycle, and reliability.
                </p>
              </div>

              <div className="w-full">
                {loading ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 overflow-hidden animate-pulse"
                        style={{
                          boxShadow:
                            "inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)",
                        }}
                      >
                        <div className="h-32 bg-gray-200" />
                        <div className="p-4 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-full" />
                          <div className="h-3 bg-gray-200 rounded w-5/6" />
                          <div className="flex gap-1.5 pt-1.5">
                            <div className="h-5 bg-gray-200 rounded-full w-12" />
                            <div className="h-5 bg-gray-200 rounded-full w-16" />
                            <div className="h-5 bg-gray-200 rounded-full w-14" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-sm">
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                ) : (
                  <ProjectGrid projects={projects} />
                )}
              </div>
            </section>

            {/* Contact Section */}
            <section
              id="contact"
              ref={contactAnimation.ref}
              className={`mb-8 md:mb-10 transition-all duration-700 ease-out ${
                contactAnimation.isVisible
                  ? "opacity-100 translate-y-0"
                  : prefersReducedMotion
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
              }`}
            >
              <div className="text-center mb-4 md:mb-6">
                <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Get in Touch</h4>
                <h2 className="text-h4 md:text-h3 weight-bold text-gray-900 mb-6">Contact Me</h2>
                <p className="text-body-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Ready to collaborate or have a question? I'd love to hear from you. Let's connect and discuss how we can work together.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
                <a
                  href="mailto:avishekdevnath@gmail.com"
                  className="group flex items-center justify-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-xl text-button font-semibold hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg border border-blue-500 w-full sm:w-auto"
                >
                  <FaEnvelope className="group-hover:animate-bounce" />
                  <span>avishekdevnath@gmail.com</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/avishekdevnath"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center space-x-3 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl text-button font-semibold hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-300 shadow-inner w-full sm:w-auto"
                  style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)" }}
                >
                  <FaLinkedin className="group-hover:animate-pulse" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
