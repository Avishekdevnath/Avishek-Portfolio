import React from "react";
import { FaCheckCircle } from "react-icons/fa";

export default function Experience() {
  // Dynamic data structure for experience
  const experienceData = [
    {
      category: "Frontend Development",
      skills: [
        { name: "HTML", level: "Experienced" },
        { name: "CSS", level: "Experienced" },
        { name: "SASS", level: "Intermediate" },
        { name: "JavaScript", level: "Basic" },
        { name: "TypeScript", level: "Basic" },
        { name: "Material UI", level: "Intermediate" },
      ],
    },
    {
      category: "Backend Development",
      skills: [
        { name: "PostgreSQL", level: "Basic" },
        { name: "Node JS", level: "Intermediate" },
        { name: "Express JS", level: "Intermediate" },
        { name: "Git", level: "Intermediate" },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h4 className="text-md text-gray-600">Explore My</h4>
        <h4 className="text-5xl font-bold text-black">Experience</h4>
      </div>

      {/* Experience Section */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {experienceData.map((category, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-xl p-6"
          >
            <h5 className="text-xl font-semibold text-center mb-6">
              {category.category}
            </h5>
            <div className="grid grid-cols-2 gap-4">
              {category.skills.map((skill, skillIndex) => (
                <div
                  key={skillIndex}
                  className="flex items-center space-x-2"
                >
                  <FaCheckCircle className="text-green-500" />
                  <div>
                    <p className="text-base font-medium">{skill.name}</p>
                    <p className="text-sm text-gray-500">{skill.level}</p>
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