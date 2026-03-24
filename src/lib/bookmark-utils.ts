// Validation & Utility Functions for Bookmarks

interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export function validateBookmarkData(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.jobTitle?.trim()) errors.push('Job title is required');
  if (!data.company?.trim()) errors.push('Company is required');
  if (!data.platform) errors.push('Platform is required');
  if (!data.jobUrl?.trim()) errors.push('Job URL is required');

  // Validate URL format
  if (data.jobUrl) {
    try {
      new URL(data.jobUrl);
    } catch {
      errors.push('Invalid URL format');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function parseJobUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname.includes('linkedin')) return 'linkedin';
    if (hostname.includes('indeed')) return 'indeed';
    if (hostname.includes('glassdoor')) return 'glassdoor';
    if (hostname.includes('github')) return 'github jobs';
    if (hostname.includes('angellist')) return 'angellist';
    if (hostname.includes('buildin')) return 'buildin';
    if (hostname.includes('wellfound')) return 'wellfound';
    if (hostname.includes('stackoverflow')) return 'stack overflow jobs';
    if (hostname.includes('remoteok')) return 'remoteok';
    if (hostname.includes('weworkremotely')) return 'weworkremotely';

    return 'others';
  } catch {
    return 'others';
  }
}

export function calculateDaysBookmarked(bookmarkedDate: Date): number {
  const today = new Date();
  const date = new Date(bookmarkedDate);

  const diffMs = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function normalizeDataForExport(bookmarks: any[]): any[] {
  return bookmarks.map((bookmark) => ({
    'Job Title': bookmark.jobTitle,
    Company: bookmark.company,
    Platform: bookmark.platform.charAt(0).toUpperCase() + bookmark.platform.slice(1),
    'Job URL': bookmark.jobUrl,
    Status: bookmark.status.charAt(0).toUpperCase() + bookmark.status.slice(1),
    'Bookmarked Date': new Date(bookmark.bookmarkedDate).toISOString().split('T')[0],
    Notes: bookmark.notes || '',
  }));
}

export function calculatePlatformStats(bookmarks: any[]): Record<string, any> {
  const stats: Record<string, any> = {};

  bookmarks.forEach((bookmark) => {
    const platform = bookmark.platform.toLowerCase();

    if (!stats[platform]) {
      stats[platform] = {
        saved: 0,
        applied: 0,
        discarded: 0,
      };
    }

    stats[platform][bookmark.status]++;
  });

  return stats;
}

export function groupBookmarksByPlatform(bookmarks: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};

  bookmarks.forEach((bookmark) => {
    const platform = bookmark.platform.toLowerCase();

    if (!grouped[platform]) {
      grouped[platform] = [];
    }

    grouped[platform].push(bookmark);
  });

  return grouped;
}

export function getBookmarkSummary(bookmarks: any[]) {
  return {
    total: bookmarks.length,
    saved: bookmarks.filter((b) => b.status === 'saved').length,
    applied: bookmarks.filter((b) => b.status === 'applied').length,
    discarded: bookmarks.filter((b) => b.status === 'discarded').length,
    platforms: Object.keys(calculatePlatformStats(bookmarks)),
  };
}
