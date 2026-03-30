import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import ApplicationNoteModel from '@/models/ApplicationNote';
import { ensureDashboardAuth } from '../../../../_auth';

interface RouteParams { params: Promise<{ id: string; noteId: string }> }

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    const { id, noteId } = await params;
    if (!Types.ObjectId.isValid(noteId)) {
      return NextResponse.json({ success: false, error: 'Invalid note ID' }, { status: 400 });
    }

    const { body } = await request.json();
    if (!body?.trim()) {
      return NextResponse.json({ success: false, error: 'Note body is required' }, { status: 400 });
    }

    const updated = await ApplicationNoteModel.findOneAndUpdate(
      { _id: noteId, bookmarkId: id },
      { body: body.trim(), updatedAt: new Date() },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...(updated as any), _id: (updated as any)._id.toString(), bookmarkId: params.id },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    if (!Types.ObjectId.isValid(params.noteId)) {
      return NextResponse.json({ success: false, error: 'Invalid note ID' }, { status: 400 });
    }

    const deleted = await ApplicationNoteModel.findOneAndDelete({
      _id: params.noteId,
      bookmarkId: params.id,
    }).lean();

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete note' }, { status: 500 });
  }
}
