import ProjectGrid from '@/components/ProjectGrid';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import PageReadyOnMount from '@/components/shared/PageReadyOnMount';
import { getPublishedProjects } from '@/lib/projects';
import { notFound } from 'next/navigation';

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

// Declare Node.js runtime for MongoDB access
export const runtime = 'nodejs';

export default async function ProjectsPage() {
  try {
    // Get projects directly from database (no HTTP calls)
    const projects = await getPublishedProjects({
      limit: 50,
      sortBy: 'order',
      sortOrder: 'asc'
    });

    if (!projects || projects.length === 0) {
      return (
        <div className="min-h-screen bg-cream font-body">
          <div className="pt-6">
            <Header />
          </div>

          <main className="relative">
            <div className="max-w-[1100px] mx-auto px-6 py-16">
              <div className="text-center mb-12">
                <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3 before:content-[''] before:w-8 before:h-px before:bg-accent-orange/50 after:content-[''] after:w-8 after:h-px after:bg-accent-orange/50">
                  Browse My Recent
                </p>
                <h1 className="font-heading text-[clamp(2.2rem,5vw,3.6rem)] font-light leading-[1.05] text-ink mb-4">
                  My <em className="italic text-warm-brown">Projects</em>
                </h1>
                <p className="text-[0.9rem] text-text-muted max-w-[60ch] mx-auto leading-[1.75] font-light">
                  No projects available at the moment. Check back soon for new projects!
                </p>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-cream font-body">
        <div className="pt-6">
          <Header />
        </div>

        <main className="relative">
          <PageReadyOnMount />
          <div className="max-w-[1100px] mx-auto px-6 py-16">
            {/* Page Title */}
            <div className="text-center mb-12">
              <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3 before:content-[''] before:w-8 before:h-px before:bg-accent-orange/50 after:content-[''] after:w-8 after:h-px after:bg-accent-orange/50">
                Browse My Recent
              </p>
              <h1 className="font-heading text-[clamp(2.2rem,5vw,3.6rem)] font-light leading-[1.05] text-ink mb-4">
                My <em className="italic text-warm-brown">Projects</em>
              </h1>
              <p className="text-[0.9rem] text-text-muted max-w-[60ch] mx-auto leading-[1.75] font-light">
                Explore a curated selection of shipped work across web apps, tools, and experiments. Filter by technology, category, or status.
              </p>
            </div>

            {/* Projects Grid */}
            <ProjectGrid projects={projects} />
          </div>
        </main>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error loading projects:', error);
    notFound();
  }
}
