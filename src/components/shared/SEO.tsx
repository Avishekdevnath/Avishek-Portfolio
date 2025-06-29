import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'book' | 'profile';
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
      siteName: 'Avishek Portfolio',
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };

  // Add image if provided
  if (image) {
    if (!metadata.openGraph) {
      metadata.openGraph = {};
    }
    if (!metadata.twitter) {
      metadata.twitter = {};
    }
    metadata.openGraph.images = [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: title,
      }
    ];
    metadata.twitter.images = [image];
  }

  // Add article specific metadata
  if (type === 'article' && metadata.openGraph) {
    metadata.openGraph = {
      ...metadata.openGraph,
      ...{
        title,
        description,
        siteName: 'Avishek Portfolio',
        url,
        images: metadata.openGraph.images,
        type: 'article',
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
        tags,
      }
    };
  } else if (metadata.openGraph) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'website'
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

  // Create JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'BlogPosting' : 'WebPage',
    headline: title,
    description,
    image: image ? [image] : undefined,
    datePublished: publishedTime,
    dateModified: modifiedTime,
  };

  // Add JSON-LD to metadata
  metadata.other = {
    'script:ld+json': JSON.stringify(jsonLd),
  };

  return metadata;
} 