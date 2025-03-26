// /src/components/pages/home/Hero.tsx
import Image from "next/image";
import styles from "./hero.module.css";
import { FaLinkedin, FaGithub } from "react-icons/fa"; // Import icons

export default function Hero() {
  const profileImage = "/assets/home/profile-img.jpg";

  return (
    <section className={`${styles.heroStyle} grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-[10vw]  sm:px-auto lg:pe-8 md:pe-8`}>
      {/* Left Column: Image and Name */}
      <div className="flex flex-col justify-center items-end lg:items-right md:items-right">
        <div className="relative sm:w-64 sm:h-64 md:w-5/6 md:h-80 lg:w-96 lg:h-96 lg:w-5/6">
          {/* <Image
            src={profileImage}
            alt="Avishek Devnath"
            layout="fill"
            objectFit="cover"
            quality={100} // Max quality
            priority={true} // Preload for Hero (avoids lazy loading)
            className="rounded-full mb-4"
          /> */}
          <Image
            src={profileImage}
            alt="Avishek Devnath"
            // width={384} // Matches lg:w-96
            // height={384}
            layout="fill"
            // sizes="(max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
            quality={100}
            priority={true}
            className="rounded-full mb-4 max-w-full h-auto"
          />
        </div>

      </div>

      {/* Right Column: Text, Button, Social Icons */}
      <div className="flex flex-col items-start justify-center ">
        <div className="flex flex-col items-center justify-center ">
          <div className="text-center">
            <p className="text-xl text-gray-600 lg:mb-4">Hello, I’m</p>
            <h1 className="text-5xl font-semibold lg:mb-4">Avishek devnath</h1>
            <h2 className="text-3xl font-semibold text-gray-600 lg:mb-4">A Software Engineer</h2>
            <p className="text-lg text-gray-500 lg:mb-4">Building scalable solutions</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4 ">
            <div className="flex justify-center md:justify-start gap-4">
              <a
                href="/assets/resume.pdf"
                download
                className="bg-white text-black border-2 px-6 py-3 rounded-full hover:bg-teal-600 transition-colors"
              >
                Download CV
              </a>
              <a
                href="/assets/resume.pdf"
                download
                className="bg-black text-white border-2 px-6 py-3 rounded-full hover:bg-teal-600 transition-colors"
              >
                Contact Me
              </a>
            </div>
            <div className="flex justify-center md:justify-start space-x-4">
            <a
            href="https://linkedin.com/in/your-profile" // Replace with your LinkedIn URL
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-teal-500 transition-colors"
          >
            <FaLinkedin size={30} />
          </a>
          <a
            href="https://github.com/your-username" // Replace with your GitHub URL
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-teal-500 transition-colors"
          >
            <FaGithub size={30} />
          </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}