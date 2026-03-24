import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import JobInterview from '@/models/JobInterview';
import { ensureDashboardAuth } from '../../_auth';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid interview id' }, { status: 400 });
    }

    const item = await JobInterview.findById(params.id).lean();
    if (!item) {
      return NextResponse.json({ success: false, error: 'Interview not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { ...item, _id: item._id.toString() } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch interview' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid interview id' }, { status: 400 });
    }

    const body = await request.json();
    const updated = await JobInterview.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Interview not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { ...updated, _id: updated._id.toString() } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update interview' },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid interview id' }, { status: 400 });
    }

    const deleted = await JobInterview.findByIdAndDelete(params.id).lean();
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Interview not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { _id: deleted._id.toString() } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete interview' },
      { status: 500 }
    );
  }
}
