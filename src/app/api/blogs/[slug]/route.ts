import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { handleApiError, sendSuccess, sendError } from '@/lib/api-utils';

// GET /api/blogs/[slug] - Get a single blog
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();
    
    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return sendError('Blog post not found', 404);
    }

    return sendSuccess(blog);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/blogs/[slug] - Update a blog
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return sendError('Blog post not found', 404);
    }

    // If status is being changed to published, set publishedAt
    if (body.status === 'published' && blog.status === 'draft') {
      body.publishedAt = new Date();
    }

    // Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      blog._id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    return sendSuccess(updatedBlog, 'Blog post updated successfully');
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.slug) {
      return sendError('A blog post with this title already exists', 400);
    }
    return handleApiError(error);
  }
}

// DELETE /api/blogs/[slug] - Delete a blog
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();
    
    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return sendError('Blog post not found', 404);
    }

    await Blog.findByIdAndDelete(blog._id);

    return sendSuccess(null, 'Blog post deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/blogs/[slug]/like - Like/unlike a blog
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();
    
    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return sendError('Blog post not found', 404);
    }

    const { action } = await request.json();
    
    if (action !== 'like' && action !== 'unlike') {
      return sendError('Invalid action. Must be "like" or "unlike"', 400);
    }

    const update = action === 'like' ? { $inc: { likes: 1 } } : { $inc: { likes: -1 } };
    
    const updatedBlog = await Blog.findByIdAndUpdate(
      blog._id,
      update,
      { new: true }
    );

    return sendSuccess(updatedBlog, `Blog post ${action}d successfully`);
  } catch (error) {
    return handleApiError(error);
  }
} 