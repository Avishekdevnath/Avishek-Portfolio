import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import ApplicationNoteModel from '@/models/ApplicationNote';
import { ensureDashboardAuth } from '../../../../_auth';

interface RouteParams { params: Promise<{ id: string; noteId: string }> }

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;
  const { id, noteId } = await params;

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return NextResponse.json({ success: false, error: 'Invalid note id' }, { status: 400 });
    }

    const { body } = await request.json();
    if (!body?.trim()) {
      return NextResponse.json({ success: false, error: 'Note body is required' }, { status: 400 });
    }

    const updated = await ApplicationNoteModel.findOneAndUpdate(
      { _id: noteId, applicationId: id },
      { body: body.trim(), updatedAt: new Date() },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...(updated as any), _id: (updated as any)._id.toString(), applicationId: id },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;
  const { id, noteId } = await params;

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return NextResponse.json({ success: false, error: 'Invalid note id' }, { status: 400 });
    }

    const deleted = await ApplicationNoteModel.findOneAndDelete({
      _id: noteId,
      applicationId: id,
    }).lean();

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete note' }, { status: 500 });
  }
}
