"use client";

import React from 'react';
import Link from 'next/link';
import { useSettings } from '@/hooks/useSettings';
import SocialLinks from './SocialLinks';

export default function Footer() {
  const { settings, loading } = useSettings();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/projects', label: 'Projects' },
    { href: '/blogs', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  // Do not render a loader for footer; show minimal footer using fallbacks
  const title = settings?.websiteSettings?.title || 'Portfolio';
  const description = settings?.websiteSettings?.metaDescription || 'Full Stack Developer';
  const email = settings?.contactInfo?.email;

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Brand and Description */}
          <div className="text-center md:text-left">
            <Link href="/" className="text-2xl font-bold text-white hover:text-orange-400 transition-colors">
              {settings?.websiteSettings?.title || 'Portfolio'}
            </Link>
            <p className="mt-2 text-gray-400">
              {settings?.websiteSettings?.metaDescription || 'Full Stack Developer'}
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <nav className="flex flex-wrap justify-center gap-4">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-orange-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold mb-4">Connect With Me</h3>
            <div className="flex justify-center md:justify-end">
              <SocialLinks iconClassName="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <p className="text-body-sm text-gray-200">
            © {currentYear} {settings?.websiteSettings?.title || 'Portfolio'}. All rights reserved.
          </p>
          {settings?.contactInfo?.email && (
            <p className="mt-2 text-body-sm text-gray-200">
              Contact me at{' '}
              <a
                href={`mailto:${settings.contactInfo.email}`}
                className="text-orange-200 hover:text-orange-100 transition-colors font-medium underline underline-offset-4"
              >
                {settings.contactInfo.email}
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
