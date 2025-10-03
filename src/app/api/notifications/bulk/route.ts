import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';

// POST /api/notifications/bulk - Bulk operations on notifications
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { action, ids, userId = 'admin' } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'markAllAsRead':
        result = await Notification.markAllAsRead(userId);
        return NextResponse.json({
          success: true,
          message: `Marked ${result.modifiedCount} notifications as read`,
          modifiedCount: result.modifiedCount
        });

      case 'markAsRead':
        if (!ids || !Array.isArray(ids)) {
          return NextResponse.json(
            { success: false, error: 'IDs array is required for this action' },
            { status: 400 }
          );
        }
        result = await Notification.updateMany(
          { _id: { $in: ids }, userId },
          { isRead: true, readAt: new Date() }
        );
        return NextResponse.json({
          success: true,
          message: `Marked ${result.modifiedCount} notifications as read`,
          modifiedCount: result.modifiedCount
        });

      case 'markAsUnread':
        if (!ids || !Array.isArray(ids)) {
          return NextResponse.json(
            { success: false, error: 'IDs array is required for this action' },
            { status: 400 }
          );
        }
        result = await Notification.updateMany(
          { _id: { $in: ids }, userId },
          { isRead: false, $unset: { readAt: 1 } }
        );
        return NextResponse.json({
          success: true,
          message: `Marked ${result.modifiedCount} notifications as unread`,
          modifiedCount: result.modifiedCount
        });

      case 'delete':
        if (!ids || !Array.isArray(ids)) {
          return NextResponse.json(
            { success: false, error: 'IDs array is required for this action' },
            { status: 400 }
          );
        }
        result = await Notification.deleteMany({
          _id: { $in: ids },
          userId
        });
        return NextResponse.json({
          success: true,
          message: `Deleted ${result.deletedCount} notifications`,
          deletedCount: result.deletedCount
        });

      case 'deleteAll':
        result = await Notification.deleteMany({ userId });
        return NextResponse.json({
          success: true,
          message: `Deleted ${result.deletedCount} notifications`,
          deletedCount: result.deletedCount
        });

      case 'deleteOld':
        const daysOld = body.days || 30;
        result = await Notification.deleteOldNotifications(daysOld);
        return NextResponse.json({
          success: true,
          message: `Deleted ${result.deletedCount} old notifications`,
          deletedCount: result.deletedCount
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform bulk operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 