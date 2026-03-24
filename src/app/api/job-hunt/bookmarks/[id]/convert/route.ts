import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BookmarkedJob } from '@/models/BookmarkedJob';
import JobApplication from '@/models/JobApplication';
import { ensureDashboardAuth } from '../../../_auth';
import { formatBookmarkResponse, generateConvertToApplicationPayload } from '@/lib/bookmark-helpers';
import { Types } from 'mongoose';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid bookmark ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status: appStatus } = body;

    // Fetch bookmark
    const bookmark = await BookmarkedJob.findById(params.id);
    if (!bookmark) {
      return NextResponse.json({ success: false, error: 'Bookmark not found' }, { status: 404 });
    }

    // Create application from bookmark
    const applicationPayload = generateConvertToApplicationPayload(bookmark);
    const application = new JobApplication({
      ...applicationPayload,
      status: appStatus || 'Applied',
    });

    await application.validate();
    await application.save();

    // Update bookmark with conversion info
    bookmark.status = 'applied';
    bookmark.linkedApplicationId = application._id;
    bookmark.statusChangedDate = new Date();
    await bookmark.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          newApplication: application.toObject(),
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
