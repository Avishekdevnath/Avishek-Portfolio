"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { FaAward } from "react-icons/fa6";
import { MdSchool } from "react-icons/md";

export default function About() {
  const profileImage = "/assets/home/profile-img.jpg";
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true); // Trigger animations on mount
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center p-4 md:p-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h4 className="text-lg text-gray-600">Get To Know More</h4>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
            About Me
          </h2>
        </div>

        {/* Photo and Text Section */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-items-center p-6 md:p-10">
          <div className="flex justify-center md:justify-end">
            <img
              src={profileImage || "/placeholder.svg"}
              alt="About Me"
              className="h-64 w-64 md:h-80 md:w-80 object-cover rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <FaAward className="text-4xl text-yellow-500 mb-3 mx-auto" />
                <h5 className="text-xl font-semibold text-gray-800">
                  Experience
                </h5>
                <p className="text-sm text-gray-600 mt-2">
                  3+ years as a CS Instructor and Software Developer
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                <MdSchool className="text-4xl text-blue-500 mb-3 mx-auto" />
                <h5 className="text-xl font-semibold text-gray-800">
                  Education
                </h5>
                <p className="text-sm text-gray-600 mt-2">
                  B.Sc. in CSE in 2024 <br />
                  M.Sc. in CSE (Running)
                </p>
              </div>
            </div>
            <p className="text-lg text-gray-700 max-w-lg">
              Hi, I'm Avishek! I'm a passionate developer with a love for
              creating innovative solutions. This is where I share a bit about
              my journey, skills, and interests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
