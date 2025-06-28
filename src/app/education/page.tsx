"use client";

import React from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ExperienceSection from "@/components/ExperienceSection";
import { 
  FaGraduationCap, 
  FaBook, 
  FaAward, 
  FaUsers,
  FaLightbulb,
  FaCertificate
} from "react-icons/fa";

export default function EducationPage() {
  const educationHighlights = [
    {
      icon: <FaGraduationCap className="text-4xl text-purple-500" />,
      title: "Academic Excellence",
      description:
        "Pursuing advanced studies in Computer Science with a focus on cutting-edge technologies and research methodologies.",
    },
    {
      icon: <FaBook className="text-4xl text-blue-500" />,
      title: "Research & Learning",
      description:
        "Engaged in continuous learning and research, exploring new technologies and contributing to academic projects.",
    },
    {
      icon: <FaAward className="text-4xl text-yellow-500" />,
      title: "Academic Achievements",
      description:
        "Recognition for academic performance, participation in honors programs, and contributions to the academic community.",
    },
    {
      icon: <FaUsers className="text-4xl text-green-500" />,
      title: "Community Involvement",
      description:
        "Active participation in student organizations, clubs, and academic initiatives that enhance the learning experience.",
    },
  ];

  const academicFocus = [
    {
      icon: <FaLightbulb className="text-purple-600" />,
      area: "Computer Science",
      description: "Core computer science principles, algorithms, and software engineering practices"
    },
    {
      icon: <FaCertificate className="text-blue-600" />,
      area: "Research Methods",
      description: "Academic research methodologies and scientific inquiry approaches"
    },
    {
      icon: <FaBook className="text-green-600" />,
      area: "Technology Innovation",
      description: "Emerging technologies and their practical applications in modern software development"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="pt-6">
        <Header />
      </div>

      {/* Main Education Section */}
      <section className="py-16 flex flex-col items-center">
        <div className="text-center mb-12">
          <h4 className="text-md text-gray-600">Academic Journey</h4>
          <h2 className="text-5xl font-bold text-black">Education</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            My educational background, academic achievements, and continuous learning journey 
            in computer science and technology.
          </p>
        </div>

        <div className="w-full max-w-7xl px-4">
          {/* Education Highlights */}
          <div className="mb-16">
            <h3 className="text-3xl font-semibold text-gray-800 text-center mb-8">
              Educational Excellence
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {educationHighlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-center flex-col bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="mb-4">{highlight.icon}</div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">
                    {highlight.title}
                  </h4>
                  <p className="text-gray-600">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Focus Areas */}
          <div className="mb-16">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
                Academic Focus Areas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {academicFocus.map((focus, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {focus.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{focus.area}</h4>
                      <p className="text-gray-600 text-sm">{focus.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Education Entries */}
          <div className="mb-16">
            <ExperienceSection 
              type="education"
              variant="detailed"
              showFeaturedOnly={false}
              title="Educational Background"
              subtitle="Academic institutions, degrees, and qualifications"
              className="bg-transparent py-0"
            />
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Continuous Learning</h3>
            <p className="text-lg mb-6 opacity-90">
              Education is a lifelong journey. I'm always exploring new technologies, 
              methodologies, and opportunities to expand my knowledge and skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-block px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Discuss Opportunities
              </a>
              <a
                href="/projects"
                className="inline-block px-6 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-purple-600 transition-colors"
              >
                View Projects
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 