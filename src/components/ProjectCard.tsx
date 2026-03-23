"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaGithub, FaGitlab, FaBitbucket, FaGlobe, FaEye, FaEyeSlash, FaStar, FaPencilAlt, FaTrash, FaExternalLinkAlt, FaArrowRight } from 'react-icons/fa';
import { Project } from '@/types/dashboard';

interface ProjectCardProps {
  project: Project;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onFeatureToggle?: (id: string) => void;
  onStatusToggle?: (id: string) => void;
}

// Map categories to accent gradient classes
const getAccentClass = (category: string): string => {
  const lower = category.toLowerCase();
  if (lower.includes('web') || lower.includes('frontend') || lower.includes('fullstack'))
    return 'bg-gradient-to-r from-accent-orange to-[#f5a87a]';
  if (lower.includes('npm') || lower.includes('api') || lower.includes('library') || lower.includes('tool'))
    return 'bg-gradient-to-r from-accent-teal to-[#6ab8ae]';
  if (lower.includes('python') || lower.includes('data') || lower.includes('devops'))
    return 'bg-gradient-to-r from-deep-brown to-warm-brown';
  if (lower.includes('machine') || lower.includes('ml') || lower.includes('ai'))
    return 'bg-gradient-to-r from-[#7c3aed] to-[#a855f7]';
  if (lower.includes('mobile'))
    return 'bg-gradient-to-r from-accent-blue to-[#6a9fd8]';
  return 'bg-gradient-to-r from-accent-orange to-[#f5a87a]';
};

// Function to strip HTML tags and get plain text for preview (SSR-safe)
const stripHtml = (html: string) => {
  if (!html) return '';
  const withoutTags = html.replace(/<[^>]*>/g, ' ');
  const decoded = withoutTags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return decoded.replace(/\s+/g, ' ').trim();
};

const truncateText = (text: string, maxLength: number = 120) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength).trim() + '...';
};

const getRepositoryIcon = (type: string) => {
  switch (type) {
    case 'github': return <FaGithub className="w-[11px] h-[11px]" />;
    case 'gitlab': return <FaGitlab className="w-[11px] h-[11px]" />;
    case 'bitbucket': return <FaBitbucket className="w-[11px] h-[11px]" />;
    default: return <FaGlobe className="w-[11px] h-[11px]" />;
  }
};

