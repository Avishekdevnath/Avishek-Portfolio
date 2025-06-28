"use client";

import type React from "react";
import { useState, useRef } from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { useToast } from "@/context/ToastContext";
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

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
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

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

      if (data.success) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
        toast({
          title: "Message sent successfully!",
          description: "I'll get back to you as soon as possible.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      setSubmitStatus("error");
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "Please try again later",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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

  const resetForm = () => {
    setFormData({ name: "", email: "", subject: "", message: "" });
    setErrors({});
    setSubmitStatus("idle");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 bg-opacity-10">
      <div className="pt-6">
        {" "}
        <Header />
      </div>

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
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Let's Talk
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                I'm always open to discussing new opportunities, creative
                projects, or just having a friendly conversation about
                technology and development.
              </p>
            </div>

            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-white bg-opacity-80 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-orange-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-orange-500 text-xl">{info.icon}</div>
                    {info.copyable && (
                      <button
                        onClick={() => copyToClipboard(info.value, info.label)}
                        className="text-gray-400 hover:text-orange-500 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedField === info.label ? (
                          <FaCheckCircle className="text-green-500" />
                        ) : (
                          <FaCopy />
                        )}
                      </button>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {info.label}
                  </h3>
                  <a
                    href={info.link}
                    className="text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    {info.value}
                  </a>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Follow Me
              </h3>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${social.color} text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg opacity-90 hover:opacity-100`}
                    title={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Response Promise */}
            <div className="bg-[#FFE4CC] text-[#FF8C00] bg-opacity-30  p-6 rounded-xl">
              <div className="flex items-center mb-3">
                <Clock className="mr-3" />
                <h3 className="font-semibold">Quick Response Guarantee</h3>
              </div>
              <p className="text-gray-600">
                I typically respond to all messages within 24 hours. For urgent
                matters, feel free to call directly.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-orange-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Send a Message
              </h2>
              <p className="text-gray-600">
                Fill out the form below and I'll get back to you soon.
              </p>
            </div>

            {submitStatus === "success" && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <FaCheckCircle className="text-green-500 mr-3" />
                <div>
                  <p className="text-green-800 font-medium">
                    Message sent successfully!
                  </p>
                  <p className="text-green-600 text-sm">
                    I'll get back to you within 24 hours.
                  </p>
                </div>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <FaExclamationTriangle className="text-red-500 mr-3" />
                <div>
                  <p className="text-red-800 font-medium">
                    Failed to send message
                  </p>
                  <p className="text-red-600 text-sm">
                    Please try again or contact me directly.
                  </p>
                </div>
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <User className="inline w-4 h-4 mr-1" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${
                    errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Mail className="inline w-4 h-4 mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${
                    errors.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Subject Field */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <MessageSquare className="inline w-4 h-4 mr-1" />
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${
                    errors.subject
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="What's this about?"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <MessageSquare className="inline w-4 h-4 mr-1" />
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none ${
                    errors.message
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Tell me about your project or just say hello..."
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.message ? (
                    <p className="text-sm text-red-600 flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      {errors.message}
                    </p>
                  ) : (
                    <div></div>
                  )}
                  <span className="text-sm text-gray-500">
                    {formData.message.length}/500
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#FFE4CC] text-[#FF8C00] border border-[#FF8C00] py-3 px-6 rounded-full font-medium hover:bg-[#FFCC99] hover:border-[#FF7000] focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF8C00] mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>

                {(Object.keys(formData).some(
                  (key) => formData[key as keyof FormData] !== ""
                ) ||
                  submitStatus !== "idle") && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
