import React from "react";
import { FaEnvelope, FaLinkedin } from "react-icons/fa";

export default function Contact() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-white">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h4 className="text-sm sm:text-md text-gray-600">Get in Touch</h4>
        <h4 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black">Contact Me</h4>
      </div>

      {/* Contact Buttons */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-12 sm:mb-16 px-4 w-full sm:w-auto">
        <a
          href="mailto:example@gmail.com"
          className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-full text-base sm:text-lg font-medium text-black hover:bg-gray-100 transition w-full sm:w-auto"
        >
          <FaEnvelope />
          <span>Example@gmail.com</span>
        </a>
        <a
          href="https://www.linkedin.com/in/yourprofile"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-full text-base sm:text-lg font-medium text-black hover:bg-gray-100 transition w-full sm:w-auto"
        >
          <FaLinkedin />
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
  );
}