import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Globe, Code, X, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { Project } from "@/types/dashboard";
import ProjectCard from '@/components/ProjectCard';
import RichTextViewer from '@/components/shared/RichTextViewer';
import { FaGithub, FaGitlab, FaBitbucket, FaGlobe } from 'react-icons/fa';
import { getPublishedProjectById, getRelatedProjects } from '@/lib/projects';
import { notFound } from 'next/navigation';

interface ProjectDetailsProps {
  id: string;
}

export default async function ProjectDetails({ id }: ProjectDetailsProps) {
  // Get project data directly from database (no HTTP calls)
  const project = await getPublishedProjectById(id);
  
  if (!project) {
    notFound();
  }

  // Get related projects
  const related = project.category 
    ? await getRelatedProjects(project.category, project._id, 3)
    : [];

  // kept for potential future use (e.g., timeline/metadata)

  const getRepositoryIcon = (type: string) => {
    switch (type) {
      case 'github':
        return <FaGithub className="w-4 h-4" />;
      case 'gitlab':
        return <FaGitlab className="w-4 h-4" />;
      case 'bitbucket':
        return <FaBitbucket className="w-4 h-4" />;
      default:
        return <FaGlobe className="w-4 h-4" />;
    }
  };


  const mainRepo = project.repositories?.[0];
  const mainDemo = project.demoUrls?.[0];
  const images = project?.additionalImages || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 font-ui">
        <Header />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="relative z-10 mx-4 mb-6 bg-white rounded-xl p-6 border border-black shadow-sm box-border overflow-visible">

        {/* Project Header - Two Column Layout */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column - Project Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-h2 font-bold text-gray-900 leading-tight mb-3">
                  {project?.title}
                </h1>
              {project?.category && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 ring-1 ring-gray-200 mb-4">
                  {project.category}
                </span>
              )}
                <p className="text-body text-gray-700 leading-relaxed">
                {project.shortDescription}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project?.technologies?.slice(0, 6).map((tech, idx) => (
                  <span key={idx} className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-700 ring-1 ring-gray-200">
                    {tech.name}
                  </span>
                ))}
                {project?.technologies && project.technologies.length > 6 && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700">
                    +{project.technologies.length - 6}
                  </span>
                )}
              </div>
              </div>
              
              {/* Project Meta (removed per UX refinement) */}
        
              {/* Primary Actions */}
              <div className="flex flex-wrap gap-2">
                  {mainRepo && (
                    <a
                      href={mainRepo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm focus-visible:outline-none focus-visible:ring-2 ring-offset-2 ring-blue-500"
                    aria-label={`View source on ${mainRepo.type}`}
                    >
                      {getRepositoryIcon(mainRepo.type)}
                    <span>View Source</span>
                    </a>
                  )}
                  {mainDemo && (
                    <a
                      href={mainDemo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm focus-visible:outline-none focus-visible:ring-2 ring-offset-2 ring-blue-500"
                    aria-label="Open live demo in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>

                {/* Technologies */}
              {project?.technologies && project.technologies.length > 0 && (
                <div>
                  <h3 className="text-h6 font-semibold text-gray-900 mb-3">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const maxTech = 6;
                      const techs = project.technologies || [];
                      const visible = techs.slice(0, maxTech);
                      const overflow = techs.length - visible.length;
                      return (
                        <>
                          {visible.map((tech, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg ring-1 ring-gray-200 transition-colors duration-200 hover:bg-white"
                            >
                              {tech.icon ? (
                                <img 
                                  src={tech.icon} 
                                  alt={`${tech.name} icon`}
                                  className="w-4 h-4 object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Code className="w-4 h-4 text-blue-500" />
                              )}
                              <span className="text-xs font-medium text-gray-700">{tech.name}</span>
                            </div>
                          ))}
                          {overflow > 0 && (
                            <span className="inline-flex items-center rounded-full bg-gray-50 ring-1 ring-gray-200 px-3 py-2 text-xs font-medium text-gray-700">+{overflow}</span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Project Image */}
            {project?.image && (
              <div className="relative">
                <div className="rounded-2xl p-[2px] bg-black shadow-md">
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-white ring-1 ring-gray-200">
                  <Image
                    src={project.image}
                    alt={project?.title || 'Project Image'}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 hover:opacity-60 transition-opacity duration-300"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Description */}
          <div className="mb-8">
          <div className="bg-white rounded-xl p-6 border border-black shadow-sm">
            <h2 className="text-h5 font-semibold text-gray-900 mb-6">About this Project</h2>
            <div className="prose prose-sm prose-compact max-w-none font-prose">
            <RichTextViewer
              html={project?.description || ''}
              lineSpacing={'10'}
              className="
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-headings:scroll-mt-24
                prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-h4:text-sm prose-h1:my-1 prose-h2:my-1 prose-h3:my-1 prose-h4:my-0 prose-headings:leading-tight
                prose-p:text-gray-700 prose-p:text-base prose-p:leading-relaxed prose-p:my-2
                prose-a:text-blue-600 prose-a:underline-offset-2 hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-md prose-img:my-3
                prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:bg-gray-50 prose-blockquote:p-2 prose-blockquote:my-1 prose-blockquote:text-xs
                prose-ul:my-1 prose-ol:my-1
                prose-li:my-0.5 prose-li:text-base list-disc list-outside pl-5
                prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[12px]
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-3 prose-pre:rounded-xl prose-pre:my-2 prose-pre:text-[12px]
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-em:text-gray-700
                prose-hr:border-gray-200 prose-hr:my-1
              "
            />
            </div>
          </div>
        </div>


        {/* Repositories */}
                {project.repositories?.length > 0 && (
                  <div className="mb-8">
            <div className="bg-white rounded-xl p-6 border border-black shadow-sm">
              <h3 className="text-h5 font-semibold text-gray-900 mb-4">Repositories</h3>
              <div className="space-y-3">
                      {project.repositories.map((repo, index) => (
                        <a
                          key={`repo-${index}`}
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                    className="flex items-center p-4 bg-white rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 ring-offset-2 ring-blue-500"
                        >
                    <div className="mr-3 text-gray-600 group-hover:text-blue-600 transition-colors">
                            {getRepositoryIcon(repo.type)}
                          </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {repo.name || `${repo.type.charAt(0).toUpperCase() + repo.type.slice(1)} Repository`}
                            </div>
                      <div className="text-xs text-gray-500 capitalize">{repo.type}</div>
                          </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </a>
                      ))}
              </div>
                    </div>
                  </div>
                )}

        {/* Demo Links */}
                {project.demoUrls?.length > 0 && (
                  <div className="mb-8">
            <div className="bg-white rounded-xl p-6 border border-black shadow-sm">
              <h3 className="text-h5 font-semibold text-gray-900 mb-4">Demo Links</h3>
              <div className="space-y-3">
                {project.demoUrls.map((demo, index) => {
                  const getDemoBadgeColor = (type: string) => {
                    switch (type) {
                      case 'live': return 'bg-green-50 text-green-800 ring-1 ring-green-200';
                      case 'staging': return 'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200';
                      case 'demo': return 'bg-blue-50 text-blue-800 ring-1 ring-blue-200';
                      case 'documentation': return 'bg-purple-50 text-purple-800 ring-1 ring-purple-200';
                      default: return 'bg-gray-50 text-gray-800 ring-1 ring-gray-200';
                    }
                  };
                  
                  return (
                        <a
                          key={`demo-${index}`}
                          href={demo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                      className="flex items-center p-4 bg-white rounded-lg ring-1 ring-gray-200 hover:bg-gray-50 transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 ring-offset-2 ring-blue-500"
                      aria-label={`Open ${demo.type} link in new tab`}
                    >
                      <Globe className="w-4 h-4 mr-3 text-gray-600 group-hover:text-green-600 transition-colors" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                          {demo.name || `${demo.type.charAt(0).toUpperCase() + demo.type.slice(1)} Demo`}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDemoBadgeColor(demo.type)}`}>
                            {demo.type.charAt(0).toUpperCase() + demo.type.slice(1)}
                          </span>
                            </div>
                          </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                        </a>
                  );
                })}
              </div>
                    </div>
                  </div>
                )}

        {/* Additional Images Gallery */}
        {project.additionalImages && project.additionalImages.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-xl p-6 border border-black shadow-sm">
              <h3 className="text-h5 font-semibold text-gray-900 mb-6">Project Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.additionalImages.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
                    className="group relative overflow-hidden rounded-xl transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={image.url}
                        alt={image.altText || `Project image ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-3 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                          <p className="text-sm font-medium">{image.caption}</p>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Related Projects */}
        {related.length > 0 ? (
          <div className="mt-12">
            <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200 shadow-sm">
              <h2 className="text-h4 font-semibold text-gray-900 mb-6">Related Projects</h2>
              {relatedLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {related.map(p => (
                    <ProjectCard key={p._id} project={p} />
                  ))}
              </div>
            )}
          </div>
        </div>
        ) : (
          <div className="mt-12">
            <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200 shadow-sm text-center text-gray-600">
              <h2 className="text-h5 font-semibold text-gray-900 mb-2">Related Projects</h2>
              <p className="text-sm">No related projects found. Explore more on the projects page.</p>
              <Link href="/projects" className="inline-flex items-center mt-3 text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 ring-offset-2 ring-blue-500 rounded-md px-2 py-1">
                Browse Projects
              </Link>
            </div>
          </div>
        )}
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      {lightboxOpen && images.length ? (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Project image viewer"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
            if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % images.length);
          }}
          tabIndex={-1}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 ring-offset-2 ring-white/50"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
            autoFocus
          >
            <X className="w-6 h-6" />
          </button>
          <button
            type="button"
            className="absolute left-4 text-white hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 ring-offset-2 ring-white/50"
            onClick={() => setLightboxIndex((prev) => (prev - 1 + images.length) % images.length)}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            className="absolute right-4 text-white hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 ring-offset-2 ring-white/50"
            onClick={() => setLightboxIndex((prev) => (prev + 1) % images.length)}
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="relative w-[90vw] max-w-4xl aspect-video">
            <Image
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].altText || `Project image ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>
          {images[lightboxIndex]?.caption && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white bg-black/60 px-3 py-1 rounded text-sm">
              {images[lightboxIndex].caption}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
} 