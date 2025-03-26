// src\app\page.tsx

import About from "@/components/pages/home/About";
import Contact from "@/components/pages/home/Contact";
import Experience from "@/components/pages/home/Experience";
import Hero from "@/components/pages/home/Hero";
import Projects from "@/components/pages/home/Projects";
// import ErrorBoundary from "@/components/ErrorBoundary";
// ... other imports

export default function Home() {
  return (
    <>
    
       {/* <div className="flex flex-col "> */}
        
        {/* ok */}
        <Hero />
        <About />
        <Experience />
        <Projects />

        <Contact />
      {/* </div> */}
    
    </>
  );
}