import Image from "next/image";
import styles from "./hero.module.css";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import Header from "@/components/shared/Header";

export default function Hero() {
  const profileImage = "/assets/home/profile-img.jpg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
      <div className="pt-6">
        <Header />
      </div>
      <section
        className={`${styles.heroStyle} grid grid-cols-1 mt-0 pt-0 md:grid-cols-2 gap-2 md:gap-8 lg:gap-12 px-4 sm:px-6 lg:px-8 pb-2 min-h-screen items-center`}
        id="hero"
      >
        {/* Left Column: Image */}
        <div className="flex justify-center md:justify-end">
          <div className="relative w-80 h-80 sm:w-80 sm:h-80 md:w-80 md:h-80 lg:w-80 lg:h-80 bg-gradient-to-b from-gray-50 to-white rounded-full border border-gray-300 shadow-inner p-2" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
            <Image
              src={profileImage}
              alt="Profile picture of Avishek Devnath"
              fill
              sizes="(max-width: 640px) 224px, (max-width: 768px) 256px, 320px"
              quality={85}
              priority={true}
              className="rounded-full object-cover"
            />
          </div>
        </div>

        {/* Right Column: Text, Buttons, Social Icons */}
        <div className="flex flex-col justify-center items-center md:items-start text-center md:text-center ">
          <div className="space-y-4">
            <p className="text-caption text-gray-600">Hello, I’m</p>
            <h1 className="text-h2 md:text-h1 weight-bold">
              Avishek Devnath
            </h1>
            <h2 className="text-h4 md:text-h3 weight-semibold text-gray-600">
              A Software Engineer
            </h2>
            <p className="text-body text-gray-500">
              Building scalable solutions
            </p>

            {/* Buttons */}
            <div className="flex flex-col items-center justify-center sm:flex-row gap-3 w-full sm:w-auto">
              <a
                href="/assets/resume.pdf"
                download
                className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-inner w-full sm:w-auto text-center text-button"
                style={{boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'}}
              >
                Download CV
              </a>
              <a
                href="/contact"
                className="bg-blue-600 text-white border border-blue-500 px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg w-full sm:w-auto text-center text-button"
              >
                Contact Me
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-center space-x-4">
              <a
                href="https://linkedin.com/in/your-profile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-110"
                aria-label="Visit Avishek Devnath's LinkedIn profile"
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href="https://github.com/your-username"
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