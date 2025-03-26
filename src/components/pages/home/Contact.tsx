import React from "react";
import { FaEnvelope, FaLinkedin } from "react-icons/fa"; // For email and LinkedIn icons

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h4 className="text-md text-gray-600">Get in Touch</h4>
        <h4 className="text-5xl font-bold text-black">Contact Me</h4>
      </div>

      {/* Contact Buttons */}
      <div className="flex space-x-4 mb-16">
        <a
          href="mailto:example@gmail.com"
          className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-full text-lg font-medium text-black hover:bg-gray-100 transition"
        >
          <FaEnvelope />
          <span>Example@gmail.com</span>
        </a>
        <a
          href="https://www.linkedin.com/in/yourprofile"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-full text-lg font-medium text-black hover:bg-gray-100 transition"
        >
          <FaLinkedin />
          <span>LinkedIn</span>
        </a>
      </div>

    </div>
  );
}