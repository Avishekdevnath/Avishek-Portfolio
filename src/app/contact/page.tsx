"use client";

import type React from "react";
import { useState, useRef } from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { useToast } from "@/context/ToastContext";
import { Send, User, Mail, MessageSquare } from "lucide-react";
import ContactInfo from "@/components/shared/ContactInfo";
import SocialLinks from "@/components/shared/SocialLinks";
import PageReadyOnMount from "@/components/shared/PageReadyOnMount";

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
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email address";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    else if (formData.subject.trim().length < 5) newErrors.subject = "Subject must be at least 5 characters";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.trim().length < 10) newErrors.message = "Message must be at least 10 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitStatus("idle");
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
        showToast({ title: "Message sent!", description: "I'll get back to you within 24 hours.", status: "success", duration: 5000 });
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      setSubmitStatus("error");
      showToast({ title: "Failed to send", description: error instanceof Error ? error.message : "Please try again later", status: "error", duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = "block w-full py-2.5 text-[0.88rem] font-body bg-cream border rounded-md transition-colors duration-200 focus:outline-none focus:ring-1 placeholder:text-text-muted/50 text-ink";
  const inputNormal = "border-cream-deeper focus:border-accent-orange focus:ring-accent-orange";
  const inputError  = "border-accent-orange/60 focus:border-accent-orange focus:ring-accent-orange";

  return (
    <div className="min-h-screen bg-cream font-body">
      <PageReadyOnMount />
      <div className="pt-6">
        <Header />
      </div>

      <main>
        <div className="max-w-[1100px] mx-auto px-4 py-16">

          {/* ── Page header ── */}
          <div className="text-center mb-12">
            <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-accent-orange opacity-50" />
              Let&apos;s Connect
              <span className="w-8 h-px bg-accent-orange opacity-50" />
            </p>
            <h1
              className="font-heading font-light text-ink mb-4 leading-[1.05]"
              style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)' }}
            >
              Get in <em className="italic text-warm-brown">Touch</em>
            </h1>
            <p className="font-body text-[0.9rem] text-text-muted max-w-[55ch] mx-auto leading-[1.7] font-light text-justify">
              Have a project in mind or just want to chat? I&apos;d love to hear from you.
              Use the form below or reach me through any of the channels listed.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-6">

            {/* ── Left col ── */}
            <div className="flex flex-col gap-5">

              {/* Intro blurb */}
              <div className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-7 py-6 overflow-hidden hover:border-sand hover:shadow-md transition-all duration-300">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-orange rounded-l-[0.9rem]" />
                <p className="font-mono text-[0.62rem] tracking-[0.14em] uppercase text-accent-orange mb-1 flex items-center gap-2">
                  <span className="w-4 h-px bg-accent-orange" />
                  Let&apos;s Talk
                </p>
                <p className="font-body text-[0.86rem] text-warm-brown font-light leading-[1.75] mt-3 text-justify">
                  I&apos;m always open to discussing new opportunities, creative projects, or
                  just having a friendly conversation about technology and development.
                </p>
              </div>

              {/* Contact info */}
              <div className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-7 py-6 overflow-hidden hover:border-sand hover:shadow-md transition-all duration-300">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-teal rounded-l-[0.9rem]" />
                <p className="font-mono text-[0.62rem] tracking-[0.14em] uppercase text-accent-teal mb-5 flex items-center gap-2">
                  <span className="w-4 h-px bg-accent-teal" />
                  Contact Information
                </p>
                <ContactInfo />
              </div>

              {/* Social links */}
              <div className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-7 py-6 overflow-hidden hover:border-sand hover:shadow-md transition-all duration-300">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-blue rounded-l-[0.9rem]" />
                <p className="font-mono text-[0.62rem] tracking-[0.14em] uppercase text-accent-blue mb-5 flex items-center gap-2">
                  <span className="w-4 h-px bg-accent-blue" />
                  Connect With Me
                </p>
                <SocialLinks showLabels />
              </div>
            </div>

            {/* ── Right col: form ── */}
            <div className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-7 py-7 overflow-hidden hover:border-sand hover:shadow-md transition-all duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#c4841a] rounded-l-[0.9rem]" />

              <p className="font-mono text-[0.62rem] tracking-[0.14em] uppercase text-[#c4841a] mb-6 flex items-center gap-2">
                <span className="w-4 h-px bg-[#c4841a]" />
                Send a Message
              </p>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

                {/* Name */}
                <div>
                  <label className="block font-mono text-[0.65rem] tracking-[0.08em] uppercase text-warm-brown mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Avishek Devnath"
                      className={`${inputBase} !pl-10 pr-3 ${errors.name ? inputError : inputNormal}`}
                    />
                  </div>
                  {errors.name && <p className="mt-1 font-body text-[0.75rem] text-accent-orange">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block font-mono text-[0.65rem] tracking-[0.08em] text-warm-brown mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className={`${inputBase} !pl-10 pr-3 ${errors.email ? inputError : inputNormal}`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 font-body text-[0.75rem] text-accent-orange">{errors.email}</p>}
                </div>

                {/* Subject */}
                <div>
                  <label className="block font-mono text-[0.65rem] tracking-[0.08em] uppercase text-warm-brown mb-1.5">
                    Subject
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What's this about?"
                      className={`${inputBase} !pl-10 pr-3 ${errors.subject ? inputError : inputNormal}`}
                    />
                  </div>
                  {errors.subject && <p className="mt-1 font-body text-[0.75rem] text-accent-orange">{errors.subject}</p>}
                </div>

                {/* Message */}
                <div>
                  <label className="block font-mono text-[0.65rem] tracking-[0.08em] uppercase text-warm-brown mb-1.5">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Tell me about your project, ideas, or questions…"
                    className={`${inputBase} px-3 resize-none ${errors.message ? inputError : inputNormal}`}
                  />
                  {errors.message && <p className="mt-1 font-body text-[0.75rem] text-accent-orange">{errors.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2.5 font-body bg-ink text-off-white px-6 py-3 rounded-md text-[0.83rem] font-medium tracking-wide border-[1.5px] border-ink transition-all duration-250
                    ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-accent-orange hover:border-accent-orange'}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-off-white/30 border-t-off-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>

                {/* Status */}
                {submitStatus === "success" && (
                  <div className="flex items-center gap-3 bg-accent-teal/8 border border-accent-teal/25 rounded-lg px-4 py-3">
                    <span className="w-2 h-2 rounded-full bg-accent-teal shrink-0" />
                    <p className="font-body text-[0.83rem] text-accent-teal font-medium">
                      Message sent! I&apos;ll get back to you within 24 hours.
                    </p>
                  </div>
                )}
                {submitStatus === "error" && (
                  <div className="flex items-center gap-3 bg-accent-orange/8 border border-accent-orange/25 rounded-lg px-4 py-3">
                    <span className="w-2 h-2 rounded-full bg-accent-orange shrink-0" />
                    <p className="font-body text-[0.83rem] text-accent-orange font-medium">
                      Failed to send. Please try again or email me directly.
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
