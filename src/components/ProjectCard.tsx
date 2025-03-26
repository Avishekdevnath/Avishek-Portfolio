"use client";

import Link from "next/link";

type Project = {
    id: string;
    title: string;
    preview: string;
    image: string;
    github: string;
    liveDemo: string;
};

export default function ProjectCard({ project }: { project: Project }) {
    return (
        <Link
            href={`/projects/${project.id}`}
            className="border border-gray-200 rounded-xl shadow-md overflow-hidden flex flex-col bg-white"
        >
            <div className="w-full h-48 sm:h-56 md:h-64">
                <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-1 p-4 sm:p-6 flex flex-col items-center text-center">
                <h5 className="text-lg sm:text-xl font-semibold mt-2">
                    {project.title}
                </h5>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {project.preview}
                </p>
                <div className="flex flex-wrap justify-center space-x-3 my-4">
                    <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Github
                    </a>
                    <a
                        href={project.liveDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Live Demo
                    </a>
                </div>
            </div>
        </Link>
    );
}