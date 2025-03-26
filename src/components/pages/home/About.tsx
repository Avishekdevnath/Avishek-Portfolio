import React from "react";
import { FaAward } from "react-icons/fa6";
import { MdSchool } from "react-icons/md";

export default function About() {
  const profileImage = "/assets/home/profile-img.jpg";
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h4 className="text-md">Get To Know More</h4>
        <h4 className="text-5xl font-bold">About Me</h4>
      </div>

      {/* Photo and Text Section */}
      <div className="w-full  max-w-[90%] grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-items-center p-10">
        {/* Photo */}
        <div className="flex md:justify-end bg-green-300 ">
          <img
            src={profileImage}
            alt="About Me"
            className="h-64 w-64 object-cover rounded-lg"
          />
        </div>

        {/* Text Section (Experience, Education, Paragraph) */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Experience */}
            <div className="bg-white text-center text-black flex flex-col items-center justify-center px-6 py-4 rounded-lg border shadow-sm">
              <FaAward className="text-4xl text-yellow-500 mb-2" />
              <h5 className="text-xl font-semibold">Experience</h5>
              <p className="text-sm mt-4">
                3+ years as a CS Instructor and Software Developer
              </p>
            </div>

            {/* Education */}
            <div className="bg-white text-center text-black flex flex-col items-center justify-center px-6 py-4 rounded-lg border shadow-sm">
              <MdSchool className="text-4xl text-blue-500 mb-2" />
              <h5 className="text-xl font-semibold">Education</h5>
              <p className="text-sm mt-4">
                B.Sc. in CSE in 2024 <br />
                M.Sc. in CSE (Running)
              </p>
            </div>
          </div>

          {/* Paragraph */}
          <p className="text-lg text-black">
            Hi, I’m Avishek! I’m a passionate developer with a love for creating
            innovative solutions. This is where I share a bit about my journey,
            skills, and interests.
          </p>
        </div>
      </div>
    </div>
  );
}