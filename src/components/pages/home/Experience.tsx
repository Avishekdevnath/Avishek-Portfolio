"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "@/components/shared/LoadingScreen";
import { Code, Palette, Server, Brain, FileText, Laptop, Briefcase } from "lucide-react";
import { SiMicrosoftoffice, SiGoogle, SiNotion, SiTrello, SiCanva } from "react-icons/si";
import "../../../styles/skills.css";

interface Skill {
  _id: string;
  name: string;
  proficiency: number;
  icon?: string;
  iconSet?: string;
  description?: string;
  featured: boolean;
  order: number;
}

interface ApiResponse {
  success: boolean;
  data: Record<string, Skill[]>;
  error?: string;
}

// Category icons mapping with improved icons
const CategoryIcons: Record<string, JSX.Element> = {
  "Frontend Development": <Palette className="text-blue-500" size={32} />,
  "Backend Development": <Server className="text-emerald-500" size={32} />,
  "AI & Machine Learning": <Brain className="text-purple-500" size={32} />,
  "Graphics & Design": <Laptop className="text-pink-500" size={32} />,
  "Office & Productivity": <FileText className="text-amber-500" size={32} />,
};

// Skill-specific icons mapping
const SkillIcons: Record<string, JSX.Element> = {
  "Microsoft Office": <SiMicrosoftoffice className="text-blue-600" size={24} />,
  "Google Workspace": <SiGoogle className="text-green-600" size={24} />,
  "Notion": <SiNotion className="text-gray-800" size={24} />,
  "Trello": <SiTrello className="text-blue-500" size={24} />,
  "Canva": <SiCanva className="text-blue-400" size={24} />,
};

// Function to format category name for display
const formatCategoryName = (category: string): string => {
  return category;  // Categories are already properly formatted
};

export default function Experience() {
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, Skill[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        
        const skillsResponse = await fetch('/api/skills');
        if (!skillsResponse.ok) {
          throw new Error('Failed to fetch skills');
        }
        const skillsData = await skillsResponse.json() as ApiResponse;
        if (!skillsData.success) {
          throw new Error(skillsData.error || 'Failed to fetch skills');
        }
        setSkillsByCategory(skillsData.data);
        // Trigger animations after data is loaded
        setTimeout(() => setAnimate(true), 100);

      } catch (error) {
        console.error('Error fetching skills:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch skills');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return null;

  const categoryEntries = Object.entries(skillsByCategory);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
      {/* Header Section */}
      <div className="text-center mb-12 transform transition-all duration-500 ease-out">
        <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Technical Expertise</h4>
        <h2 className="text-h3 md:text-h2 weight-bold text-gray-900 mb-4">
          Professional Skills
        </h2>
        <p className="text-body-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
          A clean, focused snapshot of the tools and domains I work with across backend, frontend, and product delivery.
        </p>
      </div>

      {/* Skills Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {categoryEntries.map(([category, skills], index) => (
          <div
            key={category}
            className={`bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-300 shadow-inner transition-all duration-300 transform ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ 
              transitionDelay: `${index * 80}ms`,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            {/* Category Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm">
                  {CategoryIcons[category] || <Code className="text-gray-500" size={22} />}
                </div>
                <div>
                  <h3 className="text-h5 weight-semibold text-gray-900">
                    {formatCategoryName(category)}
                  </h3>
                  <p className="text-caption text-gray-500">
                    {skills.length} {skills.length === 1 ? 'Skill' : 'Skills'}
                  </p>
                </div>
              </div>
              <span className="text-xs uppercase tracking-wide text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-full">
                Focus Area
              </span>
            </div>

            {/* Skills List */}
            <div className="space-y-4">
              {skills
                .sort((a, b) => a.order - b.order)
                .map((skill) => (
                  <div
                    key={skill._id}
                    className="rounded-xl border border-gray-200 bg-white/70 px-4 py-3 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {SkillIcons[skill.name] && (
                          <span className="text-gray-700">
                            {SkillIcons[skill.name]}
                          </span>
                        )}
                        <span className="text-gray-800 font-medium text-sm">
                          {skill.name}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">
                        {skill.proficiency}/5
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                        style={{ width: `${(skill.proficiency / 5) * 100}%` }}
                      />
                    </div>
                    {skill.description && (
                      <p className="mt-2 text-body-sm text-gray-500 leading-relaxed">
                        {skill.description}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
