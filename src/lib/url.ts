const DEFAULT_PRODUCTION_SITE_URL = 'https://www.avishekdevnath.com';

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Get the base URL for the application
 * Handles different environments (development, Vercel, custom domain)
 * @returns Base URL string
 */
export function getBaseUrl(): string {
  // Prefer explicit custom domain configuration
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return normalizeUrl(process.env.NEXT_PUBLIC_BASE_URL);
  }

  // In Vercel environments, use deployment URL as runtime fallback
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback to localhost for development
  return 'http://localhost:3000';
}

/**
 * Get the canonical site URL used in metadata/sitemaps/crawl files.
 * This should always point to the primary public domain in production.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return normalizeUrl(process.env.NEXT_PUBLIC_BASE_URL);
  }

  if (process.env.NODE_ENV === 'production') {
    return DEFAULT_PRODUCTION_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}
