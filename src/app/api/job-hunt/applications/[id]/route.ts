import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
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
      return NextResponse.json({ success: false, error: 'Invalid application id' }, { status: 400 });
    }

    const item = await JobApplication.findById(params.id).lean();
    if (!item) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...item,
        _id: item._id.toString(),
        sourceLeadId: item.sourceLeadId ? item.sourceLeadId.toString() : undefined,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch application' },
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
      return NextResponse.json({ success: false, error: 'Invalid application id' }, { status: 400 });
    }

    const body = await request.json();
    const { status: newStatus, followUpReminderAt, ...rest } = body;

    // Build the update object
    const updateOps: Record<string, any> = { $set: { ...rest, updatedAt: new Date() } };

    // Append to statusHistory if status is changing
    if (newStatus) {
      const current = await JobApplication.findById(params.id).select('status').lean();
      if (current && current.status !== newStatus) {
        updateOps.$push = { statusHistory: { status: newStatus, changedAt: new Date() } };
      }
      updateOps.$set.status = newStatus;
    }

    // Handle followUpReminderAt — reset reminderFired when a new date is set
    if (followUpReminderAt !== undefined) {
      updateOps.$set.followUpReminderAt = followUpReminderAt ? new Date(followUpReminderAt) : null;
      if (followUpReminderAt) {
        updateOps.$set.reminderFired = false;
      }
    }

    const updated = await JobApplication.findByIdAndUpdate(params.id, updateOps, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        _id: updated._id.toString(),
        sourceLeadId: updated.sourceLeadId ? updated.sourceLeadId.toString() : undefined,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update application' },
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
      return NextResponse.json({ success: false, error: 'Invalid application id' }, { status: 400 });
    }

    const deleted = await JobApplication.findByIdAndDelete(params.id).lean();

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { _id: deleted._id.toString() } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete application' },
      { status: 500 }
    );
  }
}
