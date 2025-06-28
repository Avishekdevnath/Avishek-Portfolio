import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { handleApiError, sendSuccess, sendError } from '@/lib/api-utils';
import Blog from '@/models/Blog';
import Comment from '@/models/Comment';
import { createBlogNotification } from '@/lib/notifications';

// Get comments for a blog post
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase();

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return sendError('Blog not found', 404);
    }

    // Get all comments, they're approved by default
    const comments = await Comment.find({ 
      blogId: blog._id,
      status: 'approved'
    }).sort({ createdAt: -1 });

    return sendSuccess({
      comments: comments.map(comment => ({
        id: comment._id,
        name: comment.name,
        content: comment.content,
        createdAt: comment.createdAt
      }))
    });
  } catch (error) {
    return handleApiError(error);
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
      data: comment
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
} 