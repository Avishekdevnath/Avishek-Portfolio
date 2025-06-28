import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}

export function generateMetadata({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  tags,
}: SEOProps): Metadata {
  // Base metadata
  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type,
      url,
      siteName: 'Avishek Portfolio',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };

  // Add image if provided
  if (image) {
    metadata.openGraph.images = [image];
    metadata.twitter.images = [image];
  }

  // Add article specific metadata
  if (type === 'article') {
    metadata.openGraph.type = 'article';
    metadata.openGraph.article = {
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      tags,
    };
  }

  // Add robots meta
  metadata.robots = {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };

  // Add JSON-LD structured data
  metadata.other = {
    'script:ld+json': [
      {
        '@context': 'https://schema.org',
        '@type': type === 'article' ? 'BlogPosting' : 'WebPage',
        headline: title,
        description,
        image: image ? [image] : undefined,
        datePublished: publishedTime,
        dateModified: modifiedTime,
        author: author ? {
          '@type': 'Person',
          name: author,
        } : undefined,
      },
    ],
  };

  return metadata;
} 