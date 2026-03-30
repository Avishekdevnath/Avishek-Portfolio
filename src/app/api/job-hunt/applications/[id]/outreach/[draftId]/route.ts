import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import ApplicationOutreachDraftModel from '@/models/ApplicationOutreachDraft';
import { ensureDashboardAuth } from '../../../../_auth';

interface RouteParams { params: Promise<{ id: string; draftId: string }> }

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;
  const { id, draftId } = await params;

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(draftId)) {
      return NextResponse.json({ success: false, error: 'Invalid draft id' }, { status: 400 });
    }

    const deleted = await ApplicationOutreachDraftModel.findOneAndDelete({
      _id: draftId,
      applicationId: id,
    }).lean();

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete draft' }, { status: 500 });
  }
}
