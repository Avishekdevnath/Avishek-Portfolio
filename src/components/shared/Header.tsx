// src\components\shared\Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Blogs", href: "/blogs" },
    { name: "Contact", href: "/contact" },
    { name: "Hire Me", href: "/hire-me" },
  ];

  return (
    <header
      className={`${styles.navStyle} rounded-full border mx-8 mt-8 sticky top-0 z-50 shadow-md mx-auto lg:max-w-[70%] md:max-w-[90%] sm:max-w-[95%]`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Name */}
          <div className="text-2xl font-bold tracking-tight shrink-0">
            <Link href="/" className="hover:text-teal-400 transition-colors">
              Avishek
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8 flex-wrap">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className={`px-3 py-1 ${
                  link.name === "Hire Me"
                    ? `${styles.hireStyle} border-2 border-orange-400 rounded-full`
                    : ""
                }`}
              >
                <Link
                  href={link.href}
                  className="text-lg font-medium hover:text-teal-400 transition-colors"
                >
                  {link.name}
                </Link>
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="lg:hidden bg-gray-800 py-4 px-4">
            <ul className="flex flex-col space-y-4 text-center">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-lg font-medium text-white hover:text-teal-400 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}