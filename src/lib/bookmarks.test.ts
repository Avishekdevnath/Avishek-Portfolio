import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { connectDB, disconnectDB } from '@/lib/mongodb';
import BookmarkedJob from '@/models/BookmarkedJob';
import PlatformList from '@/models/PlatformList';

describe('Bookmark Models & Database', () => {
  beforeEach(async () => {
    await connectDB();
    // Clear collections
    await BookmarkedJob.deleteMany({});
    await PlatformList.deleteMany({});
  });

  afterEach(async () => {
    await disconnectDB();
  });

  describe('BookmarkedJob Model', () => {
    it('should create a bookmark with all required fields', async () => {
      const bookmark = await BookmarkedJob.create({
        jobTitle: 'Senior React Developer',
        company: 'TechCorp',
        platform: 'linkedin',
        jobUrl: 'https://linkedin.com/jobs/123',
        status: 'saved',
        userId: 'user123',
      });

      expect(bookmark).toBeDefined();
      expect(bookmark.jobTitle).toBe('Senior React Developer');
      expect(bookmark.status).toBe('saved');
      expect(bookmark.bookmarkedDate).toBeDefined();
    });

    it('should validate required fields', async () => {
      expect(async () => {
        await BookmarkedJob.create({
          company: 'TechCorp',
          platform: 'linkedin',
        });
      }).rejects.toThrow();
    });

    it('should calculate daysBookmarked', async () => {
      const today = new Date();
      const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);

      const bookmark = await BookmarkedJob.create({
        jobTitle: 'Dev Role',
        company: 'Corp',
        platform: 'linkedin',
        jobUrl: 'https://example.com',
        status: 'saved',
        userId: 'user123',
        bookmarkedDate: threeDaysAgo,
      });

      expect(bookmark.daysBookmarked).toBeLessThanOrEqual(3);
    });

    it('should filter by status', async () => {
      await BookmarkedJob.create({
        jobTitle: 'Job 1',
        company: 'Corp1',
        platform: 'linkedin',
        jobUrl: 'https://example1.com',
        status: 'saved',
        userId: 'user123',
      });

      await BookmarkedJob.create({
        jobTitle: 'Job 2',
        company: 'Corp2',
        platform: 'indeed',
        jobUrl: 'https://example2.com',
        status: 'applied',
        userId: 'user123',
      });

      const saved = await BookmarkedJob.find({
        userId: 'user123',
        status: 'saved',
      });

      expect(saved.length).toBe(1);
      expect(saved[0].jobTitle).toBe('Job 1');
    });
  });

  describe('PlatformList Model', () => {
    it('should create a platform entry', async () => {
      const platform = await PlatformList.create({
        name: 'linkedin',
        description: 'LinkedIn Jobs',
        url: 'https://linkedin.com/jobs',
      });

      expect(platform.name).toBe('linkedin');
      expect(platform.url).toBe('https://linkedin.com/jobs');
    });

    it('should enforce unique platform names', async () => {
      await PlatformList.create({
        name: 'linkedin',
        description: 'LinkedIn Jobs',
      });

      expect(async () => {
        await PlatformList.create({
          name: 'linkedin',
          description: 'Another LinkedIn',
        });
      }).rejects.toThrow();
    });
  });
});
