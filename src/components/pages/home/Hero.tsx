import Image from "next/image";
import styles from "./hero.module.css";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export default function Hero() {
  const profileImage = "/assets/home/profile-img.jpg";

  return (
    <section
      className={`${styles.heroStyle} grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-8 lg:gap-12 px-4 sm:px-6 lg:px-8 py-2 min-h-screen items-center`}
    >
      {/* Left Column: Image */}
      <div className="flex justify-center md:justify-end">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80">
          <Image
            src={profileImage}
            alt="Avishek Devnath"
            layout="fill"
            objectFit="cover"
            quality={100}
            priority={true}
            className="rounded-full"
          />
        </div>
      </div>

      {/* Right Column: Text, Buttons, Social Icons */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
        <p className="text-lg sm:text-xl text-gray-600">Hello, I’m</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold">Avishek Devnath</h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-600">
          A Software Engineer
        </h2>
        <p className="text-base sm:text-lg text-gray-500">Building scalable solutions</p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <a
            href="/assets/resume.pdf"
            download
            className="bg-white text-black border-2 px-6 py-2 rounded-full hover:bg-teal-600 hover:text-white transition-colors w-full sm:w-auto text-center"
          >
            Download CV
          </a>
          <a
            href="/assets/resume.pdf"
            download
            className="bg-black text-white border-2 px-6 py-2 rounded-full hover:bg-teal-600 hover:text-white transition-colors w-full sm:w-auto text-center"
          >
            Contact Me
          </a>
        </div>

        {/* Social Icons */}
        <div className="flex  justify-center md:justify-center space-x-4">
          <a
            href="https://linkedin.com/in/your-profile"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-teal-500 transition-colors"
          >
            <FaLinkedin size={30} />
          </a>
          <a
            href="https://github.com/your-username"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-teal-500 transition-colors"
          >
            <FaGithub size={30} />
          </a>
        </div>
      </div>
    </section>
  );
}