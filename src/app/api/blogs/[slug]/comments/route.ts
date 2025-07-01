import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Comment from '@/models/Comment';
import { createBlogNotification } from '@/lib/notifications';

// Get comments for a blog post
export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase();

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return NextResponse.json({
        success: false,
        error: 'Blog post not found'
      });
    }

    const comments = await Comment.find({ blogId: blog._id, parentComment: null })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch replies separately
    const replies = await Comment.find({ blogId: blog._id, parentComment: { $ne: null } })
      .sort({ createdAt: 1 })
      .lean();

    // Map replies to their parent
    const replyMap: Record<string, any[]> = {};
    replies.forEach((r) => {
      const parentId = r.parentComment?.toString() || '';
      if (!replyMap[parentId]) replyMap[parentId] = [];
      replyMap[parentId].push(r);
    });

    const nested = comments.map((c) => ({
      ...c,
      replies: replyMap[c._id.toString()] || [],
    }));

    return NextResponse.json({
      success: true,
      data: { comments: nested }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch comments'
    });
  }
}

// Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();

    const { slug } = params;
    const data = await request.json();

    console.log('Creating comment with data:', data);

    // Find the blog post
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Create the comment
    const commentData = {
      blogId: blog._id,
      name: data.name,
      email: data.email,
      content: data.content,
      status: 'approved' // You might want to change this based on your moderation needs
    };

    console.log('Comment data to save:', commentData);
    const comment = await Comment.create(commentData);
    console.log('Comment created successfully:', comment._id);

    // Create notification for new comment
    await createBlogNotification({
      title: blog.title,
      slug: blog.slug,
      action: 'commented',
      metadata: {
        commenterName: data.name,
        commentId: comment._id,
        commentPreview: data.content.substring(0, 100)
      }
    });

    return NextResponse.json({
      success: true,
      data: { comment }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
} 