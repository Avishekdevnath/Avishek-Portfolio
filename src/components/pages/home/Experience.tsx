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
    <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
      {/* Header Section */}
      <div className="text-center mb-16 transform transition-all duration-500 ease-out">
        <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Technical Expertise</h4>
        <h2 className="text-h3 md:text-h2 weight-bold text-gray-900 mb-6">
          Professional Skills
        </h2>
        <p className="text-body-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
          A comprehensive overview of my technical capabilities and expertise across various domains of software development.
        </p>
      </div>

      {/* Skills Grid */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(skillsByCategory).map(([category, skills], index) => (
          <div
            key={category}
            className={`bg-gradient-to-b from-gray-50 to-white p-8 rounded-2xl border border-gray-300 shadow-inner hover:shadow-lg transition-all duration-300 transform ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ 
              transitionDelay: `${index * 100}ms`,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors group shadow-sm">
                {CategoryIcons[category] || <Code className="text-gray-500 group-hover:scale-110 transition-transform duration-300" size={28} />}
              </div>
              <div>
                <h3 className="text-h5 weight-semibold text-gray-900 mb-1">
                  {formatCategoryName(category)}
                </h3>
                <p className="text-caption text-gray-500">
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
                    className="group p-4 rounded-xl hover:bg-white transition-all duration-300 border border-transparent hover:border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        {SkillIcons[skill.name] && (
                          <span className="transform transition-all duration-300 group-hover:scale-110">
                            {SkillIcons[skill.name]}
                          </span>
                        )}
                        <span className="text-gray-800 font-medium group-hover:text-blue-600 transition-colors text-sm">
                          {skill.name}
                        </span>
                      </div>
                      <span className="text-gray-600 font-medium text-sm">
                        {skill.proficiency}/5
                      </span>
                    </div>
                    <div className="flex items-center">
                      <StarRating rating={skill.proficiency} />
                    </div>
                    {skill.description && (
                      <p className="mt-2 text-body-sm text-gray-500 group-hover:text-gray-700 transition-colors leading-relaxed">
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
