"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiGithub, FiGlobe, FiStar, FiEdit3, FiTrash2 } from 'react-icons/fi';

interface Technology {
  name: string;
  icon?: string;
}

interface Repository {
  name: string;
  url: string;
  type: 'github' | 'gitlab' | 'bitbucket' | 'other';
}

interface DemoURL {
  name: string;
  url: string;
}

interface ProjectCardProps {
  project: {
    _id: string;
    title: string;
    shortDescription: string;
    description: string;
    image: string;
    technologies: Technology[];
    repositories: Repository[];
    demoUrls: DemoURL[];
    category: string;
    completionDate: string;
    featured: boolean;
    status: 'draft' | 'published';
  };
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onFeatureToggle?: (id: string) => void;
  onStatusToggle?: (id: string) => void;
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short'
});

// Function to strip HTML tags and get plain text for preview
const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// Function to truncate text to specified length
const truncateText = (text: string, maxLength: number = 120) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength).trim() + '...';
};

export default function ProjectCard({ project, isAdmin, onDelete, onFeatureToggle, onStatusToggle }: ProjectCardProps) {
  const {
    _id,
    title,
    shortDescription,
    description,
    image,
    technologies,
    repositories,
    demoUrls,
    category,
    completionDate,
    featured,
    status
  } = project;

  const mainRepository = repositories[0];
  const mainDemo = demoUrls[0];

  // Get preview text from rich description or fallback to shortDescription
  const getPreviewText = () => {
    if (description && description.trim() !== '') {
      const plainText = stripHtml(description);
      if (plainText.trim() !== '') {
        return truncateText(plainText, 120);
      }
    }
    return shortDescription;
  };

  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-lg transition-all hover:shadow-xl h-full flex flex-col">
      {/* Status Badge */}
      {status === 'draft' && (
        <div className="absolute right-2 top-2 z-10 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
          Draft
        </div>
      )}

      {/* Featured Badge */}
      {featured && (
        <div className="absolute left-2 top-2 z-10 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
          Featured
        </div>
      )}

      {/* Project Image */}
      <div className="relative h-48 w-full overflow-hidden flex-shrink-0">
        <Image
          src={image || '/placeholder-project.svg'}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Admin Actions */}
        {isAdmin && (
          <div className="absolute right-2 top-2 z-20 flex gap-2">
            <Link
              href={`/dashboard/projects/edit/${_id}`}
              className="rounded-full bg-white p-2 text-gray-600 shadow-md transition-colors hover:bg-blue-500 hover:text-white"
            >
              <FiEdit3 className="h-4 w-4" />
            </Link>
            <button
              onClick={() => onDelete?.(_id)}
              className="rounded-full bg-white p-2 text-gray-600 shadow-md transition-colors hover:bg-red-500 hover:text-white"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onFeatureToggle?.(_id)}
              className={`rounded-full bg-white p-2 shadow-md transition-colors ${
                featured
                  ? 'text-yellow-500 hover:bg-yellow-500'
                  : 'text-gray-600 hover:bg-yellow-500'
              } hover:text-white`}
            >
              <FiStar className="h-4 w-4" />
            </button>
            <button
              onClick={() => onStatusToggle?.(_id)}
              className={`rounded-full bg-white p-2 shadow-md transition-colors ${
                status === 'published'
                  ? 'text-green-500 hover:bg-green-500'
                  : 'text-gray-400 hover:bg-green-500'
              } hover:text-white`}
              title={`Click to ${status === 'published' ? 'unpublish' : 'publish'}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-4 w-4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Project Info - Flex container for equal distribution */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{title}</h3>
          <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
            {dateFormatter.format(new Date(completionDate))}
          </span>
        </div>

        {/* Description with consistent height */}
        <div className="mb-4 flex-grow">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {getPreviewText()}
          </p>
        </div>

        {/* Technologies - Fixed height container */}
        <div className="mb-4 min-h-[2.5rem]">
          <div className="flex flex-wrap gap-2">
            {technologies.slice(0, 4).map((tech, index) => (
              <span
                key={index}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
              >
                {tech.name}
              </span>
            ))}
            {technologies.length > 4 && (
              <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600">
                +{technologies.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Links - Always at bottom */}
        <div className="flex items-center gap-4 mt-auto">
          {mainRepository && (
            <a
              href={mainRepository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FiGithub className="h-4 w-4" />
              <span>Repository</span>
            </a>
          )}
          
          {mainDemo && (
            <a
              href={mainDemo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FiGlobe className="h-4 w-4" />
              <span>Live Demo</span>
            </a>
          )}

          <Link
            href={`/projects/${_id}`}
            className="ml-auto text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
