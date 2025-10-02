/**
 * Get the base URL for the application
 * Handles different environments (development, Vercel, custom domain)
 * @returns Base URL string
 */
export function getBaseUrl(): string {
  // In production on Vercel, use the deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Use custom domain if set
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Fallback to localhost for development
  return 'http://localhost:3000';
}

/**
 * Get the canonical site URL
 * @returns Canonical site URL
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://avishekdevnath.vercel.app';
}
