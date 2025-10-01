"use client";
import React from "react";

import { useState, useEffect, useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Image from "next/image";
import {
  FaBriefcase,
  FaEnvelope,
  FaLinkedin,
  FaUniversity
} from "react-icons/fa";
import ProjectGrid from "@/components/ProjectGrid";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import dynamic from "next/dynamic";
import ExperienceSectionTight from "@/components/ExperienceSectionTight";
import SkillsSection from "@/components/SkillsSection";
import { Project, ProjectListApiResponse } from '@/types/dashboard';
const ExperienceSection = dynamic(() => import("@/components/ExperienceSection"), { ssr: false });


export default function About() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll animation hooks
  const introAnimation = useScrollAnimation();
  const experienceAnimation = useScrollAnimation();
  const projectsAnimation = useScrollAnimation();
  const contactAnimation = useScrollAnimation();

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const profileImage = "/assets/home/profile-img.jpg";

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects?status=published');
      const data: ProjectListApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch projects');
      }

      setProjects(data.data?.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch projects');
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
            {/* Page Title */}
            <div className="text-center mb-6 md:mb-8">
              <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Get to Know</h4>
              <h1 className="text-h3 md:text-h2 weight-bold text-gray-900 mb-6">
                Avishek Devnath
              </h1>
              <p className="text-body-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover my journey, skills, and passion for creating innovative solutions in web development and software engineering.
              </p>
          </div>

            {/* Introduction Card */}
            <div 
              ref={introAnimation.ref}
              className={`bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 p-4 md:p-6 mb-6 md:mb-8 shadow-inner transition-all duration-700 ease-out hover:scale-105 hover:shadow-xl ${
                introAnimation.isVisible ? 'opacity-100 translate-y-0' : prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
              <div className="flex flex-col lg:flex-row items-center gap-4 md:gap-6">
                <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg flex-shrink-0 border-4 border-white">
                  <Image
                    src={profileImage}
                    alt="Avishek Devnath"
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                </div>
                <div className="flex-1 text-center">
                  <h1 className="text-h4 md:text-h3 weight-bold text-gray-900 mb-3">
                    Hi, I'm <span className="text-blue-600">Avishek Devnath</span>
                  </h1>
                  <p className="text-body-sm text-gray-600 mb-6 leading-relaxed">
                    Hi, I'm Avishek Devnath! I am a CSE graduate from BGC Trust University and an MSc student at Dhaka University, specializing in MERN Stack development with experience in Docker, Kubernetes, and Django. As a Senior CS Instructor at Phitron, I've mentored students in C, C++, Python, DSA, SQL, and web development, and built open-source projects like Xerror and Py-OneSend. I am now seeking opportunities as a Software Engineer to build scalable, secure, and user-focused applications.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button
                      onClick={() => scrollToSection("experience")}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-300 text-button font-semibold shadow-lg border border-blue-500"
                    >
                      View Experience
                    </button>
                    <button
                      onClick={() => scrollToSection("skills")}
                      className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-300 text-button font-semibold shadow-inner"
                      style={{boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'}}
                    >
                      See Skills
                    </button>
                  </div>
                </div>
              </div>
            </div>


            {/* Dynamic Experience Section */}
            <section
              ref={experienceAnimation.ref}
              className={`mb-8 md:mb-10 transition-all duration-700 ease-out ${
                experienceAnimation.isVisible ? 'opacity-100 translate-y-0' : prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
              <div className="text-center mb-4 md:mb-6">
                <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Professional Journey</h4>
                <h2 className="text-h4 md:text-h3 weight-bold text-gray-900 mb-6">
                  Work Experience & Education
                </h2>
                <p className="text-body-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  My professional journey and academic background in computer science and software development.
                      </p>
                    </div>
              <ExperienceSectionTight 
                type="both"
                variant="compact"
                showFeaturedOnly={true}
                limit={6}
                title=""
                subtitle=""
                className="bg-transparent"
              />
            </section>

            {/* Skills Section */}
            <SkillsSection />

            {/* Projects Section */}
            <section
              id="projects"
              ref={projectsAnimation.ref}
              className={`mt-16 mb-8 md:mb-10 transition-all duration-700 ease-out ${
                projectsAnimation.isVisible ? 'opacity-100 translate-y-0' : prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
              <div className="text-center mb-4 md:mb-6">
                <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Browse My Recent</h4>
                <h2 className="text-h4 md:text-h3 weight-bold text-gray-900 mb-6">
                  Projects
                </h2>
                <p className="text-body-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  A showcase of my recent projects and work in web development, featuring modern technologies and innovative solutions.
                </p>
              </div>

              <div className="w-full">
                {loading ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 overflow-hidden animate-pulse" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
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
                  <ProjectGrid 
                    projects={projects}
                  />
                )}
              </div>
            </section>

            {/* Contact Section */}
            <section
              id="contact"
              ref={contactAnimation.ref}
              className={`mb-8 md:mb-10 transition-all duration-700 ease-out ${
                contactAnimation.isVisible ? 'opacity-100 translate-y-0' : prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
              <div className="text-center mb-4 md:mb-6">
                <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Get in Touch</h4>
                <h2 className="text-h4 md:text-h3 weight-bold text-gray-900 mb-6">
                  Contact Me
                </h2>
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
                  style={{boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'}}
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
