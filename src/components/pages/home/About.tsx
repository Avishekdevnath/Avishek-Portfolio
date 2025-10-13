"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { FaAward } from "react-icons/fa6";
import { MdSchool } from "react-icons/md";

export default function About() {
  const [profileImage, setProfileImage] = useState("/assets/home/profile-img.jpg");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        if (data.success && data.data?.profileImage) {
          setProfileImage(data.data.profileImage);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    
    fetchSettings();
  }, []);

  useEffect(() => {
    setAnimate(true); // Trigger animations on mount
  }, []);

  return (
    <div className="py-16 px-4 bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Get To Know More</h4>
          <h2 className="text-h3 md:text-h2 weight-bold text-gray-900 mb-6">
            About Me
          </h2>
          <p className="text-body-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Learn more about my background, experience, and educational journey in computer science and software development.
          </p>
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Profile Image */}
          <div className="flex justify-center lg:justify-start">
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 shadow-inner p-4" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
              <img
                src={profileImage || "/placeholder.svg"}
                alt="Avishek Devnath"
                className="h-80 w-80 object-cover rounded-xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="space-y-8">
            {/* Name and Title */}
            <div className="text-center lg:text-left">
              <h3 className="text-h4 md:text-h3 weight-bold text-gray-900 mb-3">Avishek Devnath</h3>
              <p className="text-body-sm text-gray-600 leading-relaxed">
                Hi, I'm Avishek Devnath! I am a CSE graduate from BGC Trust University and an MSc student at Dhaka University, specializing in MERN Stack development with experience in Docker, Kubernetes, and Django. As a Senior CS Instructor at Phitron, I've mentored students in C, C++, Python, DSA, SQL, and web development, and built open-source projects like Xerror and Py-OneSend. I am now seeking opportunities as a Software Engineer to build scalable, secure, and user-focused applications.
              </p>
            </div>

            {/* Experience and Education Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-300 shadow-inner hover:shadow-lg transition-all duration-300" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <FaAward className="text-2xl text-yellow-600" />
                  </div>
                  <h5 className="text-h5 weight-semibold text-gray-900">Experience</h5>
                </div>
                <p className="text-body-sm text-gray-600 leading-relaxed">
                  3+ years as senior cs instructor and practicing full-stack developer
                </p>
              </div>
              
              <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-300 shadow-inner hover:shadow-lg transition-all duration-300" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <MdSchool className="text-2xl text-blue-600" />
                  </div>
                  <h5 className="text-h5 weight-semibold text-gray-900">Education</h5>
                </div>
                <div className="space-y-2">
                  <p className="text-body-sm text-gray-600 leading-relaxed">
                    <strong>MSc in CSE</strong> (Ongoing)<br />
                    Dhaka University
                  </p>
                  <p className="text-body-sm text-gray-600 leading-relaxed">
                    <strong>BSc in CSE</strong>, 2020–2024<br />
                    BGC Trust University Bangladesh
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
