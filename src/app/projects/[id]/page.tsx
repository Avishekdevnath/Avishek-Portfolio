import ProjectDetails from '@/components/ProjectDetails';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedProjectById, listProjectIds } from '@/lib/projects';
import { getSiteUrl } from '@/lib/url';

interface Props {
  params: {
    id: string;
  };
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

// Declare Node.js runtime for MongoDB access
export const runtime = 'nodejs';

export async function generateStaticParams() {
  try {
    const projectIds = await listProjectIds(200);
    return projectIds.map((id) => ({
      id: String(id),
    }));
  } catch (error) {
    console.warn('Error generating static params for projects:', error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Validate params.id exists and is a string
    if (!params?.id || typeof params.id !== 'string') {
      return {
        title: 'Project Details',
        description: 'Project details and information.',
      };
    }

    // Get project data directly from database (no HTTP calls)
    const project = await getPublishedProjectById(params.id);
    
    if (!project) {
      return {
        title: 'Project Not Found',
        description: 'The requested project could not be found.',
      };
    }

    const title = `${project.title} – Portfolio`;
    const description = project.shortDescription || project.description || 'Project details and information.';
    const siteUrl = getSiteUrl();
    
    // Build OpenGraph image URL
    const ogImage = project.image ? `${siteUrl}${project.image}` : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/projects/${params.id}`,
        type: 'article',
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
    };
  } catch (error) {
    console.warn(`Error generating metadata for project ${params?.id}:`, error);
    return {
      title: 'Project Details',
      description: 'Project details and information.',
    };
  }
}

export default function ProjectPage({ params }: Props) {
  // Validate params.id exists and is a string
  if (!params?.id || typeof params.id !== 'string') {
    notFound();
  }

  return <ProjectDetails id={params.id} />;
}
