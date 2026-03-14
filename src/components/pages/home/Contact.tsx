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
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email address";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.trim().length < 10) newErrors.message = "Message must be at least 10 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      if (!response.ok) throw new Error(data.error || 'Failed to send message');
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: MessageCategory.GENERAL, message: "" });
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase = "block w-full py-2.5 text-[0.88rem] font-body bg-cream border rounded-md transition-colors duration-200 focus:outline-none focus:ring-1 placeholder:text-text-muted/50 text-ink";
  const inputPadLeft = "!pl-10 pr-3";
  const inputNormal = "border-cream-deeper focus:border-accent-orange focus:ring-accent-orange";
  const inputError  = "border-accent-orange/60 focus:border-accent-orange focus:ring-accent-orange";

  return (
    <section id="contact" className="py-20 px-4 bg-cream">
      <div className="max-w-[1100px] mx-auto">

        {/* ── Section header ── */}
        <div className="text-center mb-12">
          <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-accent-orange opacity-50" />
            Get in Touch
            <span className="w-8 h-px bg-accent-orange opacity-50" />
          </p>
          <h2
            className="font-heading font-light text-ink leading-[1.05] mb-4"
            style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)' }}
          >
            Let&apos;s Work <em className="italic text-warm-brown">Together</em>
          </h2>
          <p className="text-[0.9rem] text-text-muted max-w-[54ch] mx-auto leading-[1.75] font-light text-justify">
            Have a project in mind or just want to chat? I&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">

          {/* ── Left: contact info + social ── */}
          <div className="flex flex-col gap-5">

            {/* Contact info card */}
            <div className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-7 py-6 hover:border-sand hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-orange rounded-l-[0.9rem]" />
              <p className="font-mono text-[0.62rem] tracking-[0.14em] uppercase text-accent-orange mb-1 flex items-center gap-2">
                <span className="w-4 h-px bg-accent-orange" />
                Contact Information
              </p>
              <p className="font-body text-[0.83rem] text-text-muted font-light mb-6 leading-[1.65] text-justify">
                Feel free to reach out through any of these channels.
              </p>
              <ContactInfo />
            </div>

            {/* Social links card */}
            <div className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-7 py-6 hover:border-sand hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-teal rounded-l-[0.9rem]" />
              <p className="font-mono text-[0.62rem] tracking-[0.14em] uppercase text-accent-teal mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-accent-teal" />
                Connect With Me
              </p>
              <SocialLinks showLabels />
            </div>
          </div>

          {/* ── Right: form ── */}
          <div className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-7 py-7 hover:border-sand hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-blue rounded-l-[0.9rem]" />

            <p className="font-mono text-[0.62rem] tracking-[0.14em] uppercase text-accent-blue mb-6 flex items-center gap-2">
              <span className="w-4 h-px bg-accent-blue" />
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
                    className={`${inputBase} ${inputPadLeft} ${errors.name ? inputError : inputNormal}`}
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
                    className={`${inputBase} ${inputPadLeft} ${errors.email ? inputError : inputNormal}`}
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
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`${inputBase} ${inputPadLeft} ${errors.subject ? inputError : inputNormal} appearance-none cursor-pointer`}
                  >
                    {Object.values(MessageCategory).map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
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
                  rows={5}
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

              {/* Status messages */}
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
    </section>
  );
}
