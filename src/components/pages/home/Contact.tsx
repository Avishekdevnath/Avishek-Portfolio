"use client";

import type React from "react";
import { useState, useRef } from "react";
import Header from "@/components/shared/Header";
import {
  FaEnvelope,
  FaLinkedin,
  FaPhone,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCopy,
  FaGithub,
  FaTwitter,
} from "react-icons/fa";
import { Send, User, Mail, MessageSquare, Clock } from "lucide-react";
import { MessageCategory } from '@/models/Message';

interface FormData {
  name: string;
  email: string;
  subject: MessageCategory;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: MessageCategory.GENERAL,
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const contactInfo = [
    {
      icon: <FaEnvelope />,
      label: "Email",
      value: "avishek@example.com",
      link: "mailto:avishek@example.com",
      copyable: true,
    },
    {
      icon: <FaPhone />,
      label: "Phone",
      value: "+1 (555) 123-4567",
      link: "tel:+15551234567",
      copyable: true,
    },
    {
      icon: <FaMapMarkerAlt />,
      label: "Location",
      value: "Dhaka, Bangladesh",
      link: "#",
      copyable: false,
    },
    {
      icon: <Clock />,
      label: "Response Time",
      value: "Within 24 hours",
      link: "#",
      copyable: false,
    },
  ];

  const socialLinks = [
    {
      icon: <FaLinkedin />,
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/yourprofile",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      icon: <FaGithub />,
      label: "GitHub",
      url: "https://github.com/yourprofile",
      color: "bg-gray-800 hover:bg-gray-900",
    },
    {
      icon: <FaTwitter />,
      label: "Twitter",
      url: "https://twitter.com/yourprofile",
      color: "bg-orange-400 hover:bg-orange-500",
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: MessageCategory.GENERAL,
        message: "",
      });

      // Scroll to top of form
      formRef.current?.scrollIntoView({ behavior: 'smooth' });

      // Reset form after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      setSubmitStatus("error");
      
      // Reset error state after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 bg-opacity-10">
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-4 bg-opacity-70">
            Let's Connect
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have a project in mind or just want to chat? I'd love to hear from
            you. Let's create something amazing together!
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                      {item.icon}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <div className="flex items-center space-x-2">
                        <a
                          href={item.link}
                          className="text-gray-900 font-medium hover:text-orange-600"
                        >
                          {item.value}
                        </a>
                        {item.copyable && (
                          <button
                            onClick={() => copyToClipboard(item.value, item.label)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {copiedField === item.label ? (
                              <FaCheckCircle className="text-green-500" />
                            ) : (
                              <FaCopy />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect with me</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${social.color}`}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Message</h2>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                  }`}
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                >
                  {Object.values(MessageCategory).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.message
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                  }`}
                  placeholder="Your message here..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send size={20} />
                      <span>Send Message</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Status Messages */}
        {submitStatus !== "idle" && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
              submitStatus === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {submitStatus === "success" ? (
                <>
                  <FaCheckCircle className="text-green-500" />
                  <span>Message sent successfully! I'll get back to you soon.</span>
                </>
              ) : (
                <>
                  <FaExclamationTriangle className="text-red-500" />
                  <span>Failed to send message. Please try again later.</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
