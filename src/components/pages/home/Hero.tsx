"use client";
import Image from "next/image";
import styles from "./hero.module.css";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import Header from "@/components/shared/Header";
import { useState, useEffect } from "react";

export default function Hero() {
  // Settings state
  const [profileImage, setProfileImage] = useState("/assets/home/profile-img.jpg");
  const [linkedinUrl, setLinkedinUrl] = useState("https://www.linkedin.com/in/avishek-devnath");
  const [githubUrl, setGithubUrl] = useState("https://github.com/Avishekdevnath");
  const [resumeUrl, setResumeUrl] = useState("/assets/resume.pdf");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  
  // Typewriter effect states
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const typewriterTexts = [
    "Building scalable solutions",
    "Crafting innovative web apps",
    "Optimizing user experiences",
    "Creating robust APIs",
    "Designing system architectures",
    "Solving complex problems"
  ];
  
  // Fetch settings data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        if (data.success && data.data) {
          // Extract social links
          const socialLinks = data.data.socialLinks || [];
          const linkedin = socialLinks.find((link: any) => link.platform === 'linkedin');
          const github = socialLinks.find((link: any) => link.platform === 'github');
          
          if (linkedin) setLinkedinUrl(linkedin.url);
          if (github) setGithubUrl(github.url);
          
          // Extract resume and portfolio URLs
          if (data.data.resumeUrl) setResumeUrl(data.data.resumeUrl);
          if (data.data.portfolioUrl) setPortfolioUrl(data.data.portfolioUrl);
          
          // Extract profile image
          if (data.data.profileImage) setProfileImage(data.data.profileImage);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    
    fetchSettings();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = typewriterTexts[currentIndex];
      
      if (isDeleting) {
        setCurrentText(current.substring(0, currentText.length - 1));
      } else {
        setCurrentText(current.substring(0, currentText.length + 1));
      }
      
      if (!isDeleting && currentText === current) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && currentText === "") {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % typewriterTexts.length);
      }
    }, isDeleting ? 50 : 100);
    
    return () => clearTimeout(timeout);
  }, [currentText, currentIndex, isDeleting, typewriterTexts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
      <div className="pt-6">
        <Header />
      </div>
      <section
        className={`${styles.heroStyle} grid grid-cols-1 mt-0 pt-0 md:grid-cols-2 gap-4 md:gap-8 lg:gap-10 px-4 sm:px-6 lg:px-8 pb-2 min-h-screen items-center max-w-5xl mx-auto`}
        id="hero"
      >
        {/* Left Column: Image */}
        <div className="flex justify-center md:justify-end">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[340px] md:h-[340px] lg:w-[360px] lg:h-[360px] bg-gradient-to-b from-gray-50 to-white rounded-full border border-gray-300 shadow-inner p-2" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
            <Image
              src={profileImage}
              alt="Profile picture of Avishek Devnath"
              fill
              sizes="(max-width: 640px) 288px, (max-width: 768px) 320px, (max-width: 1024px) 340px, 360px"
              quality={85}
              priority={true}
              className="rounded-full object-cover"
            />
          </div>
        </div>

        {/* Right Column: Text, Buttons, Social Icons */}
        <div className="flex flex-col justify-center items-center md:items-start text-center md:text-center">
          <div className="space-y-4">
            <p className="text-base md:text-lg text-gray-600">Hello, I'm</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Avishek Devnath
            </h1>
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-600">
              A Software Engineer
            </h2>
            <div className="h-6 md:h-7 flex items-center justify-center md:justify-center">
              <p className="text-sm md:text-base text-gray-500 flex items-center">
                <span className="font-medium">{currentText}</span>
                <span className="animate-pulse text-gray-400 ml-1">|</span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col items-center justify-center sm:flex-row gap-3 w-full sm:w-auto pt-2">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black border-2 border-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 w-full sm:w-auto text-center text-sm md:text-base"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff',
                  border: '2px solid #000000'
                }}
              >
                Resume
              </a>
              <a
                href="/contact"
                className="bg-black text-white border-2 border-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 w-full sm:w-auto text-center text-sm md:text-base"
                style={{
                  color: '#ffffff',
                  backgroundColor: '#000000',
                  border: '2px solid #000000'
                }}
              >
                Contact Me
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-center space-x-4 pt-1">
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-110"
                aria-label="Visit Avishek Devnath's LinkedIn profile"
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-110"
                aria-label="Visit Avishek Devnath's GitHub profile"
              >
                <FaGithub size={24} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}