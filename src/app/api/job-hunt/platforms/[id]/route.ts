import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { PlatformList } from '@/models/PlatformList';
import { BookmarkedJob } from '@/models/BookmarkedJob';
import { ensureDashboardAuth } from '../../_auth';

function invalidIdResponse() {
  return NextResponse.json(
    { success: false, error: 'Invalid platform id' },
    { status: 400 }
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return invalidIdResponse();
  }

  try {
    await connectDB();

    const platform = await PlatformList.findById(id);
    if (!platform) {
      return NextResponse.json(
        { success: false, error: 'Platform not found' },
        { status: 404 }
      );
    }

    const curatedJobsCount = await BookmarkedJob.countDocuments({
      platform: String(platform.name).toLowerCase(),
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: String(platform._id),
        name: platform.name,
        description: platform.description,
        url: platform.url,
        note: platform.note,
        needsReferral: Boolean(platform.needsReferral),
        isActive: Boolean(platform.isActive),
        curatedJobsCount,
        publicReview: platform.publicReview,
        recommendation: platform.recommendation,
        reputationScore: platform.reputationScore,
        remoteFocusScore: platform.remoteFocusScore,
        curationScore: platform.curationScore,
        payPotentialScore: platform.payPotentialScore,
        priorityScore: platform.priorityScore,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch platform',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return invalidIdResponse();
  }

  try {
    await connectDB();

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.name === 'string' && body.name.trim()) {
      updates.name = body.name.trim().toLowerCase();
    }
    if (typeof body.description === 'string' || body.description === null) {
      updates.description = body.description || undefined;
    }
    if (typeof body.url === 'string' || body.url === null) {
      updates.url = body.url || undefined;
    }
    if (typeof body.note === 'string' || body.note === null) {
      updates.note = body.note || undefined;
    }
    if (typeof body.needsReferral === 'boolean') {
      updates.needsReferral = body.needsReferral;
    }
    if (typeof body.isActive === 'boolean') {
      updates.isActive = body.isActive;
    }
    if (typeof body.publicReview === 'string' || body.publicReview === null) {
      updates.publicReview = body.publicReview || undefined;
    }
    if (typeof body.recommendation === 'string' || body.recommendation === null) {
      updates.recommendation = body.recommendation || undefined;
    }
    for (const field of ['reputationScore', 'remoteFocusScore', 'curationScore', 'payPotentialScore', 'priorityScore']) {
      if (body[field] !== undefined) {
        updates[field] = body[field] === null || body[field] === '' ? undefined : Number(body[field]);
      }
    }

    const platform = await PlatformList.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!platform) {
      return NextResponse.json(
        { success: false, error: 'Platform not found' },
        { status: 404 }
      );
    }

    const curatedJobsCount = await BookmarkedJob.countDocuments({
      platform: String(platform.name).toLowerCase(),
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: String(platform._id),
        name: platform.name,
        description: platform.description,
        url: platform.url,
        note: platform.note,
        needsReferral: Boolean(platform.needsReferral),
        isActive: Boolean(platform.isActive),
        curatedJobsCount,
        publicReview: platform.publicReview,
        recommendation: platform.recommendation,
        reputationScore: platform.reputationScore,
        remoteFocusScore: platform.remoteFocusScore,
        curationScore: platform.curationScore,
        payPotentialScore: platform.payPotentialScore,
        priorityScore: platform.priorityScore,
      },
    });
  } catch (error) {
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Platform already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update platform',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) {
    return invalidIdResponse();
  }

  try {
    await connectDB();

    const platform = await PlatformList.findById(id).lean();
    if (!platform) {
      return NextResponse.json(
        { success: false, error: 'Platform not found' },
        { status: 404 }
      );
    }

    const linkedBookmarks = await BookmarkedJob.countDocuments({
      platform: String(platform.name).toLowerCase(),
    });

    if (linkedBookmarks > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete platform with linked bookmarked jobs. Remove/move related bookmarks first.',
        },
        { status: 409 }
      );
    }

    await PlatformList.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Platform deleted',
      data: { _id: id },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete platform',
      },
      { status: 500 }
    );
  }
}
