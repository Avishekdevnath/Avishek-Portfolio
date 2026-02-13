import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import OutreachEmail from '@/models/OutreachEmail';
import { ensureDashboardAuth } from '../../_auth';

export async function GET(_: NextRequest, context: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  const { id } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid outreach email id' }, { status: 400 });
  }

  try {
    await connectDB();
    const email = await OutreachEmail.findById(id)
      .populate('contactId', 'name email')
      .populate('companyId', 'name')
      .populate('templateId', 'name type tone')
      .lean();
    if (!email) {
      return NextResponse.json({ success: false, error: 'Outreach email not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: email });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch outreach email' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  const { id } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid outreach email id' }, { status: 400 });
  }

  try {
    await connectDB();
    const email = await OutreachEmail.findById(id);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Outreach email not found' }, { status: 404 });
    }

    const body = await request.json();

    if (typeof body.status === 'string' && ['sent', 'replied', 'no_response', 'closed'].includes(body.status)) {
      email.status = body.status;
      if (body.status === 'replied') {
        email.followUpDate = undefined;
        email.replyReceivedAt = email.replyReceivedAt || new Date();
      }
      if (body.status === 'closed') {
        email.closedAt = email.closedAt || new Date();
      }
    }

    if (typeof body.followUpDate === 'string' || body.followUpDate instanceof Date) {
      const dt = new Date(body.followUpDate);
      if (!Number.isNaN(dt.getTime())) email.followUpDate = dt;
    }

    if (typeof body.followUpCount === 'number') {
      email.followUpCount = Math.max(0, Math.min(2, body.followUpCount));
    }

    if (typeof body.replyReceivedAt === 'string' || body.replyReceivedAt instanceof Date) {
      const dt = new Date(body.replyReceivedAt);
      if (!Number.isNaN(dt.getTime())) email.replyReceivedAt = dt;
    }
    if (typeof body.outcome === 'string' && ['positive', 'neutral', 'rejection'].includes(body.outcome)) {
      email.outcome = body.outcome;
    }
    if (typeof body.replyNote === 'string') {
      email.replyNote = body.replyNote || undefined;
    }

    await email.save();
    return NextResponse.json({ success: true, message: 'Outreach email updated' });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update outreach email' }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  const { id } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid outreach email id' }, { status: 400 });
  }

  try {
    await connectDB();
    const email = await OutreachEmail.findByIdAndDelete(id);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Outreach email not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Outreach email deleted' });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete outreach email' }, { status: 500 });
  }
}

