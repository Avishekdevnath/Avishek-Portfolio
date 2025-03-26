import React from "react";

export default function Projects() {
    const profileImage = "/assets/home/profile-img.jpg";
    // Dynamic data structure for projects
    const projectsData = [
        {
            title: "Project One",
            image: profileImage,
            github: "https://github.com/yourusername/project1",
            liveDemo: "https://yourproject1.com",
        },
        {
            title: "Project Two",
            image: profileImage,
            github: "https://github.com/yourusername/project2",
            liveDemo: "https://yourproject2.com",
        },
        {
            title: "Project Three",
            image: profileImage,
            github: "https://github.com/yourusername/project3",
            liveDemo: "https://yourproject3.com",
        },
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
            {/* Header Section */}
            <div className="text-center mb-12">
                <h4 className="text-md text-gray-600">Browse My Recent</h4>
                <h4 className="text-5xl font-bold text-black">Projects</h4>
            </div>

            {/* Projects Section */}
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
                {projectsData.map((project, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 rounded-xl shadow-md overflow-hidden flex flex-col items-center"
                    >
                        {/* Project Image */}
                        <div className="w-full h-64">
                            <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Project Title */}
                        <h5 className="text-xl font-semibold text-center mt-4">
                            {project.title}
                        </h5>

                        {/* Buttons */}
                        <div className="flex space-x-4 my-4">
                            <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                            >
                                Github
                            </a>
                            <a
                                href={project.liveDemo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                            >
                                Live Demo
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}