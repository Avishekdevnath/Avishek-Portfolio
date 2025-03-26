import React from "react";
import Link from "next/link";
import {
    FaCode,
    FaUsers,
    FaLightbulb,
    FaBriefcase,
    FaBuilding,
    FaEnvelope,
    FaTag,
    FaComment,
} from "react-icons/fa";

export default function HireMe() {
    const keySkills = [
        {
            icon: <FaCode className="text-4xl text-blue-500" />,
            title: "Full-Stack Development",
            description:
                "Proficient in the MERN stack (MongoDB, Express.js, React, Node.js), Next.js, and TypeScript, with experience building scalable web applications.",
        },
        {
            icon: <FaUsers className="text-4xl text-green-500" />,
            title: "Team Collaboration",
            description:
                "Strong team player with excellent communication skills, experienced in working with cross-functional teams to deliver projects on time.",
        },
        {
            icon: <FaLightbulb className="text-4xl text-yellow-500" />,
            title: "Problem Solving",
            description:
                "Adept at tackling complex challenges with innovative solutions, ensuring efficient and maintainable codebases.",
        },
    ];

    const workExperience = [
        {
            role: "Full-Stack Developer",
            company: "Tech Solutions Inc.",
            duration: "January 2022 – December 2024",
            description:
                "Developed and maintained multiple web applications using React, Node.js, and MongoDB. Collaborated with a team of 5 developers to deliver a high-traffic e-commerce platform.",
        },
        {
            role: "Junior Web Developer",
            company: "Innovate Designs",
            duration: "June 2020 – December 2021",
            description:
                "Assisted in building responsive websites using HTML, CSS, and JavaScript. Worked closely with the design team to implement UI/UX improvements.",
        },
    ];

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Hire Me Section */}
            <section className="py-16 flex flex-col items-center">
                <div className="text-center mb-12">
                    <h4 className="text-md text-gray-600">Looking for a Full-Time Role</h4>
                    <h2 className="text-5xl font-bold text-black">Hire Me</h2>
                </div>

                <div className="w-full max-w-5xl px-4">
                    {/* Introduction */}
                    <div className="text-center mb-16">
                        <p className="text-lg text-gray-700 mb-6">
                            I’m Avishek Devnath, a dedicated Full-Stack Developer with over 3 years of experience in building web applications. I’m passionate about creating impactful solutions and am eager to join a dynamic team where I can contribute to meaningful projects full-time. Let’s connect to discuss how I can add value to your organization!
                        </p>
                        <Link
                            href="/contact"
                            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Get in Touch
                        </Link>
                    </div>

                    {/* Key Skills */}
                    <div className="mb-16">
                        <h3 className="text-3xl font-semibold text-gray-800 text-center mb-8">
                            Why Hire Me?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {keySkills.map((skill, index) => (
                                <div
                                    key={index}
                                    className="flex items-center flex-col bg-white p-6 rounded-xl shadow-md text-center"
                                >
                                    <div className="mb-4">{skill.icon}</div>
                                    <h4 className="text-xl font-semibold text-gray-800 mb-2">
                                        {skill.title}
                                    </h4>
                                    <p className="text-gray-600">{skill.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Work Experience */}
                    <div className="mb-16">
                        <h3 className="text-3xl font-semibold text-gray-800 text-center mb-8">
                            Work Experience
                        </h3>
                        <div className="space-y-8">
                            {workExperience.map((exp, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-6 rounded-xl shadow-md"
                                >
                                    <div className="flex items-center space-x-3 mb-4">
                                        <FaBriefcase className="text-2xl text-gray-600" />
                                        <div>
                                            <h4 className="text-xl font-semibold text-gray-800">
                                                {exp.role}
                                            </h4>
                                            <p className="text-gray-600">{exp.company}</p>
                                            <p className="text-sm text-gray-500">{exp.duration}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Employment Inquiry Form */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-3xl font-semibold text-gray-800 text-center mb-8">
                            Interested in Hiring Me?
                        </h3>
                        <form className="space-y-6">
                            {/* Company Name */}
                            <div>
                                <label
                                    htmlFor="company"
                                    className="flex items-center space-x-2 text-lg font-medium text-gray-700"
                                >
                                    <FaBuilding />
                                    <span>Company Name</span>
                                </label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Your Company Name"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="flex items-center space-x-2 text-lg font-medium text-gray-700"
                                >
                                    <FaEnvelope />
                                    <span>Email</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="your.email@company.com"
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label
                                    htmlFor="role"
                                    className="flex items-center space-x-2 text-lg font-medium text-gray-700"
                                >
                                    <FaTag />
                                    <span>Role</span>
                                </label>
                                <input
                                    type="text"
                                    id="role"
                                    name="role"
                                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Full-Stack Developer"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label
                                    htmlFor="message"
                                    className="flex items-center space-x-2 text-lg font-medium text-gray-700"
                                >
                                    <FaComment />
                                    <span>Message</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tell me about the opportunity..."
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                            >
                                Submit Inquiry
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}