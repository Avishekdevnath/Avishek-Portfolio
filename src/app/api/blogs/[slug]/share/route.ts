import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { handleApiError, sendError, sendSuccess } from '@/lib/api-utils';
import Blog from '@/models/Blog';
import BlogStats from '@/models/BlogStats';

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB();

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return sendError('Blog not found', 404);
    }

    const { platform } = await request.json();

    // Find or create blog stats
    let blogStats = await BlogStats.findOne({ blog: blog._id });
    if (!blogStats) {
      blogStats = await BlogStats.create({ blog: blog._id });
    }

    // Add the share
    blogStats.shares.push({ 
      platform: platform || 'unknown', 
      timestamp: new Date() 
    });
    await blogStats.save();

    return sendSuccess({ shares: blogStats.shares.length });
  } catch (error) {
    return handleApiError(error);
  }
} 