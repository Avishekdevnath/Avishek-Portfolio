import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { resolveAutoSlug, assertManualSlugAvailable, buildNextSlugHistory } from '@/lib/slug';

async function resolveBlog(slug: string) {
  const blog = await Blog.findOne({ slug });
  if (blog) return blog;
  return Blog.findOne({ slugHistory: slug });
}

// GET /api/blogs/[slug] - Get a single blog
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;
    const blog = await resolveBlog(slug);
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
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch blog'
    });
  }
}

// PUT /api/blogs/[slug] - Update a blog
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;
    const blog = await resolveBlog(slug);
    if (!blog) {
      return NextResponse.json({
        success: false,
        error: 'Blog not found'
      });
    }

    const data = await request.json();

    // Normalize lineSpacing to UI-supported values
    if (typeof data.lineSpacing === 'string') {
      const allowed = ['08', '10', '115', '125', '15', '20'];
      if (!allowed.includes(data.lineSpacing)) {
        data.lineSpacing = '10';
      }
    }

    // Resolve slug using slugMode
    const incomingMode: 'auto' | 'manual' = data.slugMode === 'manual' ? 'manual' : (blog.slugMode ?? 'auto');
    const currentSlug = blog.slug;

    if (incomingMode === 'manual' && data.slug && data.slug !== currentSlug) {
      // Validate manual slug uniqueness
      data.slug = await assertManualSlugAvailable(
        data.slug,
        async (s) => !!(await Blog.findOne({ slug: s, _id: { $ne: blog._id } })),
        currentSlug
      );
    } else if (incomingMode === 'auto' && data.title && data.title !== blog.title) {
      // Auto-regenerate slug from new title
      data.slug = await resolveAutoSlug(
        data.title,
        async (s) => !!(await Blog.findOne({ slug: s, _id: { $ne: blog._id } }))
      );
    }

    // Track slug history when canonical slug changes
    if (data.slug && data.slug !== currentSlug) {
      data.slugHistory = buildNextSlugHistory(currentSlug, data.slug, blog.slugHistory ?? []);
    }

    data.slugMode = incomingMode;

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
      { _id: blog._id },
      { $set: data },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedBlog
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update blog'
    });
  }
}

// DELETE /api/blogs/[slug] - Delete a blog
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;
    const blog = await resolveBlog(slug);
    if (!blog) {
      return NextResponse.json({
        success: false,
        error: 'Blog not found'
      });
    }

    await Blog.deleteOne({ _id: blog._id });

    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete blog'
    });
  }
}

// PATCH /api/blogs/[slug] - Handle blog actions (like, unlike, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;
    const blog = await resolveBlog(slug);
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
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to handle blog action'
    });
  }
} 