"use client";

import type React from "react";
import { useState, useRef } from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { useToast } from "@/context/ToastContext";
import { Send, User, Mail, MessageSquare } from "lucide-react";
import ContactInfo from "@/components/shared/ContactInfo";
import SocialLinks from "@/components/shared/SocialLinks";

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
  const { showToast } = useToast();
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
        showToast({
          title: "Message sent successfully!",
          description: "I'll get back to you as soon as possible.",
          status: "success",
          duration: 5000
        });
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      setSubmitStatus("error");
      showToast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "Please try again later",
        status: "error",
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Let's Connect</h4>
              <h1 className="text-h3 md:text-h2 weight-bold text-gray-900 mb-6">
                Get in Touch
              </h1>
              <p className="text-body-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Have a project in mind or just want to chat? I'd love to hear from you. Let's create something amazing together! Use the form below or connect with me through social media.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-h5 weight-semibold text-gray-900 mb-5">
                    Let's Talk
                  </h2>
                  <p className="text-body-sm text-gray-600 leading-relaxed mb-6">
                    I'm always open to discussing new opportunities, creative
                    projects, or just having a friendly conversation about
                    technology and development.
                  </p>
                </div>

                {/* Contact Info Cards */}
                <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 p-8 shadow-inner" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                  <ContactInfo />
                </div>

                {/* Social Links */}
                <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 p-8 shadow-inner" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                  <h3 className="text-h5 weight-semibold text-gray-900 mb-5">Connect With Me</h3>
                  <SocialLinks showLabels />
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 p-8 shadow-inner" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                <h2 className="text-h5 weight-semibold text-gray-900 mb-6">Send a Message</h2>
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 text-caption mb-2 font-medium">
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
                        className={`block w-full !pl-10 pr-3 py-2.5 text-sm border ${
                          errors.name ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300`}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-caption mb-2 font-medium">
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
                        className={`block w-full !pl-10 pr-3 py-2.5 text-sm border ${
                          errors.email ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300`}
                        placeholder="john@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-caption mb-2 font-medium">
                      Subject
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={`block w-full !pl-10 pr-3 py-2.5 text-sm border ${
                          errors.subject ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300`}
                        placeholder="What's this about?"
                      />
                    </div>
                    {errors.subject && (
                      <p className="mt-1 text-xs text-red-500">{errors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-caption mb-2 font-medium">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className={`block w-full px-3 py-2.5 text-sm border ${
                        errors.message ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300`}
                      placeholder="Tell me about your project, ideas, or questions..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-red-500">{errors.message}</p>
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  {submitStatus === "success" && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Message sent successfully! I'll get back to you soon.</span>
                      </div>
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">Failed to send message. Please try again.</span>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
