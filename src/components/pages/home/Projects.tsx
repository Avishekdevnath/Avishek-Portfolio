'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

interface Repository {
    url: string;
    type: string;
    label: string;
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
                const publishedProjects = data.data.projects.filter(project => 
                    project.status === 'published'
                );
                
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
            {/* Header Section */}
            <div className="text-center mb-12">
                <h4 className="text-md text-gray-600">Browse My Recent</h4>
                <h4 className="text-5xl font-bold text-black">Projects</h4>
            </div>

            {/* Projects Section */}
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-fr">
                {projects.length > 0 ? (
                    projects.map((project) => (
                        <div
                            key={project._id}
                            className="border border-gray-200 rounded-xl shadow-md overflow-hidden flex flex-col items-center transform transition duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
                        >
                            {/* Project Image */}
                            <div className="w-full h-64 relative flex-shrink-0">
                                <Image
                                    src={project.image || '/placeholder-project.svg'}
                                    alt={project.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Project Content */}
                            <div className="p-6 flex flex-col items-center flex-grow">
                                {/* Project Title */}
                                <h5 className="text-xl font-semibold text-center mb-2 line-clamp-2">
                                    {project.title}
                                </h5>

                                {/* Project Description */}
                                <div className="flex-grow mb-4">
                                    <p className="text-gray-600 text-center text-sm line-clamp-3">
                                        {project.shortDescription || project.description}
                                    </p>
                                </div>

                                {/* Category */}
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mb-4">
                                    {project.category}
                                </span>

                                {/* Technologies */}
                                {project.technologies && project.technologies.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-2 mb-4 min-h-[2rem]">
                                        {project.technologies.slice(0, 3).map((tech, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                                            >
                                                {tech.name}
                                            </span>
                                        ))}
                                        {project.technologies.length > 3 && (
                                            <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                                                +{project.technologies.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex flex-wrap justify-center gap-4 mt-auto">
                                    {project.repositories.map((repo, index) => (
                                        <a
                                            key={`repo-${index}`}
                                            href={repo.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                                        >
                                            <FaGithub className="text-lg" />
                                            {repo.label || 'Repository'}
                                        </a>
                                    ))}
                                    {project.demoUrls.map((demo, index) => (
                                        <a
                                            key={`demo-${index}`}
                                            href={demo.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                                        >
                                            <FaExternalLinkAlt className="text-lg" />
                                            {demo.label || 'Live Demo'}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 text-center text-gray-500 py-12">
                        No published projects available at the moment.
                    </div>
                )}
            </div>
        </div>
    );
}