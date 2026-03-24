import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import JobLead from '@/models/JobLead';
import JobApplication from '@/models/JobApplication';
import { buildApplicationFromLead } from '@/lib/job-hunt-utils';
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
      return NextResponse.json({ success: false, error: 'Invalid lead id' }, { status: 400 });
    }

    const lead = await JobLead.findById(params.id).lean();
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...lead,
        _id: lead._id.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch lead' },
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
      return NextResponse.json({ success: false, error: 'Invalid lead id' }, { status: 400 });
    }

    const body = await request.json();
    const previousLead = await JobLead.findById(params.id);

    if (!previousLead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const nextStatus = typeof body.status === 'string' ? body.status : previousLead.status;
    const shouldAutoSync = nextStatus === 'Applied' && previousLead.status !== 'Applied';
    const shouldSyncInterviewing = nextStatus === 'Interviewing';

    const updatePayload = {
      ...body,
      ...(shouldAutoSync ? { dateApplied: new Date(), synced: true } : {}),
      updatedAt: new Date(),
    };

    const updatedLead = await JobLead.findByIdAndUpdate(
      params.id,
      updatePayload,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedLead) {
      return NextResponse.json({ success: false, error: 'Lead not found after update' }, { status: 404 });
    }

    if (shouldAutoSync) {
      const mapped = buildApplicationFromLead({
        company: updatedLead.company,
        title: updatedLead.title,
        jobUrl: updatedLead.jobUrl,
        dateApplied: updatedLead.dateApplied || new Date(),
        sourceLeadId: updatedLead._id.toString(),
        location: updatedLead.location,
      });

      await JobApplication.findOneAndUpdate(
        { sourceLeadId: updatedLead._id },
        { $setOnInsert: mapped },
        { upsert: true, new: true, runValidators: true }
      );
    }

    if (shouldSyncInterviewing) {
      await JobApplication.findOneAndUpdate(
        { sourceLeadId: updatedLead._id },
        { status: 'Interview', updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedLead,
        _id: updatedLead._id.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update lead' },
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
      return NextResponse.json({ success: false, error: 'Invalid lead id' }, { status: 400 });
    }

    const deleted = await JobLead.findByIdAndDelete(params.id).lean();
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    await JobApplication.deleteOne({ sourceLeadId: deleted._id });

    return NextResponse.json({
      success: true,
      data: { _id: deleted._id.toString() },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
