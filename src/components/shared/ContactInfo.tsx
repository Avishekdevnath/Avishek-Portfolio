"use client";

import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaCopy } from 'react-icons/fa';
import { Clock } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

interface ContactInfoProps {
  showCopyButton?: boolean;
  className?: string;
}

export default function ContactInfo({ showCopyButton = true, className = '' }: ContactInfoProps) {
  const { settings, loading } = useSettings();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const contactInfo = settings?.contactInfo ? [
    {
      icon: <FaEnvelope className="w-5 h-5" />,
      label: "Email",
      value: settings.contactInfo.email,
      link: `mailto:${settings.contactInfo.email}`,
      copyable: true,
    },
    {
      icon: <FaPhone className="w-5 h-5" />,
      label: "Phone",
      value: settings.contactInfo.phone,
      link: `tel:${settings.contactInfo.phone.replace(/\D/g, '')}`,
      copyable: true,
    },
    {
      icon: <FaMapMarkerAlt className="w-5 h-5" />,
      label: "Location",
      value: settings.contactInfo.location,
      link: `https://www.google.com/maps/search/${encodeURIComponent(settings.contactInfo.location)}`,
      copyable: false,
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Response Time",
      value: settings.contactInfo.responseTime,
      link: "#",
      copyable: false,
    },
  ] : [];

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (loading || !settings) {
    return (
      <div className={`space-y-4 animate-pulse ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
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
                target={item.link.startsWith('http') ? '_blank' : undefined}
                rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {item.value}
              </a>
              {showCopyButton && item.copyable && (
                <button
                  onClick={() => copyToClipboard(item.value, item.label)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  title={copiedField === item.label ? 'Copied!' : 'Copy to clipboard'}
                >
                  {copiedField === item.label ? (
                    <FaCheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <FaCopy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 