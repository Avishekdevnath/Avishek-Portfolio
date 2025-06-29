"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaGithub, FaGitlab, FaBitbucket, FaGlobe, FaEye, FaEyeSlash, FaStar, FaRegStar, FaPencilAlt, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { Project } from '@/types/dashboard';

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
  project: Project;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onFeatureToggle?: (id: string) => void;
  onStatusToggle?: (id: string) => void;
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short'
});

// Function to format date safely
const formatDate = (date: string | Date): string => {
  try {
    // If it's already a Date object
    if (date instanceof Date) {
      return dateFormatter.format(date);
    }
    // If it's a string, try to create a Date object
    return dateFormatter.format(new Date(date));
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

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

export default function ProjectCard({
  project,
  isAdmin = false,
  onDelete,
  onFeatureToggle,
  onStatusToggle
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
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

  const getRepositoryIcon = (type: string) => {
    switch (type) {
      case 'github':
        return <FaGithub />;
      case 'gitlab':
        return <FaGitlab />;
      case 'bitbucket':
        return <FaBitbucket />;
      default:
        return <FaGlobe />;
    }
  };

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
    <div 
      className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl h-full flex flex-col border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status Badge */}
      {status === 'draft' && (
        <div className="absolute right-3 top-3 z-10 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 backdrop-blur-sm">
          Draft
        </div>
      )}

      {/* Featured Badge */}
      {featured && (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
          Featured
        </div>
      )}

      {/* Project Image with Overlay */}
      <div className="relative h-52 w-full overflow-hidden flex-shrink-0">
        <Image
          src={image || '/placeholder-project.svg'}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-70" />
        
        {/* Category Badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="rounded-full bg-black/30 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white">
            {category}
          </span>
        </div>

        {/* Date Badge */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="rounded-full bg-black/30 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white">
            {formatDate(completionDate)}
          </span>
        </div>
        
        {/* Admin Actions */}
        {isAdmin && (
          <div className="absolute right-3 top-3 z-20 flex gap-2">
            <Link
              href={`/dashboard/projects/edit/${_id}`}
              className="rounded-full bg-white/90 p-2 text-gray-700 shadow-md transition-all hover:bg-blue-500 hover:text-white"
            >
              <FaPencilAlt className="h-4 w-4" />
            </Link>
            <button
              onClick={() => onDelete?.(_id)}
              className="rounded-full bg-white/90 p-2 text-gray-700 shadow-md transition-all hover:bg-red-500 hover:text-white"
            >
              <FaTrash className="h-4 w-4" />
            </button>
            <button
              onClick={() => onFeatureToggle?.(_id)}
              className={`rounded-full bg-white/90 p-2 shadow-md transition-all ${
                featured
                  ? 'text-yellow-500 hover:bg-yellow-500'
                  : 'text-gray-700 hover:bg-yellow-500'
              } hover:text-white`}
            >
              <FaStar className="h-4 w-4" />
            </button>
            <button
              onClick={() => onStatusToggle?.(_id)}
              className={`rounded-full bg-white/90 p-2 shadow-md transition-all ${
                status === 'published'
                  ? 'text-green-500 hover:bg-green-500'
                  : 'text-gray-500 hover:bg-green-500'
              } hover:text-white`}
              title={`Click to ${status === 'published' ? 'unpublish' : 'publish'}`}
            >
              {status === 'published' ? <FaEye className="h-4 w-4" /> : <FaEyeSlash className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Project Info - Flex container for equal distribution */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* Description with consistent height */}
        <div className="mb-5 flex-grow">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {getPreviewText()}
          </p>
        </div>

        {/* Technologies - Fixed height container */}
        <div className="mb-5">
          <div className="flex flex-wrap gap-1.5">
            {technologies.slice(0, 4).map((tech, index) => (
              <span
                key={index}
                className="rounded-full bg-gray-50 border border-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                {tech.name}
              </span>
            ))}
            {technologies.length > 4 && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                +{technologies.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          {mainRepository && (
            <a
              href={mainRepository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {getRepositoryIcon(mainRepository.type)}
              <span className="text-sm font-medium">Code</span>
            </a>
          )}
          {mainDemo && (
            <a
              href={mainDemo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <span className="text-sm font-medium">Live Demo</span>
              <FaExternalLinkAlt className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          )}
          
          <Link
            href={`/projects/${_id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
