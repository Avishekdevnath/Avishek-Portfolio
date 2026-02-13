import React, { useState, useEffect, useRef } from 'react';
import { 
  Server, 
  Database, 
  Code2, 
  GraduationCap, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Cpu, 
  Layers, 
  ShieldCheck,
  ChevronRight,
  Terminal
} from 'lucide-react';

/**
 * MOCK DATA & COMPONENTS
 * Since the original code relies on external imports, 
 * I am rebuilding the structure here to ensure the preview is fully functional.
 */

const PROJECTS_MOCK = [
  {
    id: 1,
    title: "Multi-tenant CRM",
    description: "Architected a scalable CRM system handling complex data isolation and high-concurrency background processing.",
    tags: ["Node.js", "PostgreSQL", "Redis"],
    type: "Backend Architecture"
  },
  {
    id: 2,
    title: "Biometric Consent System",
    description: "Developed an offline-first biometric system with privacy-focused data modeling and encrypted local storage.",
    tags: ["Python", "SQLite", "Cryptography"],
    type: "System Security"
  },
  {
    id: 3,
    title: "Student Management API",
    description: "Designed a role-based access control (RBAC) system for educational institutions with granular permissions.",
    tags: ["Go", "MongoDB", "Docker"],
    type: "API Design"
  }
];

const EXPERIENCE_MOCK = [
  {
    role: "Senior CS Instructor",
    company: "Phitron",
    period: "Present",
    desc: "Teaching core computer science fundamentals and system design to 10k+ students."
  },
  {
    role: "Software Engineer (Backend)",
    company: "Tech Solutions Inc.",
    period: "2022 - 2024",
    desc: "Owned migration of legacy monolith to microservices, reducing latency by 40%."
  }
];

