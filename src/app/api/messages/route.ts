import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Message, { MessageCategory, MessageStatus } from '@/models/Message';
import { sendContactNotification, sendAutoReply, sendAdminNotification } from '@/lib/email';
import { createMessageNotification } from '@/lib/notifications';
import { sendEmailNotification, sendContactFormEmail } from '@/lib/email';

// Simple rate limiting using a Map
const rateLimiter = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 5; // messages per window
const RATE_WINDOW = 3600000; // 1 hour in milliseconds

// Helper to get client IP
const getClientIP = (request: NextRequest) => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.ip || 'unknown';
};

// Helper to check rate limit
const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const record = rateLimiter.get(ip);

  if (!record) {
    rateLimiter.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (now - record.timestamp > RATE_WINDOW) {
    // Reset if window has passed
    rateLimiter.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
};

// GET /api/messages - Get all messages (for dashboard)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';

    // Build query
    const query: any = {};
    if (status === 'unread') {
      query.status = MessageStatus.UNREAD;
    } else if (status === 'read') {
      query.status = MessageStatus.READ;
    } else if (status === 'replied') {
      query.status = MessageStatus.REPLIED;
    } else if (status === 'archived') {
      query.status = MessageStatus.ARCHIVED;
    }

    // Get messages with pagination
    const skip = (page - 1) * limit;
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count and stats
    const [total, stats] = await Promise.all([
      Message.countDocuments(query),
      Message.getStats()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        messages,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          totalMessages: total
        },
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Create a new message
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const data = await request.json();
    const { name, email, subject, message } = data;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Map the subject to a valid MessageCategory or use default
    let messageCategory = MessageCategory.GENERAL;
    if (subject) {
      const subjectLower = subject.toLowerCase();
      if (subjectLower.includes('job') || subjectLower.includes('position') || subjectLower.includes('career')) {
        messageCategory = MessageCategory.JOB;
      } else if (subjectLower.includes('project') || subjectLower.includes('collaboration')) {
        messageCategory = MessageCategory.PROJECT;
      }
    }

    // Create message
    const newMessage = await Message.create({
      name,
      email,
      subject: messageCategory,
      message,
      status: MessageStatus.UNREAD,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent')
    });

    // Create notification
    await createMessageNotification({
      sender: name,
      subject: messageCategory,
      id: newMessage._id.toString(),
      metadata: {
        senderEmail: email,
        messagePreview: message.substring(0, 100)
      }
    });

    // Send email notification
    try {
      await sendContactFormEmail({
        name,
        email,
        subject: messageCategory,
        message
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: newMessage._id,
        category: messageCategory
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// PUT /api/messages/:id - Update message status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { status } = body;

    const message = await Message.findById(params.id);
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    if (status === 'read') {
      await message.markAsRead();
    } else if (status === 'replied') {
      await message.markAsReplied();
    } else if (status === 'archived') {
      await message.archive();
    }

    return NextResponse.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update message' },
      { status: 500 }
    );
  }
} 