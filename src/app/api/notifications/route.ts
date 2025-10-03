import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';

// GET /api/notifications - Fetch notifications with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const filter = searchParams.get('filter') || 'all'; // all, read, unread
    const type = searchParams.get('type') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const search = searchParams.get('search') || '';
    const userId = searchParams.get('userId') || 'admin';

    // Build query
    const query: any = { userId };

    // Filter by read status
    if (filter === 'read') {
      query.isRead = true;
    } else if (filter === 'unread') {
      query.isRead = false;
    }

    // Filter by type
    if (type !== 'all') {
      query.type = type;
    }

    // Filter by priority
    if (priority !== 'all') {
      query.priority = priority;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination and sorting
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await Notification.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Get statistics
    const stats = await Notification.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$isRead', true] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
        }
      }
    ]);

    const statistics = stats[0] || { total: 0, unread: 0, read: 0, highPriority: 0 };

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        stats: statistics
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      type,
      title,
      message,
      priority = 'medium',
      relatedId,
      relatedType,
      actionUrl,
      userId = 'admin',
      metadata = {}
    } = body;

    // Validation
    if (!type || !title || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          details: 'Type, title, and message are required'
        },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['message', 'comment', 'like', 'system', 'update', 'warning'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid notification type',
          details: `Type must be one of: ${validTypes.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid priority',
          details: `Priority must be one of: ${validPriorities.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Create notification
    const notification = await Notification.create({
      type,
      title,
      message,
      priority,
      relatedId,
      relatedType,
      actionUrl,
      userId,
      metadata,
      isRead: false
    });

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Bulk delete notifications
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId') || 'admin';

    if (action === 'deleteOld') {
      // Delete old read notifications (older than 30 days)
      const daysOld = parseInt(searchParams.get('days') || '30');
      const result = await Notification.deleteOldNotifications(daysOld);
      
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.deletedCount} old notifications`,
        deletedCount: result.deletedCount
      });
    }

    if (action === 'deleteAll') {
      // Delete all notifications for user
      const result = await Notification.deleteMany({ userId });
      
      return NextResponse.json({
        success: true,
        message: `Deleted ${result.deletedCount} notifications`,
        deletedCount: result.deletedCount
      });
    }

    // Delete specific notifications by IDs
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid notification IDs',
          details: 'Provide an array of notification IDs'
        },
        { status: 400 }
      );
    }

    const result = await Notification.deleteMany({
      _id: { $in: ids },
      userId
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} notifications`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 