const App = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans selection:bg-blue-100">
      
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-stone-200 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
              <Terminal size={18} />
            </div>
            <span className="font-mono font-bold tracking-tighter">AVISHEK.DEV</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#experience" className="hover:text-blue-600 transition-colors">Experience</a>
            <a href="#skills" className="hover:text-blue-600 transition-colors">Skills</a>
            <a href="#projects" className="hover:text-blue-600 transition-colors">Projects</a>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-full text-xs hover:bg-blue-600 transition-all">
              Resume.pdf
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        
        {/* Title Section */}
        <header className={`mb-12 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full border border-blue-100">
              System Architect & Educator
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
            Avishek <span className="text-slate-400">Devnath</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
            I design and maintain <span className="text-slate-900 font-medium italic underline decoration-blue-200 decoration-4 underline-offset-4">robust backend systems</span> under real operational constraints. Currently pursuing MSc at University of Dhaka.
          </p>
        </header>

        {/* Bento Grid Intro */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
          
          {/* Main Bio Card */}
          <div className="md:col-span-3 bg-white border border-stone-200 rounded-[2rem] p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
              <Cpu size={200} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl relative grayscale hover:grayscale-0 transition-all duration-700 object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Engineering for Ownership</h3>
                <div className="space-y-4 text-slate-600 leading-relaxed">
                  <p>
                    My work centers on owning system design decisions across APIs, data models, and background processing. I focus on the architecture and long-term maintainability—not just implementation.
                  </p>
                  <p>
                    Alongside engineering, I serve as a Senior CS Instructor at Phitron, where I sharpen my fundamentals by breaking down complex systems for thousands of students.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Info - Education */}
          <div className="bg-blue-600 rounded-[2rem] p-8 text-white flex flex-col justify-between shadow-lg shadow-blue-100">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-blue-100 text-xs font-mono uppercase tracking-widest mb-2">Research</p>
              <h4 className="font-bold text-lg leading-tight">MSc in Computer Science</h4>
              <p className="text-blue-100/80 text-sm mt-2">University of Dhaka. Specialized in Security & Applied AI.</p>
            </div>
          </div>
        </section>

        {/* Technical Pillars (The Stats Row) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {[
            { label: "Architecture", icon: <Layers size={20} />, color: "bg-orange-50 text-orange-600" },
            { label: "Database Design", icon: <Database size={20} />, color: "bg-blue-50 text-blue-600" },
            { label: "Security", icon: <ShieldCheck size={20} />, color: "bg-green-50 text-green-600" },
            { label: "Teaching", icon: <Code2 size={20} />, color: "bg-purple-50 text-purple-600" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-5 bg-white border border-stone-200 rounded-2xl shadow-sm hover:border-blue-200 transition-colors group">
              <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${item.color}`}>{item.icon}</div>
              <span className="font-bold text-slate-700 text-sm">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Two Column Section: Experience & Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          
          {/* Experience Timeline */}
          <section id="experience">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-bold">Experience</h2>
              <div className="h-px flex-1 bg-stone-200"></div>
            </div>
            <div className="space-y-8">
              {EXPERIENCE_MOCK.map((exp, i) => (
                <div key={i} className="relative pl-8 border-l border-stone-200 group">
                  <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-stone-300 group-hover:bg-blue-600 transition-colors"></div>
                  <p className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest mb-1">{exp.period}</p>
                  <h4 className="font-bold text-slate-900">{exp.role}</h4>
                  <p className="text-sm text-slate-500 font-medium mb-3">{exp.company}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{exp.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Skills Categorized */}
          <section id="skills">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-bold">Technical Stack</h2>
              <div className="h-px flex-1 bg-stone-200"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h5 className="text-xs font-mono font-bold text-slate-400 uppercase mb-4 tracking-widest">Backend Layers</h5>
                <ul className="space-y-3">
                  {['Node.js / Express', 'Python / Django', 'Go (Golang)', 'REST & GraphQL APIs'].map(skill => (
                    <li key={skill} className="flex items-center gap-2 text-sm text-slate-700">
                      <ChevronRight size={14} className="text-blue-500" /> {skill}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-mono font-bold text-slate-400 uppercase mb-4 tracking-widest">Infrastructure</h5>
                <ul className="space-y-3">
                  {['PostgreSQL / MongoDB', 'Redis / Caching', 'Docker & K8s', 'AWS / System Design'].map(skill => (
                    <li key={skill} className="flex items-center gap-2 text-sm text-slate-700">
                      <ChevronRight size={14} className="text-blue-500" /> {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Projects Section */}
        <section id="projects" className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Shipped & Maintained</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Selected systems where I owned the backend architecture and data lifecycle.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROJECTS_MOCK.map((project) => (
              <div key={project.id} className="bg-white border border-stone-200 rounded-3xl p-6 hover:shadow-xl hover:border-blue-100 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Server size={20} />
                  </div>
                  <ExternalLink size={18} className="text-slate-300 group-hover:text-blue-400 transition-colors cursor-pointer" />
                </div>
                <h4 className="font-bold text-lg mb-2">{project.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-mono px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          </div>
          <h2 className="text-3xl font-bold mb-6">Let's talk system design.</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
            Whether it's a collaborative engineering role or a question about CS fundamentals, I'm always open to technical discussions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:avishekdevnath@gmail.com" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all w-full sm:w-auto">
              <Mail size={18} />
              avishekdevnath@gmail.com
            </a>
            <a href="#" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl font-bold transition-all w-full sm:w-auto">
              <Linkedin size={18} />
              LinkedIn
            </a>
          </div>
        </section>

      </main>

      <footer className="border-t border-stone-200 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm font-mono">
            &copy; {new Date().getFullYear()} AVISHEK_DEVNATH. v2.0
          </p>
          <div className="flex items-center gap-6 text-slate-400">
            <a href="#" className="hover:text-blue-600 transition-colors text-sm font-medium">Github</a>
            <a href="#" className="hover:text-blue-600 transition-colors text-sm font-medium">Twitter</a>
            <a href="#" className="hover:text-blue-600 transition-colors text-sm font-medium">System Design Blog</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;