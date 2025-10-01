import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';

// GET /api/blogs/[slug] - Get a single blog
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
      data: blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch blog'
    });
  }
}

// PUT /api/blogs/[slug] - Update a blog
export async function PUT(
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

    const data = await request.json();
    console.log('Update request data:', JSON.stringify(data, null, 2));
    
    // Normalize lineSpacing to UI-supported values
    if (typeof data.lineSpacing === 'string') {
      const allowed = ['08', '10', '115', '125', '15', '20'];
      if (!allowed.includes(data.lineSpacing)) {
        data.lineSpacing = '10';
      }
    }

    // If title is being changed and slug not provided, regenerate unique slug
    if (data.title && !data.slug) {
      const baseSlug = data.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      let newSlug = baseSlug;
      let counter = 0;
      // Ensure uniqueness
      while (await Blog.findOne({ slug: newSlug, _id: { $ne: blog._id } })) {
        counter++;
        newSlug = `${baseSlug}-${counter}`;
      }
      data.slug = newSlug;
    }

    // Re-calculate readTime when content updated
    if (data.content) {
      const wordCount = (data.content as string).split(/\s+/).length;
      data.readTime = Math.ceil(wordCount / 200);
    }

    // If status is being changed to published, set publishedAt
    if (data.status === 'published' && blog.status !== 'published') {
      data.publishedAt = new Date();
    }

    const updatedBlog = await Blog.findOneAndUpdate(
      { slug: params.slug },
      { $set: data },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedBlog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update blog'
    });
  }
}

// DELETE /api/blogs/[slug] - Delete a blog
export async function DELETE(
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

    await Blog.deleteOne({ slug: params.slug });

    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete blog'
    });
  }
}

// PATCH /api/blogs/[slug] - Handle blog actions (like, unlike, etc.)
export async function PATCH(
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

    const { action } = await request.json();

    switch (action) {
      case 'like':
        blog.likes = (blog.likes || 0) + 1;
        blog.stats.likes.total = (blog.stats?.likes?.total || 0) + 1;
        break;
      case 'unlike':
        blog.likes = Math.max((blog.likes || 0) - 1, 0);
        blog.stats.likes.total = Math.max((blog.stats?.likes?.total || 0) - 1, 0);
        break;
      case 'view':
        blog.views = (blog.views || 0) + 1;
        blog.stats.views.total = (blog.stats?.views?.total || 0) + 1;
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        });
    }

    await blog.save();

    return NextResponse.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error handling blog action:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to handle blog action'
    });
  }
} 