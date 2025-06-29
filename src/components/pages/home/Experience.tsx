"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "@/components/shared/LoadingScreen";
import { Code, Palette, Server, Brain, FileText, Laptop, Briefcase } from "lucide-react";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
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

// Enhanced star rating component with animations
const StarRating = ({ rating }: { rating: number }) => {
  const stars: JSX.Element[] = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - Math.ceil(rating);

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <FaStar 
        key={`full-${i}`} 
        className="text-yellow-400 transform transition-all duration-300 hover:scale-110" 
      />
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <FaStarHalfAlt 
        key="half" 
        className="text-yellow-400 transform transition-all duration-300 hover:scale-110" 
      />
    );
  }

  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <FaRegStar 
        key={`empty-${i}`} 
        className="text-yellow-400 transform transition-all duration-300 hover:scale-110" 
      />
    );
  }

  return <div className="flex gap-1">{stars}</div>;
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-b from-white to-gray-50">
      {/* Header Section */}
      <div className="text-center mb-16 transform transition-all duration-500 ease-out">
        <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium inline-block hover:bg-blue-200 transition-colors">
          Technical Expertise
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-6 mb-4">
          Professional Skills
        </h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          A comprehensive overview of my technical capabilities and expertise across various domains of software development.
        </p>
      </div>

      {/* Skills Grid */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(skillsByCategory).map(([category, skills], index) => (
          <div
            key={category}
            className={`bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform border border-gray-100 ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                {CategoryIcons[category] || <Code className="text-gray-500 group-hover:scale-110 transition-transform duration-300" size={32} />}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {formatCategoryName(category)}
                </h3>
                <p className="text-sm text-gray-500">
                  {skills.length} {skills.length === 1 ? 'Skill' : 'Skills'}
                </p>
              </div>
            </div>

            {/* Skills List */}
            <div className="space-y-6">
              {skills
                .sort((a, b) => a.order - b.order)
                .map((skill, skillIndex) => (
                  <div 
                    key={skill._id} 
                    className="group p-4 rounded-xl hover:bg-gray-50 transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        {SkillIcons[skill.name] && (
                          <span className="transform transition-all duration-300 group-hover:scale-110">
                            {SkillIcons[skill.name]}
                          </span>
                        )}
                        <span className="text-gray-800 font-medium group-hover:text-blue-600 transition-colors">
                          {skill.name}
                        </span>
                      </div>
                      <span className="text-gray-600 font-medium">
                        {skill.proficiency}/5
                      </span>
                    </div>
                    <div className="flex items-center">
                      <StarRating rating={skill.proficiency} />
                    </div>
                    {skill.description && (
                      <p className="mt-2 text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
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
