import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import ApplicationContactModel from '@/models/ApplicationContact';
import ApplicationOutreachDraftModel from '@/models/ApplicationOutreachDraft';
import { ensureDashboardAuth } from '../../../../_auth';

interface RouteParams { params: Promise<{ id: string; contactId: string }> }

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    if (!Types.ObjectId.isValid(params.contactId)) {
      return NextResponse.json({ success: false, error: 'Invalid contact ID' }, { status: 400 });
    }

    const body = await request.json();
    const updated = await ApplicationContactModel.findOneAndUpdate(
      { _id: params.contactId, bookmarkId: params.id },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...(updated as any), _id: (updated as any)._id.toString(), bookmarkId: params.id },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update contact' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    if (!Types.ObjectId.isValid(params.contactId)) {
      return NextResponse.json({ success: false, error: 'Invalid contact ID' }, { status: 400 });
    }

    const deleted = await ApplicationContactModel.findOneAndDelete({
      _id: params.contactId,
      bookmarkId: params.id,
    }).lean();

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete contact' }, { status: 500 });
  }
}
