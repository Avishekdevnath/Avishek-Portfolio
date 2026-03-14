'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaGitlab, FaBitbucket, FaExternalLinkAlt } from "react-icons/fa";
import { useProjects } from "@/lib/swr";

const CARD_ACCENTS = [
  'bg-accent-orange',
  'bg-accent-teal',
  'bg-accent-blue',
  'bg-[#c4841a]',
];

function RepoIcon({ type }: { type: string }) {
  switch (type.toLowerCase()) {
    case 'github':    return <FaGithub className="w-3.5 h-3.5" />;
    case 'gitlab':    return <FaGitlab className="w-3.5 h-3.5" />;
    case 'bitbucket': return <FaBitbucket className="w-3.5 h-3.5" />;
    default:          return <FaExternalLinkAlt className="w-3 h-3" />;
  }
}

export default function Projects() {
  const { projects: allProjects, isLoading, error } = useProjects('published');

  // featured first, then by order
  const projects = [...allProjects].sort((a: any, b: any) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return (a.order ?? 0) - (b.order ?? 0);
  });

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-cream">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12 space-y-3">
            <div className="h-3 w-28 bg-cream-deeper rounded-full mx-auto animate-pulse" />
            <div className="h-9 w-52 bg-cream-deeper rounded mx-auto animate-pulse" />
            <div className="h-4 w-72 bg-cream-deeper rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-off-white border border-cream-deeper rounded-[0.9rem] overflow-hidden animate-pulse">
                <div className="h-44 bg-cream-deeper" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-cream-deeper rounded w-3/4" />
                  <div className="h-3 bg-cream-deeper rounded w-full" />
                  <div className="h-3 bg-cream-deeper rounded w-5/6" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-5 w-16 bg-cream-deeper rounded-full" />
                    <div className="h-5 w-14 bg-cream-deeper rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <section className="py-20 px-4 bg-cream flex justify-center">
        <div className="bg-off-white border border-cream-deeper text-warm-brown px-6 py-4 rounded-xl font-body text-[0.88rem]">
          Failed to load projects.
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-cream">
      <div className="max-w-[1100px] mx-auto">

        {/* ── Section header ── */}
        <div className="text-center mb-12">
          <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-accent-orange opacity-50" />
            Shipped &amp; Maintained
            <span className="w-8 h-px bg-accent-orange opacity-50" />
          </p>
          <h2
            className="font-heading font-light text-ink leading-[1.05] mb-4"
            style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)' }}
          >
            Featured <em className="italic text-warm-brown">Projects</em>
          </h2>
          <p className="text-[0.9rem] text-text-muted max-w-[54ch] mx-auto leading-[1.75] font-light">
            Selected systems where I owned backend architecture, data lifecycle, and reliability.
          </p>
        </div>

        {/* ── Grid ── */}
        {projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.slice(0, 6).map((project: any, idx: number) => {
                const accent = project.featured
                  ? CARD_ACCENTS[0]
                  : CARD_ACCENTS[(idx % (CARD_ACCENTS.length - 1)) + 1];

                return (
                  <div
                    key={project._id}
                    className="group relative bg-off-white border border-cream-deeper rounded-[0.9rem] overflow-hidden flex flex-col hover:border-sand hover:shadow-lg transition-all duration-300"
                  >
                    {/* Left accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${accent} z-10 rounded-l-[0.9rem]`} />

                    {/* Image */}
                    <div className="relative h-44 w-full overflow-hidden flex-shrink-0">
                      <Image
                        src={project.image || '/placeholder-project.svg'}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />

                      {/* Featured badge */}
                      {project.featured && (
                        <div className="absolute top-3 right-3 z-10 bg-accent-orange text-off-white font-mono text-[0.58rem] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full shadow-sm">
                          Featured
                        </div>
                      )}

                      {/* Category pill */}
                      {project.category && (
                        <div className="absolute bottom-3 left-5 z-10">
                          <span className="font-mono text-[0.58rem] tracking-[0.12em] uppercase text-cream/90 bg-ink/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                            {project.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="pl-6 pr-5 pt-5 pb-5 flex flex-col flex-grow">
                      <Link href={`/projects/${project._id}`}>
                        <h3 className="font-heading text-[1.12rem] font-semibold text-ink leading-snug mb-2 group-hover:text-accent-orange transition-colors duration-200 line-clamp-2">
                          {project.title}
                        </h3>
                      </Link>

                      <p className="font-body text-[0.83rem] text-text-muted leading-[1.7] font-light line-clamp-3 mb-4 flex-grow">
                        {project.shortDescription || project.description}
                      </p>

                      {/* Tech pills */}
                      {project.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.technologies.slice(0, 3).map((tech: any, i: number) => (
                            <span
                              key={i}
                              className="font-mono text-[0.6rem] tracking-[0.06em] text-warm-brown bg-cream border border-cream-deeper px-2.5 py-1 rounded-full"
                            >
                              {tech.name || tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="font-mono text-[0.6rem] tracking-[0.06em] text-text-muted bg-cream border border-cream-deeper px-2.5 py-1 rounded-full">
                              +{project.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Links */}
                      <div className="flex items-center gap-4 pt-3.5 border-t border-cream-deeper">
                        {project.repositories?.[0] && (
                          <a
                            href={project.repositories[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 font-mono text-[0.63rem] tracking-[0.06em] uppercase text-warm-brown hover:text-ink transition-colors duration-200"
                          >
                            <RepoIcon type={project.repositories[0].type} />
                            Code
                          </a>
                        )}
                        {project.demoUrls?.[0] && (
                          <a
                            href={project.demoUrls[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 font-mono text-[0.63rem] tracking-[0.06em] uppercase text-warm-brown hover:text-ink transition-colors duration-200"
                          >
                            <FaExternalLinkAlt className="w-3 h-3" />
                            Demo
                          </a>
                        )}
                        <Link
                          href={`/projects/${project._id}`}
                          className="ml-auto font-mono text-[0.63rem] tracking-[0.06em] uppercase text-accent-orange hover:text-ink transition-colors duration-200 flex items-center gap-1"
                        >
                          Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All */}
            {projects.length > 6 && (
              <div className="mt-10 text-center">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2.5 font-body bg-ink text-off-white px-7 py-3 rounded-md text-[0.83rem] font-medium tracking-wide border-[1.5px] border-ink hover:bg-accent-orange hover:border-accent-orange transition-all duration-250"
                >
                  View All Projects →
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-[2rem] opacity-[0.2] mb-3">🔍</div>
            <p className="font-body text-[0.88rem] text-text-muted font-light">
              No projects available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
