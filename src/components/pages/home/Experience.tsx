"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "@/components/shared/LoadingScreen";
import { Code, Palette, Server, Wrench } from "lucide-react";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import "../../../styles/skills.css";

interface Skill {
  _id: string;
  name: string;
  proficiency: number;
  order: number;
}

interface ApiResponse {
  success: boolean;
  data: Record<string, Skill[]>;
  error?: string;
}

// Category icons mapping
const CategoryIcons: Record<string, JSX.Element> = {
  "frontenddevelopment": <Palette className="text-blue-500" size={32} />,
  "backenddevelopment": <Server className="text-green-500" size={32} />,
  "ai&machinelearning": <Code className="text-purple-500" size={32} />,
  "graphics&design": <Wrench className="text-orange-500" size={32} />,
  "office&productivity": <Wrench className="text-yellow-500" size={32} />,
};

// Function to format category name for display
const formatCategoryName = (category: string): string => {
  return category
    .split(/(?=[A-Z&])/)
    .join(" ")
    .split("&")
    .join(" & ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^[a-z]/, (str) => str.toUpperCase());
};

// Function to render star rating
const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - Math.ceil(rating);

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />);
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
  }

  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400" />);
  }

  return <div className="flex gap-1">{stars}</div>;
};

export default function Experience() {
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, Skill[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4 bg-white">
      {/* Header Section */}
      <div className="text-center mb-16">
        <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
          Technical Expertise
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-6">
          Professional Skills
        </h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          A comprehensive overview of my technical capabilities and expertise across various domains of software development.
        </p>
      </div>

      {/* Skills Grid */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Object.entries(skillsByCategory).map(([category, skills]) => (
          <div
            key={category}
            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gray-50 rounded-lg">
                {CategoryIcons[category] || <Code className="text-gray-500" size={32} />}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {formatCategoryName(category)}
              </h3>
            </div>
            {/* Skills List */}
            <div className="space-y-6">
              {skills
                .sort((a, b) => a.order - b.order)
                .map((skill) => (
                  <div key={skill._id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-medium">
                        {skill.name}
                      </span>
                      <span className="text-gray-600 font-medium">
                        {skill.proficiency}/5
                      </span>
                    </div>
                    <div className="flex items-center">
                      <StarRating rating={skill.proficiency} />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
