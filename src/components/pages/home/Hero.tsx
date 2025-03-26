import Image from "next/image";
import styles from "./hero.module.css";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export default function Hero() {
  const profileImage = "/assets/home/profile-img.jpg";

  return (
    <section
      className={`${styles.heroStyle} grid grid-cols-1 mt-0 pt-0 md:grid-cols-2 gap-2 md:gap-8 lg:gap-12 px-4 sm:px-6 lg:px-8 pb-2 min-h-screen items-center`}
      id="hero"
    >
      {/* Left Column: Image */}
      <div className="flex justify-center md:justify-end">
        <div className="relative w-80 h-80 sm:w-80 sm:h-80 md:w-80 md:h-80 lg:w-80 lg:h-80">
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
        <p className="text-lg sm:text-xl text-gray-600">Hello, I’m</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold">Avishek Devnath</h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-600">
          A Software Engineer
        </h2>
        <p className="text-base sm:text-lg text-gray-500">Building scalable solutions</p>

        {/* Buttons */}
        <div className="flex flex-col items-center justify-center sm:flex-row gap-3 w-full sm:w-auto">
          <a
            href="/assets/resume.pdf"
            download
            className="bg-white text-black border-2 px-6 py-2 rounded-full hover:bg-teal-600 hover:text-white transition-colors w-full sm:w-auto text-center"
          >
            Download CV
          </a>
          <a
            href="/contact"
            className="bg-black text-white border-2 px-6 py-2 rounded-full hover:bg-teal-600 hover:text-white transition-colors w-full sm:w-auto text-center"
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
            className="text-gray-600 hover:text-teal-500 transition-colors"
            aria-label="Visit Avishek Devnath's LinkedIn profile"
          >
            <FaLinkedin size={30} />
          </a>
          <a
            href="https://github.com/your-username"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-teal-500 transition-colors"
            aria-label="Visit Avishek Devnath's GitHub profile"
          >
            <FaGithub size={30} />
          </a>
        </div>
        </div>
      </div>
    </section>
  );
}