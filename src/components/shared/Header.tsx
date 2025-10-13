"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("/assets/home/profile-img.jpg");

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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Blogs", href: "/blogs" },
    { name: "Tools", href: "https://aitoolbox-v1.vercel.app/" },
    { name: "Contact", href: "/contact" },
    { name: "Hire Me", href: "/hire-me" },
  ];

  return (
    // <header
    //   className={`${styles.navStyle} rounded-full border m-8 sticky top-0 z-50 shadow-md mx-auto lg:max-w-[70%] md:max-w-[90%] sm:max-w-[95%]`}
    // >
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //     <div className="flex justify-between items-center py-4">
    //       {/* Logo/Name */}
    //       <div className="text-2xl font-bold tracking-tight shrink-0">
    //         <Link href="/" className="hover:text-teal-400 transition-colors">
    //           Avishek
    //         </Link>
    //       </div>

    //       {/* Desktop Navigation */}
    //       <nav className="hidden lg:flex space-x-8 flex-wrap">
    //         {navLinks.map((link) => (
    //           <div
    //             key={link.name}
    //             className={`px-3 py-1 ${
    //               link.name === "Hire Me"
    //                 ? `${styles.hireStyle} border-2 border-orange-400 rounded-full`
    //                 : ""
    //             }`}
    //           >
    //             <Link
    //               href={link.href}
    //               className="text-lg font-medium hover:text-teal-400 transition-colors"
    //             >
    //               {link.name}
    //             </Link>
    //           </div>
    //         ))}
    //       </nav>

    //       {/* Mobile Menu Button */}
    //       <div className="lg:hidden">
    //         <button
    //           onClick={() => setIsOpen(!isOpen)}
    //           className="focus:outline-none p-2"
    //           aria-label="Toggle menu"
    //         >
    //           <svg
    //             className="w-6 h-6"
    //             fill="none"
    //             stroke="currentColor"
    //             viewBox="0 0 24 24"
    //             xmlns="http://www.w3.org/2000/svg"
    //           >
    //             {isOpen ? (
    //               <path
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 d="M6 18L18 6M6 6l12 12"
    //               />
    //             ) : (
    //               <path
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 d="M4 6h16M4 12h16m-7 6h7"
    //               />
    //             )}
    //           </svg>
    //         </button>
    //       </div>
    //     </div>

    //     {/* Mobile Navigation */}
    //     {isOpen && (
    //       <nav className="lg:hidden bg-gray-800 py-4 px-4">
    //         <ul className="flex flex-col space-y-4 text-center">
    //           {navLinks.map((link) => (
    //             <li key={link.name}>
    //               <Link
    //                 href={link.href}
    //                 className="text-lg font-medium text-white hover:text-teal-400 transition-colors"
    //                 onClick={() => setIsOpen(false)}
    //               >
    //                 {link.name}
    //               </Link>
    //             </li>
    //           ))}
    //         </ul>
    //       </nav>
    //     )}
    //   </div>
    // </header>
    <header
      className={`${styles.navStyle}   border mx-auto mt-8 z-50 shadow-md lg:max-w-[70%] md:max-w-[90%] sm:max-w-[95%] ${isOpen ? "rounded-lg" : "rounded-full"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300">
              <Image
                src={profileImage}
                alt="Avishek Devnath"
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="text-2xl font-bold tracking-tight">
              Avishek
            </div>
          </Link>

          <nav className="hidden lg:flex space-x-8 flex-wrap">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className={`px-3 py-1 ${link.name === "Hire Me"
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

          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none p-4 rounded-md hover:bg-gray-100 transition-colors relative z-10 pointer-events-auto"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 transition-transform duration-300"
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

        <nav
          className={`lg:hidden transition-all duration-300 ease-in-out ${isOpen
              ? "max-h-screen opacity-100 py-4 px-4"
              : "max-h-0 opacity-0 py-0 px-4"
            } ${styles.navStyle} border-t border-gray-200 shadow-md`}
        >
          <ul className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`block text-lg font-medium text-gray-800 hover:bg-gray-100 hover:text-teal-400 py-3 px-4 rounded-lg transition-colors ${link.name === "Hire Me"
                      ? `${styles.hireStyle} border-2 border-orange-400 rounded-full`
                      : ""
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}