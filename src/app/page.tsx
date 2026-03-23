// src\app\page.tsx

import type { Metadata } from 'next';

import About from "@/components/pages/home/About";
import Contact from "@/components/pages/home/Contact";
import Hero from "@/components/pages/home/Hero";
import Projects from "@/components/pages/home/Projects";
import Skills from "@/components/pages/home/Skills";
import Stats from "@/components/pages/home/Stats";
import Footer from "@/components/shared/Footer";
import HomePageReady from "@/components/shared/HomePageReady";
import { getSiteUrl } from '@/lib/url';
// import ErrorBoundary from "@/components/ErrorBoundary";
// ... other imports

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Avishek Devnath | Software Engineer',
  description:
    'Official portfolio of Avishek Devnath — software engineer focused on backend systems, APIs, and scalable architecture.',
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Avishek Devnath',
    url: siteUrl,
    image: `${siteUrl}/assets/home/profile-img.jpg`,
    jobTitle: 'Software Engineer',
    sameAs: [
      'https://github.com/Avishekdevnath',
      'https://www.linkedin.com/in/avishek-devnath/',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <HomePageReady />
      <Hero />
        <About />
        <Skills />
        <Projects />
        <Stats />
        <Contact />
        <Footer />
    </>
  );
}