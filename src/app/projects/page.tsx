import React from "react";
import { projectsData } from "../../data/projectsData";
import ProjectCard from "../../components/ProjectCard";

export default function Projects() {
    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Projects Section */}
            <section className="py-16 flex flex-col items-center">
                <div className="text-center mb-12">
                    <h4 className="text-md text-gray-600">Browse My Recent</h4>
                    <h2 className="text-5xl font-bold text-black">Projects</h2>
                </div>

                <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
                    {projectsData.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </section>
        </div>
    );
}