import Link from "next/link";
import { notFound } from "next/navigation";
import { projectsData } from "../../../data/projectsData";
import { FaArrowLeft, FaGithub, FaExternalLinkAlt } from "react-icons/fa";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const project = projectsData.find((p) => p.id === id);
    if (!project) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-gray-100">
            <div className="w-full max-w-4xl mb-8">
                <Link
                    href="/about"
                    className="flex items-center space-x-2 text-blue-600 hover:underline"
                >
                    <FaArrowLeft />
                    <span>Back to About Page</span>
                </Link>
            </div>
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-md overflow-hidden">
                <div className="w-full h-64 sm:h-80 md:h-96">
                    <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-6 sm:p-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                        {project.title}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 mb-6">
                        {project.preview}
                    </p>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Features</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            {project.features.map((feature, index) => (
                                <li key={index} className="text-base">
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Technology</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.technology.map((tech, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Timeline</h3>
                        <p className="text-base text-gray-600">{project.timeline}</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition"
                        >
                            <FaGithub />
                            <span>View on Github</span>
                        </a>
                        <a
                            href={project.liveDemo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition"
                        >
                            <FaExternalLinkAlt />
                            <span>Live Demo</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}