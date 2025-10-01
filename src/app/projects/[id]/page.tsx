import ProjectDetails from '@/components/ProjectDetails';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  // Return empty array to enable dynamic rendering
  // This prevents build-time static generation issues
  return [];
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

    // Use absolute URL for fetch to work in both dev and production
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${base}/api/projects/${params.id}`;
    
    // Add timeout and better error handling for Vercel
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`Failed to fetch project metadata for ${params.id}: ${response.status}`);
      return {
        title: 'Project Details',
        description: 'Project details and information.',
      };
    }

    const { success, data } = await response.json();
    
    if (!success || !data) {
      console.warn(`Invalid project data for ${params.id}`);
      return {
        title: 'Project Details',
        description: 'Project details and information.',
      };
    }

    return {
      title: data.title || 'Project Details',
      description: data.shortDescription || data.description || 'Project details and information.',
      openGraph: {
        title: data.title || 'Project Details',
        description: data.shortDescription || data.description || 'Project details and information.',
        type: 'website',
        images: data.image ? [data.image] : undefined,
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
