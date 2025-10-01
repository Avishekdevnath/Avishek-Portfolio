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
    // Use relative URL by default so it works on any host/port (dev/prod)
    const base = process.env.NEXT_PUBLIC_BASE_URL || '';
    const url = `${base}/api/projects/${params.id}`;
    const response = await fetch(url, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return {
        title: 'Project Details',
        description: 'Project details and information.',
      };
    }

    const { success, data } = await response.json();
    
    if (!success || !data) {
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
