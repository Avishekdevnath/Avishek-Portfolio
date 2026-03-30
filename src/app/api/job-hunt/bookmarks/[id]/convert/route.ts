import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BookmarkedJob } from '@/models/BookmarkedJob';
import JobApplication from '@/models/JobApplication';
import ApplicationContactModel from '@/models/ApplicationContact';
import { ensureDashboardAuth } from '../../../_auth';
import { formatBookmarkResponse, generateConvertToApplicationPayload } from '@/lib/bookmark-helpers';
import { Types } from 'mongoose';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid bookmark ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status: appStatus } = body;

    const bookmark = await BookmarkedJob.findById(id);
    if (!bookmark) {
      return NextResponse.json({ success: false, error: 'Bookmark not found' }, { status: 404 });
    }

    // Create application from bookmark — includes jobDescription + resumeLink
    const applicationPayload = generateConvertToApplicationPayload(bookmark);
    const application = new JobApplication({
      ...applicationPayload,
      status: appStatus || 'Applied',
    });

    await application.validate();
    await application.save();

    // Sync contacts — bulk update from bookmark to application
    await ApplicationContactModel.updateMany(
      { bookmarkId: bookmark._id, sourceType: 'bookmark' },
      {
        $set: {
          applicationId: application._id,
          sourceType: 'application',
        },
        $unset: { bookmarkId: '' },
      }
    );

    // Update bookmark with conversion info
    bookmark.status = 'applied';
    bookmark.linkedApplicationId = application._id;
    bookmark.statusChangedDate = new Date();
    await bookmark.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          newApplication: { ...application.toObject(), _id: application._id.toString() },
          updatedBookmark: formatBookmarkResponse(bookmark),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert bookmark',
      },
      { status: 500 }
    );
  }
}
