import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import ApplicationNoteModel from '@/models/ApplicationNote';
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

    const notes = await ApplicationNoteModel.find({ applicationId: id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: notes.map((n: any) => ({ ...n, _id: n._id.toString(), applicationId: n.applicationId.toString() })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;
  const { id } = await params;

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid application id' }, { status: 400 });
    }

    const { body } = await request.json();
    if (!body?.trim()) {
      return NextResponse.json({ success: false, error: 'Note body is required' }, { status: 400 });
    }

    const note = await ApplicationNoteModel.create({ applicationId: id, body: body.trim() });

    return NextResponse.json(
      { success: true, data: { ...note.toObject(), _id: note._id.toString(), applicationId: id } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create note' }, { status: 500 });
  }
}
