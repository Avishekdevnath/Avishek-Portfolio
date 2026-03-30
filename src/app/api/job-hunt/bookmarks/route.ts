import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BookmarkedJob } from '@/models/BookmarkedJob';
import { PlatformList } from '@/models/PlatformList';
import { ensureDashboardAuth } from '../_auth';
import {
  getPlatformStats,
  formatBookmarkResponse,
} from '@/lib/bookmark-helpers';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: NextRequest) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const q = (searchParams.get('q') || '').trim();
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit') || '20')));
    const sortBy = searchParams.get('sortBy') || 'bookmarkedDate';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Build query
    interface BookmarkQuery {
      $or?: Array<Record<string, unknown>>;
      platform?: RegExp;
      status?: string;
      bookmarkedDate?: Record<string, Date>;
    }
    const query: BookmarkQuery = {};

    // Search across title, company, notes
    if (q) {
      const regex = new RegExp(escapeRegex(q), 'i');
      query.$or = [
        { jobTitle: regex },
        { company: regex },
        { notes: regex },
      ];
    }

    // Filters
    if (platform) query.platform = new RegExp(`^${escapeRegex(platform.trim())}$`, 'i');
    if (status) query.status = status;

    // Date range filter
    if (dateFrom || dateTo) {
      query.bookmarkedDate = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        query.bookmarkedDate.$gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.bookmarkedDate.$lte = toDate;
      }
    }

    const total = await BookmarkedJob.countDocuments(query);
    const pages = Math.ceil(total / limit) || 1;

    const bookmarks = await BookmarkedJob.find(query)
      .sort({ [sortBy]: sortOrder, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const formattedBookmarks = bookmarks.map((bookmark) =>
      formatBookmarkResponse(bookmark as any)
    );

    // Get platform stats for widget
    const allBookmarks = await BookmarkedJob.find(query).lean();
    const platformStats = getPlatformStats(allBookmarks as any);

    return NextResponse.json({
      success: true,
      data: formattedBookmarks,
      pagination: {
        currentPage: page,
        totalPages: pages,
        totalItems: total,
        itemsPerPage: limit,
      },
      platformStats,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bookmarks',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { jobTitle, company, platform, jobUrl, notes } = body;

    // Validate required fields
    if (!jobTitle || !company || !platform || !jobUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: jobTitle, company, platform, jobUrl',
        },
        { status: 400 }
      );
    }

    // Verify platform exists
    const normalizedPlatform = String(platform).trim().toLowerCase();

    const platformExists = await PlatformList.findOne({
      name: normalizedPlatform,
      isActive: true,
    });
    if (!platformExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid platform',
        },
        { status: 400 }
      );
    }

    const bookmark = new BookmarkedJob({
      jobTitle,
      company,
      platform: normalizedPlatform,
      jobUrl,
      notes: notes || undefined,
      status: 'saved',
      bookmarkedDate: new Date(),
    });

    await bookmark.validate();
    await bookmark.save();

    return NextResponse.json(
      {
        success: true,
        data: formatBookmarkResponse(bookmark),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create bookmark',
      },
      { status: 500 }
    );
  }
}
