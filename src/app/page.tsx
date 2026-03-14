// src\app\page.tsx

import About from "@/components/pages/home/About";
import Contact from "@/components/pages/home/Contact";
import Hero from "@/components/pages/home/Hero";
import Projects from "@/components/pages/home/Projects";
import Skills from "@/components/pages/home/Skills";
import Stats from "@/components/pages/home/Stats";
import Footer from "@/components/shared/Footer";
import HomePageReady from "@/components/shared/HomePageReady";
// import ErrorBoundary from "@/components/ErrorBoundary";
// ... other imports

export default function Home() {
  return (
    <>
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