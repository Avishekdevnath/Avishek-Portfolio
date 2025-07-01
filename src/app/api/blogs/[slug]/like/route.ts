import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { handleApiError, sendSuccess, sendError } from '@/lib/api-utils';
import Blog from '@/models/Blog';
import BlogStats from '@/models/BlogStats';
import { createBlogNotification } from '@/lib/notifications';

interface Like {
  ip: string;
  timestamp: Date;
}

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase();

    const { slug } = params;

    // Derive client IP (works behind proxies/CDN)
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

    // Find the blog post
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Find or create blog stats
    let blogStats = await BlogStats.findOne({ blog: blog._id });
    if (!blogStats) {
      blogStats = await BlogStats.create({ blog: blog._id });
    }

    // Check if this IP has already liked
    const hasLiked = blogStats.likes.some((like: Like) => like.ip === ipAddress);
    if (hasLiked) {
      return NextResponse.json(
        { error: 'Already liked this post' },
        { status: 409 }
      );
    }

    // Add the like
    blogStats.likes.push({ ip: ipAddress, timestamp: new Date() });
    await blogStats.save();

    // Create notification if likes reach certain milestones
    const likesCount = blogStats.likes.length;
    if (likesCount === 10 || likesCount === 50 || likesCount === 100 || likesCount === 500 || likesCount === 1000) {
      await createBlogNotification({
        title: blog.title,
        slug: blog.slug,
        action: 'liked',
        metadata: {
          milestone: likesCount,
          totalLikes: likesCount
        }
      });
    }

    return NextResponse.json({
      success: true,
      likesCount: blogStats.likes.length
    });

  } catch (error) {
    console.error('Error handling blog like:', error);
    return NextResponse.json(
      { error: 'Failed to process like' },
      { status: 500 }
    );
  }
}

// Get like status for a user
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase();

    const email = request.nextUrl.searchParams.get('email');
    if (!email) {
      return sendError('Email is required', 400);
    }

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return sendError('Blog not found', 404);
    }

    const isLiked = blog.stats.likes.users.includes(email);

    return sendSuccess({
      likes: blog.stats.likes.total,
      isLiked,
    });
  } catch (error) {
    return handleApiError(error);
  }
} 