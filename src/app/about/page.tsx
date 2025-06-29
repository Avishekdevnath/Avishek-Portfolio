"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaAward,
  FaEnvelope,
  FaLinkedin,
  FaCode,
  FaPaintBrush,
  FaGlobe,
  FaGraduationCap,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";
import { programmingSkills, softwareSkills, languages } from "../../data/data";
import ProjectGrid from "@/components/ProjectGrid";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ExperienceSection from "@/components/ExperienceSection";
import { Project, ProjectListApiResponse } from '@/types/dashboard';

interface SkillProgressBarProps {
  skill: { name: string; level: string };
  delay?: number;
}

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
}

// Animated Counter Component
function AnimatedCounter({
  end,
  duration = 2000,
  suffix = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// Skill Progress Bar Component
function SkillProgressBar({
  skill,
  delay = 0,
}: SkillProgressBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const getProgressWidth = (level: string) => {
    switch (level.toLowerCase()) {
      case "expert":
        return 95;
      case "advanced":
        return 85;
      case "intermediate":
        return 70;
      case "basic":
        return 50;
      case "beginner":
        return 30;
      default:
        return 60;
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-800">{skill.name}</span>
        <span className="text-xs text-gray-500">{skill.level}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
          style={{
            width: isVisible ? `${getProgressWidth(skill.level)}%` : "0%",
          }}
        />
      </div>
    </div>
  );
}

export default function About() {
  const [activeSkillTab, setActiveSkillTab] = useState<
    "programming" | "software" | "languages"
  >("programming");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="pt-6">
        <Header />
      </div>

      <div className="bg-gray-100">
        {/* Hero Section */}
        <section className="py-16 flex flex-col items-center">
          <div className="text-center mb-12">
            <h4 className="text-md text-gray-600">Get to Know</h4>
            <h2 className="text-5xl font-bold text-black">About Me</h2>
          </div>

          <div className="w-full max-w-7xl px-4">
            {/* Introduction */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-12">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg flex-shrink-0">
                  <img
                    src={profileImage}
                    alt="Avishek Devnath"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Hi, I'm <span className="text-blue-600">Avishek Devnath</span>
                  </h1>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    I'm a passionate Full-Stack Developer with over 3 years of experience
                    building modern web applications. I specialize in the MERN stack
                    (MongoDB, Express.js, React, Node.js) and love creating intuitive,
                    user-friendly solutions that make a real impact.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <button
                      onClick={() => scrollToSection("experience")}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Experience
                    </button>
                    <button
                      onClick={() => scrollToSection("skills")}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      See Skills
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* About Me Section */}
            <section
              id="about"
              className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8"
            >
              <div className="text-center mb-8 sm:mb-12 animate-fade-in">
                <h4 className="text-sm sm:text-md text-gray-600">Get To Know More</h4>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black">
                  About Me
                </h2>
              </div>

              <div className="w-full max-w-[90%] grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center px-4 py-6 sm:py-10">
                {/* Photo */}
                <div className="flex justify-center md:justify-end">
                  <div className="relative group">
                    <img
                      src={profileImage || "/placeholder.svg"}
                      alt="Avishek Devnath"
                      className="h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>

                {/* Text Section */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 sm:space-y-8">
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {/* Experience */}
                    <div className="bg-white text-center text-black flex flex-col items-center justify-center px-4 sm:px-6 py-4 rounded-lg border shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                      <FaAward className="text-3xl sm:text-4xl text-yellow-500 mb-2 animate-bounce" />
                      <h5 className="text-lg sm:text-xl font-semibold">Experience</h5>
                      <p className="text-xs sm:text-sm mt-4">
                        <AnimatedCounter end={3} suffix="+" /> years as a Full-Stack
                        Developer
                      </p>
                    </div>

                    {/* Education */}
                    <div className="bg-white text-center text-black flex flex-col items-center justify-center px-4 sm:px-6 py-4 rounded-lg border shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                      <FaGraduationCap className="text-3xl sm:text-4xl text-blue-500 mb-2 animate-pulse" />
                      <h5 className="text-lg sm:text-xl font-semibold">Education</h5>
                      <p className="text-xs sm:text-sm mt-4">
                        MSc in CSE (Ongoing), Dhaka University <br />
                        BSc in CSE, BGC Trust University, 2020–2024
                      </p>
                    </div>
                  </div>

                  {/* Paragraph */}
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                    Hi, I'm Avishek Devnath! I'm a CSE graduate with a BSc from BGC
                    Trust University Bangladesh, and I'm currently pursuing an MSc at
                    Dhaka University. I specialize in MERN Stack Development and have
                    explored technologies like Docker, Kubernetes, and Django. I'm
                    seeking an internship or junior full-stack web developer role. I'm
                    a quick learner, love to learn and apply new things, and always
                    enjoy teamwork.
                  </p>
                </div>
              </div>
            </section>

            {/* Dynamic Experience Section */}
            <section className="py-12 sm:py-16 bg-white">
              <ExperienceSection 
                type="both"
                variant="compact"
                showFeaturedOnly={true}
                limit={6}
                title="Experience & Education"
                subtitle="Professional journey and academic background"
                className="bg-transparent"
              />
            </section>

            {/* Skills Section */}
            <section
              id="skills"
              className="py-12 sm:py-16 flex flex-col items-center bg-gray-100"
            >
              <div className="text-center mb-8 sm:mb-12">
                <h4 className="text-sm sm:text-md text-gray-600">Explore My</h4>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black">
                  Skills
                </h2>
              </div>

              <div className="w-full max-w-6xl px-4 sm:px-6">
                {/* Skill Tabs */}
                <div className="flex justify-center mb-8">
                  <div className="bg-gray-100 p-1 rounded-lg">
                    {[
                      {
                        key: "programming",
                        label: "Programming",
                        icon: FaCode,
                        color: "text-blue-500",
                      },
                      {
                        key: "software",
                        label: "Software",
                        icon: FaPaintBrush,
                        color: "text-purple-500",
                      },
                      {
                        key: "languages",
                        label: "Languages",
                        icon: FaGlobe,
                        color: "text-red-500",
                      },
                    ].map(({ key, label, icon: Icon, color }) => (
                      <button
                        key={key}
                        onClick={() => setActiveSkillTab(key as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
                          activeSkillTab === key
                            ? "bg-white shadow-md text-gray-900"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <Icon
                          className={`${color} ${
                            activeSkillTab === key ? "animate-pulse" : ""
                          }`}
                        />
                        <span className="font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills Content */}
                <div className="min-h-[400px]">
                  {activeSkillTab === "programming" && (
                    <div className="space-y-8">
                      {Object.entries(programmingSkills).map(
                        ([category, skills]) => (
                          <div key={category} className="space-y-4">
                            <button
                              onClick={() => toggleSection(category)}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <h4 className="text-lg font-semibold text-gray-800 capitalize">
                                {category.replace(/([A-Z])/g, " $1").trim()}
                              </h4>
                              {expandedSections.has(category) ? (
                                <FaChevronUp />
                              ) : (
                                <FaChevronDown />
                              )}
                            </button>

                            {expandedSections.has(category) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                                {skills.map((skill, skillIndex) => (
                                  <SkillProgressBar
                                    key={skillIndex}
                                    skill={skill}
                                    delay={skillIndex * 100}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {activeSkillTab === "software" && (
                    <div className="space-y-8">
                      {Object.entries(softwareSkills).map(([category, skills]) => (
                        <div key={category} className="space-y-4">
                          <button
                            onClick={() => toggleSection(`software-${category}`)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <h4 className="text-lg font-semibold text-gray-800 capitalize">
                              {category.replace(/([A-Z])/g, " $1").trim()}
                            </h4>
                            {expandedSections.has(`software-${category}`) ? (
                              <FaChevronUp />
                            ) : (
                              <FaChevronDown />
                            )}
                          </button>

                          {expandedSections.has(`software-${category}`) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                              {skills.map((skill, skillIndex) => (
                                <SkillProgressBar
                                  key={skillIndex}
                                  skill={skill}
                                  delay={skillIndex * 100}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeSkillTab === "languages" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {languages.map((lang, index) => (
                        <SkillProgressBar
                          key={index}
                          skill={lang}
                          delay={index * 100}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Projects Section */}
            <section
              id="projects"
              className="py-12 sm:py-16 flex flex-col items-center bg-gray-100"
            >
              <div className="text-center mb-8 sm:mb-12">
                <h4 className="text-sm sm:text-md text-gray-600">Browse My Recent</h4>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black">
                  Projects
                </h2>
              </div>

              <div className="w-full max-w-[90%] sm:max-w-6xl">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-600">Loading projects...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : (
                  <ProjectGrid 
                    projects={projects}
                    defaultStatus="published"
                  />
                )}
              </div>
            </section>

            {/* Contact Section */}
            <section
              id="contact"
              className="py-12 sm:py-16 flex flex-col items-center bg-white"
            >
              <div className="text-center mb-8 sm:mb-12">
                <h4 className="text-sm sm:text-md text-gray-600">Get in Touch</h4>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black">
                  Contact Me
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-12 sm:mb-16 px-4">
                <a
                  href="mailto:avishekdevnath@gmail.com"
                  className="group flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-full text-base sm:text-lg font-medium text-black hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg w-full sm:w-auto"
                >
                  <FaEnvelope className="group-hover:animate-bounce" />
                  <span>avishekdevnath@gmail.com</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/avishekdevnath"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-full text-base sm:text-lg font-medium text-black hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg w-full sm:w-auto"
                >
                  <FaLinkedin className="group-hover:animate-pulse" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </section>
          </div>
        </section>
      </div>

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
