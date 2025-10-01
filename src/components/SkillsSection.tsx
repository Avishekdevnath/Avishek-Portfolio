"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaCode, FaPaintBrush, FaGlobe, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { programmingSkills, softwareSkills, languages } from "../data/data";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface SkillProgressBarProps {
  skill: { name: string; level: string };
  delay?: number;
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
      className="bg-gradient-to-b from-gray-50 to-white p-4 rounded-2xl border border-gray-300 shadow-inner transition-all duration-300"
      style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-800">{skill.name}</span>
        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">{skill.level}</span>
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

interface SkillsSectionProps {
  className?: string;
}

export default function SkillsSection({ className = "" }: SkillsSectionProps) {
  const [activeSkillTab, setActiveSkillTab] = useState<
    "programming" | "software" | "languages"
  >("programming");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  // Scroll animation hook
  const skillsAnimation = useScrollAnimation();

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

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <section 
      id="skills" 
      ref={skillsAnimation.ref}
      className={`transition-all duration-700 ease-out ${
        skillsAnimation.isVisible ? 'opacity-100 translate-y-0' : prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}>
      
      {/* Header */}
      <div className="text-center mb-4 md:mb-6">
        <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Explore My</h4>
        <h2 className="text-h4 md:text-h3 weight-bold text-gray-900 mb-6">
          Skills
        </h2>
        <p className="text-body-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
          A comprehensive overview of my technical skills, programming languages, and software tools expertise.
        </p>
      </div>

      <div className="w-full max-w-6xl mx-auto">
        {/* Skill Tabs */}
        <div className="flex justify-center mb-4">
          <div className="bg-white border border-gray-200 p-1 rounded-xl shadow-sm flex">
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
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeSkillTab === key
                    ? "bg-blue-50 border border-blue-200 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className={`${color} ${activeSkillTab === key ? "animate-pulse" : ""}`} />
                <span className="font-medium text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Skills Content */}
        <div>
          {activeSkillTab === "programming" && (
            <div className="space-y-6">
              {Object.entries(programmingSkills).map(
                ([category, skills]) => (
                  <div key={category} className="space-y-4">
                    <button
                      onClick={() => toggleSection(category)}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-b from-gray-50 to-white border border-gray-300 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-inner"
                      style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}
                    >
                      <h4 className="text-h5 weight-semibold text-gray-800 capitalize">
                        {category.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      {expandedSections.has(category) ? (
                        <FaChevronUp className="text-gray-600" />
                      ) : (
                        <FaChevronDown className="text-gray-600" />
                      )}
                    </button>

                    {expandedSections.has(category) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {skills.map((skill, skillIndex) => (
                          <div 
                            key={skillIndex}
                            className="animate-fade-in"
                            style={{ animationDelay: `${skillIndex * 100}ms` }}
                          >
                            <SkillProgressBar
                              skill={skill}
                              delay={skillIndex * 100}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {activeSkillTab === "software" && (
            <div className="space-y-6">
              {Object.entries(softwareSkills).map(([category, skills]) => (
                <div key={category} className="space-y-4">
                  <button
                    onClick={() => toggleSection(`software-${category}`)}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-b from-gray-50 to-white border border-gray-300 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-inner"
                    style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}
                  >
                    <h4 className="text-h5 weight-semibold text-gray-800 capitalize">
                      {category.replace(/([A-Z])/g, " $1").trim()}
                    </h4>
                    {expandedSections.has(`software-${category}`) ? (
                      <FaChevronUp className="text-gray-600" />
                    ) : (
                      <FaChevronDown className="text-gray-600" />
                    )}
                  </button>

                  {expandedSections.has(`software-${category}`) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {skills.map((skill, skillIndex) => (
                        <div 
                          key={skillIndex}
                          className="animate-fade-in"
                          style={{ animationDelay: `${skillIndex * 100}ms` }}
                        >
                          <SkillProgressBar
                            skill={skill}
                            delay={skillIndex * 100}
                          />
                        </div>
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
                <div 
                  key={index}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <SkillProgressBar
                    skill={lang}
                    delay={index * 100}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
    </section>
  );
}
