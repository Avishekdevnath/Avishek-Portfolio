import { IBookmarkedJob, BookmarkStatus } from '@/models/BookmarkedJob';

/**
 * Get platform statistics across all bookmarks
 * Returns count of bookmarks grouped by platform and status
 */
export function getPlatformStats(bookmarks: IBookmarkedJob[]) {
  const stats: Record<string, Record<BookmarkStatus, number>> = {};

  bookmarks.forEach((bookmark) => {
    if (!stats[bookmark.platform]) {
      stats[bookmark.platform] = {
        saved: 0,
        applied: 0,
        discarded: 0,
      };
    }
    stats[bookmark.platform][bookmark.status]++;
  });

  return stats;
}

/**
 * Validate bookmark URL format
 * Uses URL constructor for validation
 */
export function validateBookmarkUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate payload for converting bookmark to application
 * Extracts relevant fields from bookmark for application creation
 */
export function generateConvertToApplicationPayload(bookmark: IBookmarkedJob) {
  return {
    company: bookmark.company,
    jobTitle: bookmark.jobTitle,
    jobUrl: bookmark.jobUrl,
    platform: bookmark.platform,
    dateApplied: new Date(),
    status: 'Applied',
    notes: bookmark.notes ? `(Bookmarked: ${bookmark.notes})` : undefined,
  };
}

/**
 * Escape special regex characters for safe pattern matching
 * Prevents regex injection in search queries
 */
export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Create MongoDB regex query for full-text search
 * Searches multiple fields with case-insensitive matching
 */
export function createSearchQuery(query: string, fields: string[]) {
  if (!query || !fields.length) {
    return {};
  }

  const regex = new RegExp(escapeRegex(query), 'i');
  return {
    $or: fields.map((field) => ({
      [field]: regex,
    })),
  };
}

/**
 * Format bookmark for API response
 * Includes computed fields like daysBookmarked
 */
export function formatBookmarkResponse(bookmark: IBookmarkedJob) {
  const daysBookmarked = Math.floor(
    (Date.now() - bookmark.bookmarkedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    _id: bookmark._id,
    jobTitle: bookmark.jobTitle,
    company: bookmark.company,
    platform: bookmark.platform,
    jobUrl: bookmark.jobUrl,
    notes: bookmark.notes || null,
    status: bookmark.status,
    linkedApplicationId: bookmark.linkedApplicationId || null,
    bookmarkedDate: bookmark.bookmarkedDate,
    statusChangedDate: bookmark.statusChangedDate || null,
    daysBookmarked,
    createdAt: bookmark.createdAt,
    updatedAt: bookmark.updatedAt,
  };
}
