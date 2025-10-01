"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Send, User, Mail, MessageSquare } from "lucide-react";
import { MessageCategory } from '@/types/message';
import ContactInfo from "@/components/shared/ContactInfo";
import SocialLinks from "@/components/shared/SocialLinks";

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
  const formRef = useRef<HTMLFormElement>(null);

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

  return (
    <section id="contact" className="py-16 bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Get in Touch</h4>
          <h2 className="text-h3 md:text-h2 weight-bold text-gray-900 mb-6">
            Let's Work Together
          </h2>
          <p className="text-body-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Have a project in mind or just want to chat? I'd love to hear from you.
            Let's create something amazing together!
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-h5 weight-semibold text-gray-900 mb-3">
                Contact Information
              </h3>
              <p className="text-body-sm text-gray-600 mb-6 leading-relaxed">
                Feel free to reach out through any of these channels. I'm always excited
                to connect and discuss new opportunities.
              </p>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 shadow-inner p-8" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
              <ContactInfo />
            </div>

            {/* Social Links */}
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 shadow-inner p-8" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
              <h3 className="text-h5 weight-semibold text-gray-900 mb-5">Connect With Me</h3>
              <SocialLinks showLabels />
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 shadow-inner p-8" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
            <h3 className="text-h5 weight-semibold text-gray-900 mb-5">Send a Message</h3>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-caption mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full !pl-12 pr-3 py-2.5 text-sm border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-caption mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full !pl-12 pr-3 py-2.5 text-sm border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-caption mb-2">
                  Subject
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`block w-full !pl-12 pr-3 py-2.5 text-sm border ${
                      errors.subject ? "border-red-500" : "border-gray-300"
                    } bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  >
                    {Object.values(MessageCategory).map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-caption mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className={`block w-full px-3 py-2.5 text-sm border ${
                    errors.message ? "border-red-500" : "border-gray-300"
                  } bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Tell me about your project, ideas, or questions..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-button shadow-lg border border-blue-500
                  ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}
                  transition-all duration-300`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              {submitStatus === "success" && (
                <div className="mt-4 p-4 bg-gradient-to-b from-green-50 to-white border border-green-200 rounded-xl shadow-inner" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-green-700 font-medium">Message sent successfully! I'll get back to you soon.</p>
                  </div>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mt-4 p-4 bg-gradient-to-b from-red-50 to-white border border-red-200 rounded-xl shadow-inner" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-red-700 font-medium">Failed to send message. Please try again.</p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
