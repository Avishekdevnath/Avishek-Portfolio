import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { handleApiError, sendSuccess, sendError } from '@/lib/api-utils';
import Blog from '@/models/Blog';
import BlogStats from '@/models/BlogStats';

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB();

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return sendError('Blog not found', 404);
    }

    // Get client information
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || '';
    
    // Get session identifier from request body if available
    const body = await request.json().catch(() => ({}));
    const sessionId = body.sessionId || 'anonymous';

    // Find or create blog stats
    let blogStats = await BlogStats.findOne({ blog: blog._id });
    if (!blogStats) {
      blogStats = await BlogStats.create({ blog: blog._id });
    }

    // Check for duplicate views within the last 30 minutes from same IP + UserAgent combination
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentView = blogStats.views.find((view: any) => 
      view.ip === ipAddress && 
      view.userAgent === userAgent && 
      new Date(view.timestamp) > thirtyMinutesAgo
    );

    // If no recent view from this IP/UserAgent combination, add the view
    if (!recentView) {
      blogStats.views.push({
        timestamp: new Date(),
        ip: ipAddress,
        userAgent,
        referer,
        sessionId
      });
      await blogStats.save();
    }

    return sendSuccess({ 
      views: blogStats.views.length,
      uniqueViews: new Set(blogStats.views.map((v: any) => v.ip)).size
    });
  } catch (error) {
    return handleApiError(error);
  }
} 