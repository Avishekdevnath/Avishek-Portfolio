'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaGitlab, FaBitbucket, FaExternalLinkAlt } from "react-icons/fa";

interface Repository {
    url: string;
    type: string;
    label: string;
    name?: string;
}

interface Project {
    _id: string;
    title: string;
    description: string;
    shortDescription: string;
    image: string;
    repositories: Repository[];
    demoUrls: Repository[];
    technologies: { name: string; icon?: string }[];
    category: string;
    featured: boolean;
    status: 'published' | 'draft';
    order: number;
    completionDate: string;
    createdAt: string;
    updatedAt: string;
    additionalImages?: string[]; // Added for additional images
}

interface ProjectsResponse {
    success: boolean;
    data: {
        projects: Project[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    };
}

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('/api/projects');
                if (!response.ok) {
                    throw new Error('Failed to fetch projects');
                }
                const data: ProjectsResponse = await response.json();
                
                if (!data.success || !data.data?.projects) {
                    throw new Error('Invalid data format received');
                }
                
                // Only show published projects
                const publishedProjects = data.data.projects
                    .filter(project => project.status === 'published')
                    // Show featured projects first
                    .sort((a, b) => {
                        if (a.featured && !b.featured) return -1;
                        if (!a.featured && b.featured) return 1;
                        return a.order - b.order;
                    });
                
                setProjects(publishedProjects);
            } catch (err) {
                console.error('Error fetching projects:', err);
                setError(err instanceof Error ? err.message : 'Failed to load projects');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const getRepositoryIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'github':
                return <FaGithub className="w-4 h-4" />;
            case 'gitlab':
                return <FaGitlab className="w-4 h-4" />;
            case 'bitbucket':
                return <FaBitbucket className="w-4 h-4" />;
            default:
                return <FaExternalLinkAlt className="w-3.5 h-3.5" />;
        }
    };

    if (loading) {
        return (
            <div className="py-20 px-4 bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
                <div className="text-center mb-10">
                    <div className="h-6 w-40 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
                    <div className="h-8 w-56 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
                    <div className="h-4 w-80 bg-gray-200 rounded mx-auto animate-pulse" />
                </div>
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="aspect-video bg-gray-200 animate-pulse" />
                            <div className="p-5 space-y-3">
                                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="py-20 px-4 bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">My Recent Work</h4>
                    <h2 className="text-h3 md:text-h2 weight-bold text-gray-900 mb-6">Featured Projects</h2>
                    <p className="text-body-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Explore a selection of my recent projects showcasing my technical skills and creative problem-solving abilities.
                    </p>
                </div>

                {/* Projects Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                    {projects.length > 0 ? (
                        projects.slice(0, 6).map((project) => (
                            <div
                                key={project._id}
                                className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-50 to-white border border-gray-300 shadow-inner transition-all duration-300 hover:shadow-lg h-full flex flex-col animate-fadeIn"
                                style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}
                            >
                                {/* Featured Badge */}
                                {project.featured && (
                                    <div className="absolute left-3 top-3 z-10 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg border border-blue-500">
                                        Featured
                                    </div>
                                )}

                                {/* Project Image with Overlay */}
                                <div className="relative h-52 w-full overflow-hidden flex-shrink-0">
                                    <Image
                                        src={project.image || '/placeholder-project.svg'}
                                        alt={project.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-70" />
                                    
                                    {/* Category Badge */}
                                    <div className="absolute bottom-3 left-3 z-10">
                                        <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-gray-800 border border-gray-200">
                                            {project.category}
                                        </span>
                                    </div>
                                    
                                    {/* Additional Images Indicator */}
                                    {project.additionalImages && project.additionalImages.length > 0 && (
                                        <div className="absolute bottom-3 right-3 z-10">
                                            <span className="rounded-full bg-white/90 backdrop-blur-sm px-2 py-1 text-xs font-medium text-gray-800 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                </svg>
                                                {project.additionalImages.length}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Project Info */}
                                <div className="p-5 flex flex-col flex-grow">
                                    <Link href={`/projects/${project._id}`} className="group-hover:text-blue-600 transition-colors">
                                        <h3 className="text-h5 weight-semibold text-gray-900 line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors">
                                            {project.title}
                                        </h3>
                                    </Link>

                                    {/* Description */}
                                    <div className="mb-5 flex-grow">
                                        <p className="text-gray-600 text-body-sm leading-relaxed line-clamp-3">
                                            {project.shortDescription}
                                        </p>
                                    </div>

                                    {/* Technologies */}
                                    <div className="mb-5">
                                        <div className="flex flex-wrap gap-2">
                                            {project.technologies.slice(0, 3).map((tech, index) => (
                                                <span
                                                    key={index}
                                                    className="rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 shadow-sm"
                                                >
                                                    {tech.name}
                                                </span>
                                            ))}
                                            {project.technologies.length > 3 && (
                                                <span className="rounded-full bg-gray-100 border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700">
                                                    +{project.technologies.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Links */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto text-sm">
                                        {project.repositories.length > 0 && (
                                            <a
                                                href={project.repositories[0].url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                                            >
                                                {getRepositoryIcon(project.repositories[0].type)}
                                                <span className="text-button font-medium">Code</span>
                                            </a>
                                        )}
                                        
                                        {project.demoUrls.length > 0 && (
                                            <a
                                                href={project.demoUrls[0].url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
                                            >
                                                <span className="text-button font-medium">Live Demo</span>
                                                <FaExternalLinkAlt className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                            </a>
                                        )}
                                        
                                        <Link
                                            href={`/projects/${project._id}`}
                                            className="text-button font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 flex flex-col items-center justify-center text-center py-16">
                            <div className="bg-gray-100 rounded-full p-6 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Projects Available</h3>
                            <p className="text-gray-600 max-w-md">
                                There are no published projects available at the moment. Please check back later.
                            </p>
                        </div>
                    )}
                </div>
                
                {projects.length > 6 && (
                    <div className="mt-12 text-center">
                        <Link 
                            href="/projects" 
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg border border-blue-500"
                        >
                            View All Projects
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}