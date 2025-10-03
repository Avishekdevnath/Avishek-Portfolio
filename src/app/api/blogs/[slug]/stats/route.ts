import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
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
    await connectDB();

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return NextResponse.json({
        success: false,
        error: 'Blog not found'
      });
    }

    // Find blog stats
    const blogStats = await BlogStats.findOne({ blog: blog._id });
    
    if (!blogStats) {
      return NextResponse.json({
        success: true,
        data: {
          views: 0,
          likes: 0,
          shares: 0,
          dailyStats: []
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        views: blogStats.views.length,
        likes: blogStats.likes.length,
        shares: blogStats.shares.length,
        dailyStats: blogStats.dailyStats
      }
    });
  } catch (error) {
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
    await connectDB();

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return NextResponse.json({
        success: false,
        error: 'Blog not found'
      });
    }

    const { type, data } = await request.json();

    // Find or create blog stats
    let blogStats = await BlogStats.findOne({ blog: blog._id });
    if (!blogStats) {
      blogStats = await BlogStats.create({ blog: blog._id });
    }

    switch (type) {
      case 'view':
        blogStats.views.push({
          timestamp: new Date(),
          ip: data?.ip || 'unknown',
          userAgent: data?.userAgent || 'unknown',
          referer: data?.referer || ''
        });
        break;
      case 'like':
        blogStats.likes.push({
          timestamp: new Date(),
          ip: data?.ip || 'unknown'
        });
        break;
      case 'share':
        blogStats.shares.push({
          timestamp: new Date(),
          platform: data?.platform || 'unknown'
        });
        break;
      case 'reading_progress':
        if (data?.progress && data?.timeSpent) {
          blogStats.readingProgress.push({
            timestamp: new Date(),
            progress: data.progress,
            timeSpent: data.timeSpent
          });
        }
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid stats type'
        });
    }

    await blogStats.save();

    return NextResponse.json({
      success: true,
      data: {
        views: blogStats.views.length,
        likes: blogStats.likes.length,
        shares: blogStats.shares.length,
        dailyStats: blogStats.dailyStats
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update blog stats'
    });
  }
} 