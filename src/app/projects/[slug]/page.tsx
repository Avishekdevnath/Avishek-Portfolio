import ProjectDetails from '@/components/ProjectDetails';
import PageReadyOnMount from '@/components/shared/PageReadyOnMount';
import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { resolvePublishedProjectRouteFromDB, listProjectSlugs, getPublishedProjectById } from '@/lib/projects';
import { getSiteUrl } from '@/lib/url';

interface Props {
  params: {
    slug: string;
  };
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

// Declare Node.js runtime for MongoDB access
export const runtime = 'nodejs';

export async function generateStaticParams() {
  try {
    const slugs = await listProjectSlugs(200);
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.warn('Error generating static params for projects:', error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolved = await resolvePublishedProjectRouteFromDB(params.slug);

    if (resolved.kind === 'missing') {
      return {
        title: 'Project Not Found',
        description: 'The requested project could not be found.',
      };
    }

    const project = await getPublishedProjectById(resolved.project._id);

    if (!project) {
      return {
        title: 'Project Not Found',
        description: 'The requested project could not be found.',
      };
    }

    const title = `${project.title} – Portfolio`;
    const description = project.shortDescription || project.description || 'Project details and information.';
    const siteUrl = getSiteUrl();
    const ogImage = project.image ? `${siteUrl}${project.image}` : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/projects/${resolved.slug}`,
        type: 'article',
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
      alternates: {
        canonical: `${siteUrl}/projects/${resolved.slug}`,
      },
    };
  } catch (error) {
    console.warn(`Error generating metadata for project ${params?.slug}:`, error);
    return {
      title: 'Project Details',
      description: 'Project details and information.',
    };
  }
}

export default async function ProjectPage({ params }: Props) {
  const resolved = await resolvePublishedProjectRouteFromDB(params.slug);

  if (resolved.kind === 'missing') {
    notFound();
  }

  if (resolved.kind === 'redirect') {
    permanentRedirect(`/projects/${resolved.slug}`);
  }

  return (
    <>
      <PageReadyOnMount />
      <ProjectDetails id={resolved.project._id} />
    </>
  );
}
