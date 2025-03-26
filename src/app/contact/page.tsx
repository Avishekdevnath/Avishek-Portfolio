import React from "react";
import {
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaLinkedin,
    FaGithub,
    FaTwitter,
    FaInstagram,
    FaUser,
    FaTag,
    FaComment,
} from "react-icons/fa";

export default function Contact() {
    const contactDetails = [
        {
            icon: <FaEnvelope className="text-2xl text-blue-500" />,
            label: "Email",
            value: "avishekdevnath@gmail.com",
            href: "mailto:avishekdevnath@gmail.com",
        },
        {
            icon: <FaPhone className="text-2xl text-green-500" />,
            label: "Phone",
            value: "+880 123 456 7890",
            href: "tel:+8801234567890",
        },
        {
            icon: <FaMapMarkerAlt className="text-2xl text-red-500" />,
            label: "Location",
            value: "Dhaka, Bangladesh",
            href: "https://maps.google.com/?q=Dhaka,Bangladesh",
        },
    ];

    const socialMedia = [
        {
            icon: <FaLinkedin className="text-2xl text-blue-700" />,
            label: "LinkedIn",
            href: "https://www.linkedin.com/in/avishekdevnath",
        },
        {
            icon: <FaGithub className="text-2xl text-gray-800" />,
            label: "GitHub",
            href: "https://github.com/avishekdevnath",
        },
        {
            icon: <FaTwitter className="text-2xl text-blue-400" />,
            label: "Twitter",
            href: "https://twitter.com/avishekdevnath",
        },
        {
            icon: <FaInstagram className="text-2xl text-pink-500" />,
            label: "Instagram",
            href: "https://instagram.com/avishekdevnath",
        },
    ];

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Contact Section */}
            <section className="py-16 flex flex-col items-center">
                <div className="text-center mb-12">
                    <h4 className="text-md text-gray-600">Get in Touch</h4>
                    <h2 className="text-5xl font-bold text-black">Contact Me</h2>
                </div>

                <div className="w-full max-w-5xl px-4">
                    {/* Introduction */}
                    <p className="text-lg text-gray-700 text-center mb-12">
                        I’d love to hear from you! Whether you have a project idea, a question, or just want to say hello, feel free to reach out using the form below or through my contact details.
                    </p>

                    {/* Contact Details and Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Contact Details and Social Media */}
                        <div className="space-y-8">
                            {/* Contact Details */}
                            <div>
                                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                                    Contact Details
                                </h3>
                                <div className="space-y-4">
                                    {contactDetails.map((detail, index) => (
                                        <a
                                            key={index}
                                            href={detail.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition"
                                        >
                                            {detail.icon}
                                            <div>
                                                <p className="text-lg font-medium">{detail.label}</p>
                                                <p className="text-sm">{detail.value}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Social Media */}
                            <div>
                                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                                    Follow Me
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    {socialMedia.map((social, index) => (
                                        <a
                                            key={index}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition"
                                        >
                                            {social.icon}
                                            <span>{social.label}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                                Send a Message
                            </h3>
                            <form className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="flex items-center space-x-2 text-lg font-medium text-gray-700"
                                    >
                                        <FaUser />
                                        <span>Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Your Name"
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
                                        placeholder="your.email@example.com"
                                    />
                                </div>

                                {/* Subject */}
                                <div>
                                    <label
                                        htmlFor="subject"
                                        className="flex items-center space-x-2 text-lg font-medium text-gray-700"
                                    >
                                        <FaTag />
                                        <span>Subject</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Subject of your message"
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
                                        placeholder="Your message here..."
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}