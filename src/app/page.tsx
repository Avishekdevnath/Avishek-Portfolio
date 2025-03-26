import About from "@/components/pages/home/About";
import Contact from "@/components/pages/home/Contact";
import Experience from "@/components/pages/home/Experience";
import Hero from "@/components/pages/home/Hero";
import Projects from "@/components/pages/home/Projects";

export default function Home() {
  return (
    <>
      <div>
        {/* <p>This is home page</p> */}
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Contact />
      </div>
    </>
  );
}
