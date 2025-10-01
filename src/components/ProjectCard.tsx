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
          className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-50 to-white shadow-inner border border-gray-300 h-full flex flex-col font-ui text-sm"
          style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
      {/* Status Badge */}
      {status === 'draft' && (
        <div className="absolute right-4 top-4 z-10 rounded-full bg-white px-3 py-1.5 text-caption font-semibold text-gray-700 shadow-inner border border-gray-200">
          Draft
        </div>
      )}

      {/* Featured Badge */}
      {featured && (
        <div className="absolute left-4 top-4 z-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1.5 text-caption font-semibold text-white shadow-lg border border-blue-400">
          ⭐ 
        </div>
      )}

      {/* Project Image with Modern Overlay */}
      <div className="relative h-32 w-full overflow-hidden flex-shrink-0">
             <Image
               src={image || '/placeholder-project.svg'}
               alt={title}
               fill
               className="object-cover"
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
             />
        
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70" />
        
        
             {/* Category Badge */}
             <div className="absolute bottom-3 left-3 z-10">
               <span className="rounded-xl bg-black/40 backdrop-blur-md px-3 py-1.5 text-caption font-semibold text-white border border-white/20">
                 {category}
               </span>
             </div>

             {/* Date Badge removed per request */}
        
        {/* Admin Actions */}
        {isAdmin && (
          <div className="absolute right-4 top-4 z-20 flex gap-2">
                 <Link
                   href={`/dashboard/projects/edit/${_id}`}
                   className="rounded-xl bg-white p-2.5 text-gray-700 hover:bg-blue-500 hover:text-white border border-gray-300 shadow-inner"
                   style={{
                     boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.1)'
                   }}
                 >
              <FaPencilAlt className="h-4 w-4" />
            </Link>
            <button
              onClick={() => onDelete?.(_id)}
              className="rounded-xl bg-white p-2.5 text-gray-700 hover:bg-red-500 hover:text-white border border-gray-300 shadow-inner"
              style={{
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <FaTrash className="h-4 w-4" />
            </button>
            <button
              onClick={() => onFeatureToggle?.(_id)}
              className={`rounded-xl bg-white p-2.5 border border-gray-300 shadow-inner ${
                featured
                  ? 'text-yellow-600 hover:bg-yellow-500'
                  : 'text-gray-700 hover:bg-yellow-500'
              } hover:text-white`}
              style={{
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <FaStar className="h-4 w-4" />
            </button>
            <button
              onClick={() => onStatusToggle?.(_id)}
              className={`rounded-xl bg-white p-2.5 border border-gray-300 shadow-inner ${
                status === 'published'
                  ? 'text-emerald-600 hover:bg-emerald-500'
                  : 'text-gray-500 hover:bg-emerald-500'
              } hover:text-white`}
              title={`Click to ${status === 'published' ? 'unpublish' : 'publish'}`}
              style={{
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {status === 'published' ? <FaEye className="h-4 w-4" /> : <FaEyeSlash className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Project Info - Modern Layout */}
      <div className="p-4 flex flex-col flex-grow">
             <h3 className="text-h5 weight-semibold text-gray-900 line-clamp-2 mb-1.5 leading-tight">
               {title}
             </h3>

            {/* Description with consistent height */}
            <div className="mb-2.5 flex-grow">
              <p className="text-gray-600 text-body-sm leading-snug line-clamp-2">
                {getPreviewText()}
              </p>
            </div>

        {/* Technologies - Modern Pills */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
                {technologies.slice(0, 3).map((tech, index) => (
                   <span
                     key={index}
                     className="rounded-full bg-white border border-gray-300 px-2.5 py-1 text-caption font-medium text-gray-700 shadow-inner"
                     style={{
                       boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                     }}
                   >
                     {tech.name}
                   </span>
                ))}
                {technologies.length > 3 && (
                  <span
                    className="rounded-full bg-gray-100 border border-gray-400 px-2.5 py-1 text-caption font-medium text-gray-700 shadow-inner"
                    style={{
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)'
                    }}
                  >
                    +{technologies.length - 3}
                  </span>
                )}
          </div>
        </div>

        {/* Links - Modern Design */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-200 mt-auto">
          <div className="flex items-center gap-3">
            {mainRepository && (
                   <a
                     href={mainRepository.url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600"
                   >
                <div 
                  className="p-1 rounded-md bg-white group-hover:bg-gray-50 transition-colors duration-300 border border-gray-300 shadow-inner"
                  style={{
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  {getRepositoryIcon(mainRepository.type)}
                </div>
                     <span className="text-caption font-medium">Code</span>
                   </a>
                 )}
                 {mainDemo && (
                   <a
                     href={mainDemo.url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600"
                   >
                     <div
                       className="p-1 rounded-md bg-white border border-gray-300 shadow-inner"
                       style={{
                         boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                       }}
                     >
                       <FaGlobe className="h-3 w-3" />
                     </div>
                     <span className="text-caption font-medium">Demo</span>
                     <FaExternalLinkAlt className="h-2.5 w-2.5" />
                   </a>
                 )}
               </div>

               <Link
                 href={`/projects/${_id}`}
                 className="text-caption font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
               >
                 View Details
                 <FaExternalLinkAlt className="h-2.5 w-2.5" />
               </Link>
        </div>
      </div>
    </div>
  );
}
