import React from 'react'

export default function Footer() {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white">
        
        
      {/* Navigation Links */}
      <nav className="flex space-x-6 mb-4">
        {["About", "Experience", "Projects", "Contact"].map((link, index) => (
          <a
            key={index}
            href={`#${link.toLowerCase()}`}
            className="text-base font-medium text-black hover:text-gray-600 transition"
          >
            {link}
          </a>
        ))}
      </nav>

      {/* Copyright Notice */}
      <p className="text-sm text-gray-600">
        Copyright © 2025 Avishek Devnath. All Rights Reserved.
      </p>
    </div>
  )
}
