"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, Calendar, Tag, Layers, Clock, Globe, Code } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { Project } from "@/types/dashboard";
import { FaGithub, FaGitlab, FaBitbucket, FaGlobe } from 'react-icons/fa';

interface ProjectDetailsProps {
  id: string;
}

export default function ProjectDetails({ id }: ProjectDetailsProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) throw new Error('Project not found');
        const { success, data } = await response.json();
        if (success && data) {
          setProject(data);
        } else {
          throw new Error('Project data not found');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  const getRepositoryIcon = (type: string) => {
    switch (type) {
      case 'github':
        return <FaGithub className="w-5 h-5" />;
      case 'gitlab':
        return <FaGitlab className="w-5 h-5" />;
      case 'bitbucket':
        return <FaBitbucket className="w-5 h-5" />;
      default:
        return <FaGlobe className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-lg text-gray-600 animate-pulse">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Project Not Found</h2>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/projects"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const mainRepo = project.repositories?.[0];
  const mainDemo = project.demoUrls?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-6">
        <Header />
      </div>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Back Button */}
        <Link
          href="/projects"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-all transform hover:-translate-x-1 mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </Link>

        {/* Project Hero */}
        <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-xl mb-8 animate-fadeIn">
          <Image
            src={project?.image || '/placeholder-project.svg'}
            alt={project?.title || 'Project Image'}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          
          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="animate-slideUp">
              {project?.category && (
                <span className="px-4 py-1.5 bg-blue-600/90 text-white rounded-full inline-block text-sm font-medium mb-4 backdrop-blur-sm shadow-lg">
                  {project.category}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {project?.title}
              </h1>
              <p className="text-white/90 text-lg max-w-3xl mb-6">
                {project.shortDescription}
              </p>
              
              {/* Project Meta */}
              <div className="flex flex-wrap gap-6 text-white/80">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>Completed {formatDate(project.completionDate)}</span>
                </div>
                <div className="flex items-center">
                  <Layers className="w-5 h-5 mr-2" />
                  <span>{project.technologies?.length} Technologies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Project Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl animate-fadeIn">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Technical Details
              </button>
            </div>
          </div>
          
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="animate-fadeIn">
                {/* Project Links */}
                <div className="flex flex-wrap gap-4 mb-8">
                  {mainRepo && (
                    <a
                      href={mainRepo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all transform hover:scale-105 hover:shadow-lg"
                    >
                      {getRepositoryIcon(mainRepo.type)}
                      <span className="ml-2">View Source Code</span>
                    </a>
                  )}
                  {mainDemo && (
                    <a
                      href={mainDemo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 hover:shadow-lg"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      View Live Demo
                    </a>
                  )}
                </div>

                {/* Project Description */}
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About this Project</h2>
                  <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
                    <div 
                      className="text-gray-700 leading-relaxed prose prose-gray max-w-none"
                      dangerouslySetInnerHTML={{ __html: project?.description || '' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="animate-fadeIn">
                {/* Technologies */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Technologies Used</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {project?.technologies?.map((tech, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 bg-gray-50 border border-gray-100 text-gray-800 rounded-lg font-medium transition-all hover:bg-gray-100 hover:shadow-sm flex items-center"
                      >
                        <Code className="w-4 h-4 mr-2 text-blue-500" />
                        {tech.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* All Repositories */}
                {project.repositories?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Repositories</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.repositories.map((repo, index) => (
                        <a
                          key={`repo-${index}`}
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-4 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-all group"
                        >
                          <div className="mr-3 text-gray-600 group-hover:text-blue-600">
                            {getRepositoryIcon(repo.type)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-blue-600">
                              {repo.name || `${repo.type} Repository`}
                            </div>
                            <div className="text-sm text-gray-500">{repo.type.charAt(0).toUpperCase() + repo.type.slice(1)}</div>
                          </div>
                          <ExternalLink className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-600" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Demo Links */}
                {project.demoUrls?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Demo Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.demoUrls.map((demo, index) => (
                        <a
                          key={`demo-${index}`}
                          href={demo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-4 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-all group"
                        >
                          <Globe className="w-5 h-5 mr-3 text-gray-600 group-hover:text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-blue-600">
                              {demo.name || `${demo.type} Demo`}
                            </div>
                            <div className="text-sm text-gray-500">{demo.type.charAt(0).toUpperCase() + demo.type.slice(1)}</div>
                          </div>
                          <ExternalLink className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-600" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 