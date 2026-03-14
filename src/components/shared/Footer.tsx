"use client";

import React from 'react';
import Link from 'next/link';
import { useSettings } from '@/hooks/useSettings';
import SocialLinks from './SocialLinks';

export default function Footer() {
  const { settings } = useSettings();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: '/',        label: 'Home' },
    { href: '/about',   label: 'About' },
    { href: '/projects',label: 'Projects' },
    { href: '/blogs',   label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  const title       = settings?.websiteSettings?.title || 'Avishek Devnath';
  const description = settings?.websiteSettings?.metaDescription || 'Software Engineer · Backend & Systems';
  const email       = settings?.contactInfo?.email;

  return (
    <footer className="bg-ink text-cream">
      {/* Grain overlay */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-[1100px] mx-auto px-6 pt-14 pb-8">

          {/* ── Top row ── */}
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10 mb-12">

            {/* Brand */}
            <div>
              <Link
                href="/"
                className="font-heading text-[1.6rem] font-light text-cream hover:text-accent-orange transition-colors duration-200 leading-none block mb-3"
              >
                {title}
              </Link>
              <p className="font-body text-[0.83rem] text-[rgba(240,236,227,.45)] leading-[1.7] font-light max-w-[32ch] text-justify">
                {description}
              </p>
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="mt-4 inline-flex items-center gap-1.5 font-mono text-[0.62rem] tracking-[0.05em] text-[rgba(240,236,227,.4)] hover:text-accent-orange transition-colors duration-200"
                >
                  {email}
                </a>
              )}
            </div>

            {/* Quick links */}
            <div>
              <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[rgba(240,236,227,.35)] mb-5">
                Navigation
              </p>
              <nav className="flex flex-col gap-2.5">
                {footerLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-body text-[0.86rem] text-[rgba(240,236,227,.55)] hover:text-cream transition-colors duration-200 w-fit"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Connect */}
            <div>
              <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[rgba(240,236,227,.35)] mb-5">
                Connect
              </p>
              <SocialLinks iconClassName="w-4 h-4" />
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="h-px bg-[rgba(240,236,227,.08)] mb-7" />

          {/* ── Bottom bar ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-mono text-[0.6rem] tracking-[0.08em] text-[rgba(240,236,227,.3)]">
              © {currentYear} {title}. All rights reserved.
            </p>
            <p className="font-heading italic font-light text-[rgba(240,236,227,.22)] text-[0.88rem]">
              &ldquo;Building systems that last.&rdquo;
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
