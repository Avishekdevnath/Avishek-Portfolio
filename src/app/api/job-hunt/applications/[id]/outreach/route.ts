import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import ApplicationOutreachDraftModel from '@/models/ApplicationOutreachDraft';
import { ensureDashboardAuth } from '../../../_auth';

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;
  const { id } = await params;

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid application id' }, { status: 400 });
    }

    const drafts = await ApplicationOutreachDraftModel.find({ applicationId: id }).lean();

    return NextResponse.json({
      success: true,
      data: drafts.map((d: any) => ({
        ...d,
        _id: d._id.toString(),
        applicationId: d.applicationId.toString(),
        contactId: d.contactId.toString(),
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch drafts' }, { status: 500 });
  }
}
