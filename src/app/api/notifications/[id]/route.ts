import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Notification from '@/models/Notification';

// GET /api/notifications/[id] - Get specific notification
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const notification = await Notification.findById(params.id);

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/[id] - Update notification (mark as read/unread)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { action, ...updateData } = body;

    let notification;

    if (action === 'markAsRead') {
      notification = await Notification.markAsRead(params.id);
    } else if (action === 'markAsUnread') {
      notification = await Notification.markAsUnread(params.id);
    } else {
      // General update
      notification = await Notification.findByIdAndUpdate(
        params.id,
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Notification updated successfully'
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete specific notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const notification = await Notification.findByIdAndDelete(params.id);

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
      data: notification
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 