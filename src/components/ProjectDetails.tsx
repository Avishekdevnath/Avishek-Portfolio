"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, Calendar, Tag, Layers } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { Project } from "@/types/dashboard";

interface ProjectDetailsProps {
  id: string;
}

export default function ProjectDetails({ id }: ProjectDetailsProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) throw new Error('Project not found');
        const { success, data } = await response.json();
        if (success && data) {
          setProject(data);
          console.log('Project data:', data);
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

  const mainRepo = project.repositories?.[0]?.url;
  const mainDemo = project.demoUrls?.[0]?.url;

  return (
    <div className="min-h-screen bg-gray-100">
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

        {/* Project Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl">
          {/* Project Image */}
          <div className="relative h-[500px] w-full group">
            <Image
              src={project?.image || '/placeholder.jpg'}
              alt={project?.title || 'Project Image'}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                {project?.title}
              </h1>
              {project?.category && (
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full inline-block">
                  {project.category}
                </span>
              )}
            </div>
          </div>
          
          <div className="p-8">
            {/* Project Meta */}
            <div className="flex flex-wrap gap-6 mb-8 text-gray-600">
              <div className="flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                <span>{project.category}</span>
              </div>
              <div className="flex items-center">
                <Layers className="w-5 h-5 mr-2" />
                <span>{project.technologies?.length} Technologies</span>
              </div>
            </div>
            
            {/* Technologies */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {project?.technologies?.map((tech, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium transition-all hover:bg-blue-100"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Project Links */}
            <div className="flex flex-wrap gap-4 mb-8">
              {mainRepo && (
                <a
                  href={mainRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all transform hover:scale-105 hover:shadow-lg"
                >
                  <Github className="w-5 h-5 mr-2" />
                  View Source Code
                </a>
              )}
              {mainDemo && (
                <a
                  href={mainDemo}
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
              <div className="bg-gray-50 rounded-xl p-6">
                <div 
                  className="text-gray-700 leading-relaxed prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: project?.description || '' }}
                />
              </div>
            </div>

            {/* Additional Links */}
            {(project?.repositories?.length > 1 || project?.demoUrls?.length > 1) && (
              <div className="mt-12 border-t border-gray-100 pt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Additional Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Additional Repositories */}
                  {project.repositories?.slice(1).map((repo, index) => (
                    <a
                      key={`repo-${index}`}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group"
                    >
                      <Github className="w-5 h-5 mr-3 text-gray-600 group-hover:text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-blue-600">
                          {repo.label || `${repo.type} Repository`}
                        </div>
                        <div className="text-sm text-gray-500">View Source Code</div>
                      </div>
                      <ExternalLink className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-600" />
                    </a>
                  ))}

                  {/* Additional Demo Links */}
                  {project.demoUrls?.slice(1).map((demo, index) => (
                    <a
                      key={`demo-${index}`}
                      href={demo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group"
                    >
                      <ExternalLink className="w-5 h-5 mr-3 text-gray-600 group-hover:text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-blue-600">
                          {demo.label || `${demo.type} Demo`}
                        </div>
                        <div className="text-sm text-gray-500">View Live Demo</div>
                      </div>
                      <ExternalLink className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-600" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 