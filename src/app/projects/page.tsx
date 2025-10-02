import ProjectGrid from '@/components/ProjectGrid';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
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
      limit: 50, // Get more projects for the main page
      sortBy: 'order',
      sortOrder: 'asc'
    });

    if (!projects || projects.length === 0) {
      // If no projects found, show empty state instead of 404
      return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
          <div className="pt-6">
            <Header />
          </div>
          
          <main className="relative">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Browse My Recent</h4>
                  <h1 className="text-h3 md:text-h2 weight-bold text-gray-900 mb-6">
                    Projects
                  </h1>
                  <p className="text-body-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    No projects available at the moment. Check back soon for new projects!
                  </p>
                </div>
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
        <div className="pt-6">
          <Header />
        </div>
        
        <main className="relative">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-7xl mx-auto">
              {/* Page Title */}
              <div className="text-center mb-12">
                <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Browse My Recent</h4>
                <h1 className="text-h3 md:text-h2 weight-bold text-gray-900 mb-6">
                  Projects
                </h1>
                <p className="text-body-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Explore a curated selection of my shipped work across web apps, tools, and experiments. Use search and filters to quickly find projects by technology, category, or status.
                </p>
              </div>

              {/* Projects Grid */}
              <ProjectGrid projects={projects} />
            </div>
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
