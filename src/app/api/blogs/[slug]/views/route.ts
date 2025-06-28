import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { handleApiError, sendSuccess, sendError } from '@/lib/api-utils';
import Blog from '@/models/Blog';

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase();

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return sendError('Blog not found', 404);
    }

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update the blog post's views
    const updatedBlog = await Blog.findByIdAndUpdate(blog._id, {
      $inc: { 'stats.views.total': 1 },
      $push: {
        'stats.views.history': {
          date: today,
          count: 1
        }
      }
    }, { new: true });

    return sendSuccess({ views: updatedBlog?.stats?.views?.total || 0 });
  } catch (error) {
    return handleApiError(error);
  }
} 