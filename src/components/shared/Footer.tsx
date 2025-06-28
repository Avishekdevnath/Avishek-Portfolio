"use client";

import React from 'react';
import Link from 'next/link';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { footerConfig } from '@/config/footer';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { about, navigationLinks, quickLinks, socialLinks, contactInfo, legal } = footerConfig;

  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
            <p className="text-gray-600 mb-4">{about.description}</p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h3>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <FiMail className="w-5 h-5 mr-2" />
                  <span>{contactInfo.email}</span>
                </a>
              </li>
              <li>
                <a 
                  href={`tel:${contactInfo.phone}`}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <FiPhone className="w-5 h-5 mr-2" />
                  <span>{contactInfo.phone}</span>
                </a>
              </li>
              <li className="flex items-center text-gray-600">
                <FiMapPin className="w-5 h-5 mr-2" />
                <span>{contactInfo.location}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © {currentYear} {legal.name}. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              {legal.links.map((link) => (
                <Link 
                  key={link.label}
                  href={link.href} 
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
