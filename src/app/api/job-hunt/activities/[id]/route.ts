import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import JobActivity from '@/models/JobActivity';
import { ensureDashboardAuth } from '../../_auth';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid activity id' }, { status: 400 });
    }

    const item = await JobActivity.findById(params.id).lean();
    if (!item) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { ...item, _id: item._id.toString() } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid activity id' }, { status: 400 });
    }

    const body = await request.json();
    const updated = await JobActivity.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { ...updated, _id: updated._id.toString() } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update activity' },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid activity id' }, { status: 400 });
    }

    const deleted = await JobActivity.findByIdAndDelete(params.id).lean();
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { _id: deleted._id.toString() } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete activity' },
      { status: 500 }
    );
  }
}
