import { describe, it, expect } from 'vitest';
import {
  validateBookmarkData,
  parseJobUrl,
  calculateDaysBookmarked,
  normalizeDataForExport,
} from '@/lib/bookmark-utils';

describe('Bookmark Utilities', () => {
  describe('validateBookmarkData', () => {
    it('should validate correct bookmark data', () => {
      const data = {
        jobTitle: 'Senior Dev',
        company: 'Tech Corp',
        platform: 'linkedin',
        jobUrl: 'https://linkedin.com/jobs/123',
      };

      const result = validateBookmarkData(data);
      expect(result.valid).toBe(true);
    });

    it('should reject missing required fields', () => {
      const data = {
        jobTitle: 'Senior Dev',
        company: 'Tech Corp',
        // missing platform and jobUrl
      };

      const result = validateBookmarkData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it('should reject invalid URL', () => {
      const data = {
        jobTitle: 'Senior Dev',
        company: 'Tech Corp',
        platform: 'linkedin',
        jobUrl: 'not-a-url',
      };

      const result = validateBookmarkData(data);
      expect(result.valid).toBe(false);
      expect(result.errors?.[0]).toContain('URL');
    });
  });

  describe('parseJobUrl', () => {
    it('should extract platform from LinkedIn URL', () => {
      const platform = parseJobUrl('https://linkedin.com/jobs/123456789');
      expect(platform).toBe('linkedin');
    });

    it('should handle Indeed URLs', () => {
      const platform = parseJobUrl('https://indeed.com/viewjob?jk=abc123');
      expect(platform).toBe('indeed');
    });

    it('should return others for unknown platforms', () => {
      const platform = parseJobUrl('https://example.com/jobs/123');
      expect(platform).toBe('others');
    });
  });

  describe('calculateDaysBookmarked', () => {
    it('should return correct number of days', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const days = calculateDaysBookmarked(twoDaysAgo);
      expect(days).toBeLessThanOrEqual(2);
      expect(days).toBeGreaterThanOrEqual(1);
    });

    it('should return 0 for today', () => {
      const today = new Date();
      const days = calculateDaysBookmarked(today);
      expect(days).toBe(0);
    });
  });

  describe('normalizeDataForExport', () => {
    it('should format bookmark for CSV export', () => {
      const bookmark = {
        jobTitle: 'Senior Dev',
        company: 'Tech Corp',
        platform: 'linkedin',
        jobUrl: 'https://example.com',
        status: 'saved',
        bookmarkedDate: new Date('2024-01-15'),
      };

      const exported = normalizeDataForExport([bookmark]);
      expect(exported[0]).toHaveProperty('jobTitle');
      expect(exported[0]).toHaveProperty('company');
      expect(exported[0]).toHaveProperty('platform');
    });
  });
});
