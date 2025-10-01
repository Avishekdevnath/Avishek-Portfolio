"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ExperienceSection from "@/components/ExperienceSection";
import Stats from "@/components/pages/home/Stats";
import { useToast } from "@/context/ToastContext";
import {
    FaCode,
    FaUsers,
    FaLightbulb,
    FaBuilding,
    FaEnvelope,
    FaTag,
    FaComment,
} from "react-icons/fa";

export default function HireMe() {
    const { showToast } = useToast();
    const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "/contact";
    const formRef = useRef<HTMLFormElement>(null);

    const [form, setForm] = useState({
        company: "",
        email: "",
        role: "",
        message: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.email || !form.message) {
            showToast({
                title: "Please complete required fields",
                description: "Email and message are required.",
                status: "error",
                duration: 4000,
            });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                company: form.company,
                email: form.email,
                role: form.role,
                message: form.message,
            };

            const res = await fetch("/api/hiring-inquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error || "Failed to send");

            showToast({
                title: "Thanks!",
                description: "Your inquiry has been sent. I'll reply shortly.",
                status: "success",
                duration: 5000,
            });
            setForm({ company: "", email: "", role: "", message: "" });
            formRef.current?.reset();
        } catch (err) {
            showToast({
                title: "Could not send message",
                description: err instanceof Error ? err.message : "Please try again later",
                status: "error",
                duration: 5000,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const keySkills = [
        {
            icon: <FaCode className="text-4xl text-blue-500" />,
            title: <>Senior CS Instructor at <a href="https://phitron.io/about-us" target="_blank" rel="noopener noreferrer" style={{color: "#3B82F6", textDecoration: "none"}}>Phitron</a></>,
            description:
                <>Currently teaching at <a href="https://phitron.io/about-us" target="_blank" rel="noopener noreferrer" style={{color: "#3B82F6", textDecoration: "none"}}>Phitron</a>, covering DSA, OOP with Python, databases, Django, React, and AI/ML. Experienced mentor who has guided numerous students through their programming journey, helping them develop strong technical foundations and career paths.</>,
        },
        {
            icon: <FaUsers className="text-4xl text-green-500" />,
            title: "500+ LeetCode Problems",
            description:
                "Strong foundation in algorithms and data structures. Solved 500+ problems with expertise in system design, networking, OS, and cybersecurity.",
        },
        {
            icon: <FaLightbulb className="text-4xl text-yellow-500" />,
            title: "Open Source Contributor",
            description:
                "Created multiple Python and NPM packages, student mentorship system, and AI toolbox with comprehensive utilities for development.",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
            <div className="pt-6">
                <Header />
            </div>
            
            <main className="relative">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-7xl mx-auto">
                        {/* Page Title */}
                        <div className="text-center mb-12">
                            <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Available for Opportunities</h4>
                            <h1 className="text-h3 md:text-h2 weight-bold text-gray-900 mb-6">
                                Let's Build Something Amazing Together
                            </h1>
                            <p className="text-body-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                Senior CS Instructor at <a href="https://phitron.io/about-us" target="_blank" rel="noopener noreferrer" style={{color: "#3B82F6", textDecoration: "none"}}>Phitron</a> & Full-Stack Developer with 500+ LeetCode problems solved, extensive teaching and mentoring experience, and proven track record in building scalable applications while guiding students through their programming journey.
                    </p>
                </div>
                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                            <Link href={bookingUrl} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg border border-blue-500">
                        Book a quick intro call
                    </Link>
                            <a href="#inquiry-form" className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-inner" style={{boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'}}>
                        Send a short brief
                    </a>
                </div>

                        {/* Quick proof */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                            <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-300 shadow-inner text-center" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                                <p className="text-3xl font-bold text-gray-900 mb-2">500+</p>
                                <p className="text-caption text-gray-600">Algorithm Problems Solved</p>
                            </div>
                            <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-300 shadow-inner text-center" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                                <p className="text-3xl font-bold text-gray-900 mb-2">3+</p>
                                <p className="text-caption text-gray-600">Years Dev & Teaching</p>
                            </div>
                            <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-300 shadow-inner text-center" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                                <p className="text-3xl font-bold text-gray-900 mb-2">Senior</p>
                                <p className="text-caption text-gray-600">CS Instructor at <a href="https://phitron.io/about-us" target="_blank" rel="noopener noreferrer" style={{color: "#3B82F6", textDecoration: "none"}}>Phitron</a></p>
                            </div>
                        </div>

                    {/* Stats Section */}
                    <div className="mb-16">
                        <Stats />
                    </div>

                    {/* Key Skills */}
                    <div className="mb-16">
                            <div className="text-center mb-12">
                                <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Why Choose Me</h4>
                                <h2 className="text-h4 md:text-h3 weight-bold text-gray-900 mb-6">
                            Why Hire Me?
                                </h2>
                                <p className="text-body-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                    A unique combination of technical expertise, teaching experience, and proven problem-solving abilities.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {keySkills.map((skill, index) => (
                                    <div
                                        key={index}
                                        className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-300 shadow-inner text-center flex flex-col items-center"
                                        style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}
                                    >
                                        <div className="mb-4 flex justify-center">{skill.icon}</div>
                                        <h4 className="text-h5 weight-semibold text-gray-900 mb-3">
                                            {skill.title}
                                        </h4>
                                        <p className="text-body-sm text-gray-600 leading-relaxed">{skill.description}</p>
                                    </div>
                                ))}
                            </div>
                    </div>

                    {/* Dynamic Work Experience Section */}
                    <div className="mb-8">
                        <ExperienceSection 
                            type="work"
                            variant="detailed"
                            showFeaturedOnly={false}
                            limit={5}
                            title="Work Experience"
                                subtitle="My professional journey from Full-Stack Developer to Senior CS Instructor at Phitron, with a strong focus on mentoring students and technical excellence."
                            className="bg-transparent py-0"
                        />
                    </div>

                    {/* Education Section */}
                    <div className="mb-16">
                        <ExperienceSection 
                            type="education"
                            variant="detailed"
                            showFeaturedOnly={false}
                            limit={5}
                            title="Education"
                                subtitle="Strong academic foundation in Computer Science with ongoing advanced studies and practical application."
                            className="bg-transparent py-0"
                        />
                    </div>


                    {/* FAQ */}
                    <div className="mb-16">
                            <div className="text-center mb-12">
                                <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Common Questions</h4>
                                <h2 className="text-h4 md:text-h3 weight-bold text-gray-900 mb-6">
                                    Frequently Asked Questions
                                </h2>
                                <p className="text-body-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                    Quick answers to common questions about working together and my availability.
                                </p>
                            </div>
                        <div className="space-y-4">
                                <details className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-300 shadow-inner" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                                    <summary className="font-semibold text-gray-900 cursor-pointer text-h6">How soon can we start?</summary>
                                    <p className="text-body-sm text-gray-600 mt-3 leading-relaxed">I can typically start within 1–2 weeks depending on the project scope and current commitments. For urgent projects, we can discuss accelerated timelines.</p>
                                </details>
                                <details className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-300 shadow-inner" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                                    <summary className="font-semibold text-gray-900 cursor-pointer text-h6">What's your communication style?</summary>
                                    <p className="text-body-sm text-gray-600 mt-3 leading-relaxed">Async-first with scheduled check-ins, crisp updates, and demo-driven milestones. I provide regular progress reports and maintain clear documentation throughout the project.</p>
                            </details>
                                <details className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-300 shadow-inner" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                                    <summary className="font-semibold text-gray-900 cursor-pointer text-h6">Do you provide documentation and handover?</summary>
                                    <p className="text-body-sm text-gray-600 mt-3 leading-relaxed">Yes — comprehensive code walkthrough, README documentation, deployment guides, and handover notes are included. I also provide training sessions for your team.</p>
                            </details>
                                <details className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-300 shadow-inner" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                                    <summary className="font-semibold text-gray-900 cursor-pointer text-h6">What about mentoring and knowledge transfer?</summary>
                                    <p className="text-body-sm text-gray-600 mt-3 leading-relaxed">As a Senior CS Instructor at <a href="https://phitron.io/about-us" target="_blank" rel="noopener noreferrer" style={{color: "#3B82F6", textDecoration: "none"}}>Phitron</a>, I specialize in knowledge transfer and student mentorship. I provide detailed explanations, code reviews, and can conduct training sessions for your development team. My mentoring experience includes guiding students through complex programming concepts and career development.</p>
                            </details>
                        </div>
                    </div>

                    {/* Employment Inquiry Form */}
                        <div id="inquiry-form" className="bg-gradient-to-b from-gray-50 to-white p-8 rounded-2xl border border-gray-300 shadow-inner" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                            <div className="text-center mb-8">
                                <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Get in Touch</h4>
                                <h3 className="text-h4 md:text-h3 weight-bold text-gray-900 mb-6">
                            Interested in Hiring Me?
                        </h3>
                                <p className="text-body-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                    Ready to discuss opportunities? Send me a message with details about the role and I'll get back to you promptly.
                                </p>
                            </div>
                        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                            {/* Company Name */}
                            <div>
                                <label
                                    htmlFor="company"
                                        className="flex items-center space-x-2 text-caption font-medium text-gray-700 mb-2"
                                >
                                    <FaBuilding className="text-gray-500" />
                                    <span>Company Name</span>
                                </label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    value={form.company}
                                    onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                    placeholder="Your Company Name"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                        className="flex items-center space-x-2 text-caption font-medium text-gray-700 mb-2"
                                >
                                    <FaEnvelope className="text-gray-500" />
                                    <span>Email</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                    placeholder="your.email@company.com"
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label
                                    htmlFor="role"
                                        className="flex items-center space-x-2 text-caption font-medium text-gray-700 mb-2"
                                >
                                    <FaTag className="text-gray-500" />
                                    <span>Role</span>
                                </label>
                                <input
                                    type="text"
                                    id="role"
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                        placeholder="e.g., Senior Full-Stack Developer"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label
                                    htmlFor="message"
                                        className="flex items-center space-x-2 text-caption font-medium text-gray-700 mb-2"
                                >
                                    <FaComment className="text-gray-500" />
                                    <span>Message</span>
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    value={form.message}
                                    onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                        placeholder="Tell me about the opportunity, role requirements, and what you're looking for..."
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                    className={`w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg border border-blue-500 transition-all duration-300 ${submitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
                            >
                                {submitting ? "Sending..." : "Submit Inquiry"}
                            </button>
                        </form>
                    </div>
                </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}