export default function ProjectCard({
  project,
  isAdmin = false,
  onDelete,
  onFeatureToggle,
  onStatusToggle
}: ProjectCardProps) {
  const {
    _id,
    slug,
    title,
    shortDescription,
    description,
    image,
    technologies,
    repositories,
    demoUrls,
    category,
    featured,
    status
  } = project;

  const publicUrl = `/projects/${slug || _id}`;

  const mainRepository = repositories[0];
  const mainDemo = demoUrls[0];
  const accentClass = getAccentClass(category);

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
    <div className="group relative overflow-hidden rounded-[0.85rem] bg-off-white border border-cream-deeper flex flex-col transition-all duration-300 hover:border-sand hover:shadow-[0_8px_28px_rgba(74,55,40,0.1)] hover:-translate-y-[3px] h-full">
      {/* Featured Star Badge */}
      {featured && (
        <div className="absolute top-3 left-3 z-10 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[0.65rem] shadow-md">
          <span>⭐</span>
        </div>
      )}

      {/* Draft Badge */}
      {status === 'draft' && (
        <div className="absolute top-3 right-3 z-10 rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[0.55rem] font-mono uppercase tracking-wider text-text-muted shadow-sm">
          Draft
        </div>
      )}

      {/* Admin Actions */}
      {isAdmin && (
        <div className="absolute top-3 right-3 z-20 flex gap-1.5">
          <Link
            href={`/dashboard/projects/edit/${_id}`}
            className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-text-muted hover:text-accent-blue hover:bg-white transition-colors shadow-sm"
          >
            <FaPencilAlt className="w-3 h-3" />
          </Link>
          <button
            onClick={() => onDelete?.(_id)}
            className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-white transition-colors shadow-sm"
          >
            <FaTrash className="w-3 h-3" />
          </button>
          <button
            onClick={() => onFeatureToggle?.(_id)}
            className={`w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm ${
              featured ? 'text-yellow-500' : 'text-text-muted hover:text-yellow-500'
            } hover:bg-white`}
          >
            <FaStar className="w-3 h-3" />
          </button>
          <button
            onClick={() => onStatusToggle?.(_id)}
            className={`w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm ${
              status === 'published' ? 'text-emerald-500' : 'text-text-muted hover:text-emerald-500'
            } hover:bg-white`}
            title={`Click to ${status === 'published' ? 'unpublish' : 'publish'}`}
          >
            {status === 'published' ? <FaEye className="w-3 h-3" /> : <FaEyeSlash className="w-3 h-3" />}
          </button>
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-cream-deeper flex-shrink-0">
        <div className="h-[155px] overflow-hidden relative">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[2.8rem] opacity-[0.14] bg-gradient-to-br from-[#d8d0c0] to-cream-deeper">
              📁
            </div>
          )}
        </div>
        {/* Category Badge on Thumbnail */}
        <span className="absolute bottom-2.5 left-2.5 font-mono text-[0.55rem] tracking-[0.08em] uppercase py-[0.17rem] px-[0.58rem] rounded-full bg-ink/70 text-white/90 backdrop-blur-sm">
          {category}
        </span>
      </div>

      {/* Accent Bar */}
      <div className={`h-[3px] w-full flex-shrink-0 ${accentClass}`} />

      {/* Content */}
      <div className="p-[1.1rem_1.2rem] flex-1 flex flex-col gap-[0.58rem]">
        <h3 className="font-heading text-[1.1rem] font-semibold text-ink leading-[1.2] group-hover:text-accent-orange transition-colors duration-200">
          {title}
        </h3>
        <p className="font-body text-[0.79rem] leading-[1.65] text-text-muted font-light line-clamp-2 flex-1">
          {getPreviewText()}
        </p>
        {/* Tech Tags */}
        <div className="flex flex-wrap gap-[0.36rem] items-center">
          {technologies.slice(0, 3).map((tech, index) => (
            <span
              key={index}
              className="font-mono text-[0.57rem] tracking-[0.03em] py-[0.15rem] px-[0.55rem] rounded-full border border-cream-deeper bg-cream-dark text-warm-brown whitespace-nowrap"
            >
              {tech.name}
            </span>
          ))}
          {technologies.length > 3 && (
            <span className="font-mono text-[0.57rem] text-text-muted">
              +{technologies.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-[0.55rem] flex-wrap px-[1.2rem] py-[0.82rem] border-t border-cream-deeper bg-cream/35">
        {mainRepository && (
          <a
            href={mainRepository.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[0.28rem] font-mono text-[0.63rem] tracking-[0.06em] uppercase text-text-muted no-underline hover:text-ink transition-colors"
          >
            {getRepositoryIcon(mainRepository.type)} Code
          </a>
        )}
        {mainDemo && (
          <>
            <div className="w-px h-[11px] bg-cream-deeper" />
            <a
              href={mainDemo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[0.28rem] font-mono text-[0.63rem] tracking-[0.06em] uppercase text-text-muted no-underline hover:text-ink transition-colors"
            >
              <FaExternalLinkAlt className="w-[11px] h-[11px]" /> Demo
            </a>
          </>
        )}
        <Link
          href={publicUrl}
          className="ml-auto inline-flex items-center gap-[0.28rem] font-mono text-[0.63rem] tracking-[0.06em] uppercase text-accent-orange no-underline opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-250"
        >
          View Details <FaArrowRight className="w-[11px] h-[11px]" />
        </Link>
      </div>
    </div>
  );
}
