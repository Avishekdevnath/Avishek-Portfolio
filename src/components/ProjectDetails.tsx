import Image from "next/image";
import Link from "next/link";
import { Code } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import RichTextViewer from '@/components/shared/RichTextViewer';
import { FaGithub, FaGitlab, FaBitbucket, FaGlobe, FaExternalLinkAlt, FaArrowRight } from 'react-icons/fa';
import { getPublishedProjectById, getRelatedProjects } from '@/lib/projects';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

const ProjectLightbox = dynamic(() => import('./ProjectLightbox'), {
  ssr: false,
  loading: () => <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-text-muted text-sm">Loading images...</div>
});
import { Technology, Repository, DemoURL } from '@/models/Project';

interface ProjectDetailsProps {
  id: string;
}

// Map categories to accent gradient
const getAccentGradient = (category: string): string => {
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

export default async function ProjectDetails({ id }: ProjectDetailsProps) {
  const project = await getPublishedProjectById(id);

  if (!project) {
    notFound();
  }

  const related = project.category
    ? await getRelatedProjects(project.category, project._id, 3)
    : [];

  const getRepositoryIcon = (type: string) => {
    switch (type) {
      case 'github': return <FaGithub className="w-4 h-4" />;
      case 'gitlab': return <FaGitlab className="w-4 h-4" />;
      case 'bitbucket': return <FaBitbucket className="w-4 h-4" />;
      default: return <FaGlobe className="w-4 h-4" />;
    }
  };

  const getRepoTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const mainRepo = project.repositories?.[0];
  const mainDemo = project.demoUrls?.[0];
  const accentClass = getAccentGradient(project.category);

  return (
    <div className="min-h-screen bg-cream font-body">
      <div className="pt-6">
        <Header />
      </div>

      <main className="max-w-[1200px] mx-auto px-6 flex flex-col gap-5">

        {/* Back to Projects */}
        <nav className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.08em] text-text-muted pt-14 pb-2">
          <Link href="/projects" className="text-text-muted no-underline hover:text-accent-orange transition-colors flex items-center gap-2 group">
            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Projects
          </Link>
        </nav>

        {/* Hero Card */}
        <div className="relative bg-off-white border border-cream-deeper rounded-2xl overflow-hidden">
          {/* Accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-[3px] ${accentClass}`} />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] min-h-[360px]">
            {/* Left - Project Info */}
            <div className="p-[2.2rem_2rem_2rem] flex flex-col gap-4 border-r-0 lg:border-r border-cream-deeper">
              {/* Category Badge */}
              <span className="inline-flex items-center gap-[0.4rem] font-mono text-[0.6rem] tracking-[0.12em] uppercase py-[0.22rem] px-3 rounded-full border border-cream-deeper bg-cream-dark text-warm-brown w-fit">
                {project.category}
              </span>

              {/* Title */}
              <h1 className="font-heading text-[clamp(1.7rem,4vw,2.6rem)] font-semibold leading-[1.1] text-ink">
                {project.title}
              </h1>

              {/* Short Description */}
              <p className="text-[0.88rem] leading-[1.8] text-warm-brown font-light max-w-[44ch]">
                {project.shortDescription}
              </p>

              {/* Tech Chips */}
              {project.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-[0.4rem]">
                  {project.technologies.slice(0, 6).map((tech: Technology, idx: number) => (
                    <span key={idx} className="font-mono text-[0.6rem] tracking-[0.03em] py-[0.18rem] px-[0.6rem] rounded-full border border-cream-deeper bg-cream-dark text-warm-brown">
                      {tech.name}
                    </span>
                  ))}
                  {project.technologies.length > 6 && (
                    <span className="font-mono text-[0.6rem] text-text-muted py-[0.18rem] px-[0.4rem]">
                      +{project.technologies.length - 6}
                    </span>
                  )}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex gap-3 flex-wrap mt-1">
                {mainRepo && (
                  <a
                    href={mainRepo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn relative inline-flex items-center gap-2 py-[0.55rem] px-5 rounded-full bg-ink text-off-white text-[0.84rem] font-medium no-underline border-[1.5px] border-ink overflow-hidden transition-all duration-250 hover:bg-deep-brown hover:border-deep-brown hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(42,33,24,0.2)]"
                  >
                    {getRepositoryIcon(mainRepo.type)}
                    View Source
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[130%] group-hover/btn:translate-x-[130%] transition-transform duration-500 pointer-events-none" />
                  </a>
                )}
                {mainDemo && (
                  <a
                    href={mainDemo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 py-[0.55rem] px-5 rounded-full bg-transparent text-accent-orange text-[0.84rem] font-medium no-underline border-[1.5px] border-accent-orange transition-all duration-250 hover:bg-accent-orange/[0.06] hover:-translate-y-px"
                  >
                    <FaExternalLinkAlt className="w-[14px] h-[14px]" />
                    Live Demo
                  </a>
                )}
              </div>
            </div>

            {/* Right - Screenshot */}
            <div className="relative overflow-hidden bg-gradient-to-br from-cream-deeper to-cream-dark min-h-[240px] lg:min-h-[360px]">
              {project.image ? (
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-contain object-center p-2 lg:p-3"
                  priority
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[3.5rem] opacity-[0.12]">
                  📁
                </div>
              )}
              {/* Live Badge */}
              {mainDemo && (
                <div className="absolute bottom-4 right-4 inline-flex items-center gap-[0.45rem] bg-off-white/95 backdrop-blur-[10px] border border-accent-teal/20 rounded-full py-[0.38rem] px-[0.9rem] text-[0.72rem] font-medium shadow-[0_3px_10px_rgba(74,55,40,0.1)]">
                  <span className="w-[7px] h-[7px] rounded-full bg-[#3ab07a] animate-pulse-dot" />
                  Live
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About this Project */}
        {project.description && (
          <div className="bg-off-white border border-cream-deeper rounded-[0.85rem] overflow-hidden">
            <div className="flex items-center gap-3 px-[1.6rem] py-[1.2rem] border-b border-cream-deeper">
              <div className="w-8 h-8 rounded-[0.45rem] flex items-center justify-center text-[0.9rem] bg-accent-orange/10">
                📋
              </div>
              <span className="font-heading text-[1.1rem] font-semibold text-ink">About this Project</span>
            </div>
            <div className="px-[1.6rem] py-[1.4rem]">
              <div className="prose prose-sm prose-compact max-w-none">
                <RichTextViewer
                  html={project.description}
                  lineSpacing={'10'}
                  className="
                    prose-headings:text-ink prose-headings:font-bold prose-headings:scroll-mt-24
                    prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-h4:text-sm
                    prose-p:text-warm-brown prose-p:text-[0.87rem] prose-p:leading-[1.8] prose-p:font-light prose-p:my-2
                    prose-strong:text-ink prose-strong:font-semibold
                    prose-a:text-accent-blue prose-a:underline-offset-2 hover:prose-a:underline
                    prose-img:rounded-xl prose-img:shadow-md prose-img:my-3
                    prose-blockquote:border-l-4 prose-blockquote:border-cream-deeper prose-blockquote:bg-cream-dark prose-blockquote:p-2 prose-blockquote:my-1 prose-blockquote:text-xs
                    prose-ul:my-1 prose-ol:my-1
                    prose-li:my-0.5 prose-li:text-[0.87rem] prose-li:text-warm-brown list-disc list-outside pl-5
                    prose-code:bg-cream-dark prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[12px]
                    prose-pre:bg-ink prose-pre:text-off-white prose-pre:p-3 prose-pre:rounded-xl prose-pre:my-2 prose-pre:text-[12px]
                    prose-em:text-warm-brown
                    prose-hr:border-cream-deeper prose-hr:my-1
                  "
                />
              </div>
            </div>
          </div>
        )}

        {/* Technologies */}
        {project.technologies?.length > 0 && (
          <div className="bg-off-white border border-cream-deeper rounded-[0.85rem] overflow-hidden">
            <div className="flex items-center gap-3 px-[1.6rem] py-[1.2rem] border-b border-cream-deeper">
              <div className="w-8 h-8 rounded-[0.45rem] flex items-center justify-center text-[0.9rem] bg-accent-blue/10">
                ⚙️
              </div>
              <span className="font-heading text-[1.1rem] font-semibold text-ink">Technologies</span>
            </div>
            <div className="px-[1.6rem] py-[1.4rem]">
              <div className="flex flex-wrap gap-[0.6rem]">
                {project.technologies.map((tech: Technology, idx: number) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 py-[0.4rem] px-[0.9rem] rounded-lg border border-cream-deeper bg-cream-dark transition-all duration-200 hover:border-sand hover:bg-cream-deeper cursor-default"
                  >
                    {tech.icon ? (
                      <img
                        src={tech.icon}
                        alt={`${tech.name} icon`}
                        className="w-[13px] h-[13px] object-contain"
                        onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <Code className="w-[13px] h-[13px] text-accent-orange flex-shrink-0" />
                    )}
                    <span className="font-mono text-[0.72rem] text-ink tracking-[0.02em]">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Repositories */}
        {project.repositories?.length > 0 && (
          <div className="bg-off-white border border-cream-deeper rounded-[0.85rem] overflow-hidden">
            <div className="flex items-center gap-3 px-[1.6rem] py-[1.2rem] border-b border-cream-deeper">
              <div className="w-8 h-8 rounded-[0.45rem] flex items-center justify-center text-[0.9rem] bg-deep-brown/[0.08]">
                🔗
              </div>
              <span className="font-heading text-[1.1rem] font-semibold text-ink">Repositories</span>
            </div>
            <div>
              {project.repositories.map((repo: Repository, index: number) => (
                <a
                  key={`repo-${index}`}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-[1.6rem] py-4 gap-4 border-b border-cream-deeper last:border-b-0 transition-colors duration-200 no-underline text-inherit hover:bg-cream/50 group/link"
                >
                  <div className="flex items-center gap-[0.85rem]">
                    <div className="w-9 h-9 rounded-lg border border-cream-deeper bg-cream-dark flex items-center justify-center flex-shrink-0">
                      <span className="text-warm-brown">{getRepositoryIcon(repo.type)}</span>
                    </div>
                    <div>
                      <div className="text-[0.88rem] font-medium text-ink">
                        {repo.name || `${getRepoTypeLabel(repo.type)} Repository`}
                      </div>
                      <div className="font-mono text-[0.6rem] text-text-muted tracking-[0.06em] mt-[0.18rem]">
                        {getRepoTypeLabel(repo.type)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-mono text-[0.58rem] tracking-[0.1em] uppercase py-[0.2rem] px-[0.65rem] rounded-full bg-deep-brown/[0.08] text-warm-brown border border-cream-deeper">
                      Public
                    </span>
                    <div className="w-7 h-7 rounded-full border border-cream-deeper bg-cream-dark flex items-center justify-center transition-all duration-200 group-hover/link:border-sand group-hover/link:bg-cream-deeper">
                      <FaExternalLinkAlt className="w-3 h-3 text-text-muted" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Demo Links */}
        {project.demoUrls?.length > 0 && (
          <div className="bg-off-white border border-cream-deeper rounded-[0.85rem] overflow-hidden">
            <div className="flex items-center gap-3 px-[1.6rem] py-[1.2rem] border-b border-cream-deeper">
              <div className="w-8 h-8 rounded-[0.45rem] flex items-center justify-center text-[0.9rem] bg-accent-teal/10">
                🌐
              </div>
              <span className="font-heading text-[1.1rem] font-semibold text-ink">Demo Links</span>
            </div>
            <div>
              {project.demoUrls.map((demo: DemoURL, index: number) => {
                const isLive = demo.type === 'live';
                return (
                  <a
                    key={`demo-${index}`}
                    href={demo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-[1.6rem] py-4 gap-4 border-b border-cream-deeper last:border-b-0 transition-colors duration-200 no-underline text-inherit hover:bg-cream/50 group/link"
                  >
                    <div className="flex items-center gap-[0.85rem]">
                      <div className="w-9 h-9 rounded-lg border border-cream-deeper bg-cream-dark flex items-center justify-center flex-shrink-0">
                        <FaGlobe className="w-4 h-4 text-warm-brown" />
                      </div>
                      <div>
                        <div className="text-[0.88rem] font-medium text-ink">
                          {demo.name || `${demo.type.charAt(0).toUpperCase() + demo.type.slice(1)} Site`}
                        </div>
                        <div className="font-mono text-[0.6rem] text-text-muted tracking-[0.06em] mt-[0.18rem]">
                          {demo.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`font-mono text-[0.58rem] tracking-[0.1em] uppercase py-[0.2rem] px-[0.65rem] rounded-full border ${
                        isLive
                          ? 'bg-[#3ab07a]/[0.12] text-[#2e8c5c] border-[#3ab07a]/25'
                          : 'bg-accent-blue/10 text-accent-blue border-accent-blue/25'
                      }`}>
                        {demo.type.charAt(0).toUpperCase() + demo.type.slice(1)}
                      </span>
                      <div className="w-7 h-7 rounded-full border border-cream-deeper bg-cream-dark flex items-center justify-center transition-all duration-200 group-hover/link:border-sand group-hover/link:bg-cream-deeper">
                        <FaExternalLinkAlt className="w-3 h-3 text-text-muted" />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Additional Images Gallery */}
        {project.additionalImages && project.additionalImages.length > 0 && (
          <div className="bg-off-white border border-cream-deeper rounded-[0.85rem] overflow-hidden">
            <div className="flex items-center gap-3 px-[1.6rem] py-[1.2rem] border-b border-cream-deeper">
              <div className="w-8 h-8 rounded-[0.45rem] flex items-center justify-center text-[0.9rem] bg-accent-blue/10">
                🖼️
              </div>
              <span className="font-heading text-[1.1rem] font-semibold text-ink">Project Gallery</span>
            </div>
            <div className="px-[1.6rem] py-[1.4rem]">
              <ProjectLightbox images={project.additionalImages} />
            </div>
          </div>
        )}

        {/* Related Projects */}
        {related.length > 0 && (
          <div className="bg-off-white border border-cream-deeper rounded-[0.85rem] overflow-hidden">
            <div className="flex items-center gap-3 px-[1.6rem] py-[1.2rem] border-b border-cream-deeper">
              <div className="w-8 h-8 rounded-[0.45rem] flex items-center justify-center text-[0.9rem] bg-accent-orange/10">
                ✦
              </div>
              <span className="font-heading text-[1.1rem] font-semibold text-ink">Related Projects</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-[1.4rem_1.6rem]">
              {related.map(p => {
                const relMainRepo = p.repositories?.[0];
                const relMainDemo = p.demoUrls?.[0];
                return (
                  <Link
                    key={p._id}
                    href={`/projects/${p.slug || p._id}`}
                    className="group/rel bg-cream-dark border border-cream-deeper rounded-[0.75rem] overflow-hidden no-underline text-inherit transition-all duration-300 hover:border-sand hover:shadow-[0_6px_18px_rgba(74,55,40,0.09)] hover:-translate-y-[2px]"
                  >
                    {/* Thumbnail */}
                    <div className="h-[110px] overflow-hidden relative bg-gradient-to-br from-[#d0c8b8] to-cream-deeper">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[2rem] opacity-[0.14]">
                          📁
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 font-mono text-[0.52rem] tracking-[0.08em] uppercase py-[0.15rem] px-[0.55rem] rounded-full bg-ink/70 text-white/85">
                        {p.category}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-[0.9rem_1rem]">
                      <div className="font-heading text-[1rem] font-semibold text-ink mb-[0.35rem] leading-[1.2] group-hover/rel:text-accent-orange transition-colors duration-200">
                        {p.title}
                      </div>
                      <div className="text-[0.76rem] text-text-muted leading-[1.6] font-light line-clamp-2 mb-[0.6rem]">
                        {p.shortDescription}
                      </div>
                      <div className="flex flex-wrap gap-[0.3rem] items-center mb-3">
                        {p.technologies?.slice(0, 3).map((tech: Technology, i: number) => (
                          <span key={i} className="font-mono text-[0.54rem] py-[0.12rem] px-[0.5rem] rounded-full border border-cream-deeper bg-off-white text-warm-brown">
                            {tech.name}
                          </span>
                        ))}
                        {p.technologies && p.technologies.length > 3 && (
                          <span className="font-mono text-[0.54rem] text-text-muted">
                            +{p.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-[0.55rem] px-4 py-[0.65rem] border-t border-cream-deeper">
                      {relMainRepo && (
                        <span className="inline-flex items-center gap-[0.28rem] text-[0.72rem] font-medium text-text-muted">
                          <FaGithub className="w-[11px] h-[11px]" /> Code
                        </span>
                      )}
                      {relMainRepo && relMainDemo && (
                        <div className="w-px bg-cream-deeper" />
                      )}
                      {relMainDemo && (
                        <span className="inline-flex items-center gap-[0.28rem] text-[0.72rem] font-medium text-text-muted">
                          <FaExternalLinkAlt className="w-[11px] h-[11px]" /> Demo
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* No Related Projects */}
        {related.length === 0 && (
          <div className="bg-off-white border border-cream-deeper rounded-[0.85rem] overflow-hidden text-center py-8 px-6">
            <span className="font-heading text-[1.1rem] font-semibold text-ink block mb-2">Related Projects</span>
            <p className="text-[0.85rem] text-text-muted font-light mb-3">No related projects found.</p>
            <Link href="/projects" className="inline-flex items-center gap-1 text-accent-orange text-[0.84rem] font-medium no-underline hover:underline">
              Browse Projects <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
