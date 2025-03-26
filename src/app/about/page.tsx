import React from "react";
import {
    FaAward,
    FaCheckCircle,
    FaEnvelope,
    FaLinkedin,
    FaCode,
    FaPaintBrush,
    FaGlobe,
    FaGraduationCap,
} from "react-icons/fa";
import { programmingSkills, softwareSkills, languages } from "../../data/data";
import { projectsData } from "../../data/projectsData";
import ProjectCard from "../../components/ProjectCard";

export default function About() {
    const profileImage = "/assets/home/profile-img.jpg";

    return (
        <div className="bg-gray-100">
            {/* About Me Section */}
            <section className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="text-center mb-8 sm:mb-12">
                    <h4 className="text-sm sm:text-md text-gray-600">Get To Know More</h4>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black">About Me</h2>
                </div>

                <div className="w-full max-w-[90%] grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center px-4 py-6 sm:py-10">
                    {/* Photo */}
                    <div className="flex justify-center md:justify-end">
                        <img
                            src={profileImage}
                            alt="Avishek Devnath"
                            className="h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 object-cover rounded-lg shadow-lg"
                        />
                    </div>

                    {/* Text Section */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 sm:space-y-8">
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                            {/* Experience */}
                            <div className="bg-white text-center text-black flex flex-col items-center justify-center px-4 sm:px-6 py-4 rounded-lg border shadow-sm">
                                <FaAward className="text-3xl sm:text-4xl text-yellow-500 mb-2" />
                                <h5 className="text-lg sm:text-xl font-semibold">Experience</h5>
                                <p className="text-xs sm:text-sm mt-4">
                                    3+ years as a Full-Stack Developer
                                </p>
                            </div>

                            {/* Education */}
                            <div className="bg-white text-center text-black flex flex-col items-center justify-center px-4 sm:px-6 py-4 rounded-lg border shadow-sm">
                                <FaGraduationCap className="text-3xl sm:text-4xl text-blue-500 mb-2" />
                                <h5 className="text-lg sm:text-xl font-semibold">Education</h5>
                                <p className="text-xs sm:text-sm mt-4">
                                    MSc in CSE (Ongoing), Dhaka University <br />
                                    BSc in CSE, BGC Trust University, 2020–2024
                                </p>
                            </div>
                        </div>

                        {/* Paragraph */}
                        <p className="text-base sm:text-lg text-gray-700">
                            Hi, I’m Avishek Devnath! I’m a CSE graduate with a BSc from BGC Trust University Bangladesh, and I’m currently pursuing an MSc at Dhaka University. I specialize in MERN Stack Development and have explored technologies like Docker, Kubernetes, and Django. I’m seeking an internship or junior full-stack web developer role. I’m a quick learner, love to learn and apply new things, and always enjoy teamwork.
                        </p>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section className="py-12 sm:py-16 flex flex-col items-center bg-white">
                <div className="text-center mb-8 sm:mb-12">
                    <h4 className="text-sm sm:text-md text-gray-600">Explore My</h4>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black">Skills</h2>
                </div>

                <div className="w-full max-w-4xl px-4 sm:px-6">
                    {/* Programming Skills */}
                    <div className="mb-8 sm:mb-12">
                        <h3 className="text-xl sm:text-2xl font-semibold text-center mb-4 sm:mb-6 flex items-center justify-center">
                            <FaCode className="text-2xl sm:text-3xl text-blue-500 mr-2" />
                            Programming Skills
                        </h3>
                        {Object.entries(programmingSkills).map(([category, skills], index) => (
                            <div key={index} className="mb-6">
                                <h4 className="text-lg sm:text-xl font-medium text-gray-700 capitalize text-center">
                                    {category.replace(/([A-Z])/g, " $1").trim()}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
                                    {skills.map((skill, skillIndex) => (
                                        <div
                                            key={skillIndex}
                                            className="flex items-center space-x-2"
                                        >
                                            <FaCheckCircle className="text-green-500" />
                                            <div>
                                                <p className="text-sm sm:text-base font-medium">{skill.name}</p>
                                                <p className="text-xs sm:text-sm text-gray-500">{skill.level}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Software Skills */}
                    <div className="mb-8 sm:mb-12">
                        <h3 className="text-xl sm:text-2xl font-semibold text-center mb-4 sm:mb-6 flex items-center justify-center">
                            <FaPaintBrush className="text-2xl sm:text-3xl text-purple-500 mr-2" />
                            Software Skills
                        </h3>
                        {Object.entries(softwareSkills).map(([category, skills], index) => (
                            <div key={index} className="mb-6">
                                <h4 className="text-lg sm:text-xl font-medium text-gray-700 capitalize text-center">
                                    {category.replace(/([A-Z])/g, " $1").trim()}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
                                    {skills.map((skill, skillIndex) => (
                                        <div
                                            key={skillIndex}
                                            className="flex items-center space-x-2"
                                        >
                                            <FaCheckCircle className="text-green-500" />
                                            <div>
                                                <p className="text-sm sm:text-base font-medium">{skill.name}</p>
                                                <p className="text-xs sm:text-sm text-gray-500">{skill.level}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Languages */}
                    <div>
                        <h3 className="text-xl sm:text-2xl font-semibold text-center mb-4 sm:mb-6 flex items-center justify-center">
                            <FaGlobe className="text-2xl sm:text-3xl text-red-500 mr-2" />
                            Languages
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                            {languages.map((lang, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <FaCheckCircle className="text-green-500" />
                                    <div>
                                        <p className="text-sm sm:text-base font-medium">{lang.name}</p>
                                        <p className="text-xs sm:text-sm text-gray-500">{lang.level}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section className="py-12 sm:py-16 flex flex-col items-center bg-gray-100">
                <div className="text-center mb-8 sm:mb-12">
                    <h4 className="text-sm sm:text-md text-gray-600">Browse My Recent</h4>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black">Projects</h2>
                </div>

                <div className="w-full max-w-[90%] sm:max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4">
                    {projectsData.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-12 sm:py-16 flex flex-col items-center bg-white">
                <div className="text-center mb-8 sm:mb-12">
                    <h4 className="text-sm sm:text-md text-gray-600">Get in Touch</h4>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black">Contact Me</h2>
                </div>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-12 sm:mb-16 px-4">
                    <a
                        href="mailto:avishekdevnath@gmail.com"
                        className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-full text-base sm:text-lg font-medium text-black hover:bg-gray-100 transition w-full sm:w-auto"
                    >
                        <FaEnvelope />
                        <span>avishekdevnath@gmail.com</span>
                    </a>
                    <a
                        href="https://www.linkedin.com/in/avishekdevnath"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-full text-base sm:text-lg font-medium text-black hover:bg-gray-100 transition w-full sm:w-auto"
                    >
                        <FaLinkedin />
                        <span>LinkedIn</span>
                    </a>
                </div>
            </section>
        </div>
    );
}