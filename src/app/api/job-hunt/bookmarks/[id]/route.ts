import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BookmarkedJob } from '@/models/BookmarkedJob';
import { ensureDashboardAuth } from '../../_auth';
import { formatBookmarkResponse } from '@/lib/bookmark-helpers';
import { Types } from 'mongoose';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid bookmark ID' }, { status: 400 });
    }

    const bookmark = await BookmarkedJob.findById(id).lean();

    if (!bookmark) {
      return NextResponse.json({ success: false, error: 'Bookmark not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: formatBookmarkResponse(bookmark as any),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bookmark',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid bookmark ID' }, { status: 400 });
    }

    const body = await request.json();
    const updateData: any = { ...body };

    // Track status change
    if (body.status) {
      updateData.statusChangedDate = new Date();
    }

    const bookmark = await BookmarkedJob.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!bookmark) {
      return NextResponse.json({ success: false, error: 'Bookmark not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: formatBookmarkResponse(bookmark as any),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update bookmark',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid bookmark ID' }, { status: 400 });
    }

    const result = await BookmarkedJob.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ success: false, error: 'Bookmark not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Bookmark deleted',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete bookmark',
      },
      { status: 500 }
    );
  }
}
