import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { handleApiError, sendSuccess, sendError } from '@/lib/api-utils';
import Blog from '@/models/Blog';
import BlogStats from '@/models/BlogStats';

interface View {
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  referrer?: string;
  userAgent?: string;
}

interface Like {
  timestamp: Date;
  userId: string;
}

interface Comment {
  timestamp: Date;
  userId: string;
  content: string;
  status: 'approved' | 'pending' | 'spam';
}

// Add interface for daily stats
interface DailyStat {
  date: Date;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  uniqueVisitors: number;
  avgTimeSpent: number;
}

// Add interface for request data
interface StatsRequestData {
  type: 'view' | 'like' | 'share' | 'reading_progress';
  data?: {
    platform?: string;
    progress?: number;
    timeSpent?: number;
  };
}

// Add interface for response data
interface StatsResponseData {
  views: number;
  likes: number;
  shares: number;
  dailyStats: DailyStat[];
}

// GET /api/blogs/[slug]/stats - Get blog stats
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return NextResponse.json({
        success: false,
        error: 'Blog not found'
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        views: blog.views,
        likes: blog.likes,
        comments: blog.stats.comments.total,
        shares: blog.stats.shares.total
      }
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch blog stats'
    });
  }
}

// POST /api/blogs/[slug]/stats - Update blog stats
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return NextResponse.json({
        success: false,
        error: 'Blog not found'
      });
    }

    const { type, data } = await request.json();

    switch (type) {
      case 'view':
        blog.views = (blog.views || 0) + 1;
        break;
      case 'like':
        blog.likes = (blog.likes || 0) + 1;
        break;
      case 'unlike':
        blog.likes = Math.max((blog.likes || 0) - 1, 0);
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid stats type'
        });
    }

    await blog.save();

    return NextResponse.json({
      success: true,
      data: {
        views: blog.views,
        likes: blog.likes,
        comments: blog.stats.comments.total,
        shares: blog.stats.shares.total
      }
    });
  } catch (error) {
    console.error('Error updating blog stats:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update blog stats'
    });
  }
} 