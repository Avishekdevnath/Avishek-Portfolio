import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { handleApiError, sendError, sendSuccess } from '@/lib/api-utils';
import Blog from '@/models/Blog';

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase();

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return sendError('Blog not found', 404);
    }

    const { platform } = await request.json();

    // Build dynamic increment object
    const inc: Record<string, number> = {
      'stats.shares.total': 1,
    };

    if (platform && ['facebook', 'twitter', 'linkedin'].includes(platform)) {
      inc[`stats.shares.platforms.${platform}`] = 1;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blog._id,
      { $inc: inc },
      { new: true }
    );

    return sendSuccess({ shares: updatedBlog?.stats?.shares?.total || 0 });
  } catch (error) {
    return handleApiError(error);
  }
} 