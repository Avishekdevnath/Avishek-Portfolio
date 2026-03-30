import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BookmarkedJob } from '@/models/BookmarkedJob';
import { ensureDashboardAuth } from '../../_auth';
import { Types } from 'mongoose';

export async function POST(request: NextRequest) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { ids, action, status } = body;

    // Validate input
    if (!Array.isArray(ids) || !ids.length) {
      return NextResponse.json(
        { success: false, error: 'ids must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'action is required' },
        { status: 400 }
      );
    }

    // Validate IDs
    const validIds = ids.every((id) => Types.ObjectId.isValid(id as string));
    if (!validIds) {
      return NextResponse.json(
        { success: false, error: 'Invalid bookmark IDs' },
        { status: 400 }
      );
    }

    const objectIds = ids.map((id) => new Types.ObjectId(id as string));

    if (action === 'delete') {
      const result = await BookmarkedJob.deleteMany({ _id: { $in: objectIds } });
      return NextResponse.json({
        success: true,
        deleted: result.deletedCount,
      });
    } else if (action === 'update-status') {
      if (!status || !['saved', 'applied', 'discarded'].includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Valid status is required' },
          { status: 400 }
        );
      }

      const result = await BookmarkedJob.updateMany(
        { _id: { $in: objectIds } },
        {
          $set: {
            status,
            statusChangedDate: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        updated: result.modifiedCount,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process bulk action',
      },
      { status: 500 }
    );
  }
}
