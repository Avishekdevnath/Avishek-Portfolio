import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import OutreachEmail from '@/models/OutreachEmail';
import OutreachContact from '@/models/OutreachContact';
import OutreachTemplate from '@/models/OutreachTemplate';
import { ensureDashboardAuth } from '../_auth';

export async function GET(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const status = request.nextUrl.searchParams.get('status')?.trim();
    const contactId = request.nextUrl.searchParams.get('contactId')?.trim();
    const companyId = request.nextUrl.searchParams.get('companyId')?.trim();
    const followUpDue = request.nextUrl.searchParams.get('followUpDue') === 'true';

    const query: Record<string, any> = {};
    if (status && ['sent', 'replied', 'no_response', 'closed'].includes(status)) {
      query.status = status;
    }
    if (contactId && mongoose.Types.ObjectId.isValid(contactId)) {
      query.contactId = contactId;
    }
    if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
      query.companyId = companyId;
    }

    // Follow-up due filter
    if (followUpDue) {
      query.status = 'sent';
      query.followUpDate = { $lte: new Date() };
      query.followUpCount = { $lt: 2 };
    }

    const sortOptions: Record<string, 1 | -1> = followUpDue ? { followUpDate: 1 } : { sentAt: -1 };

    const emails = await OutreachEmail.find(query)
      .populate('contactId', 'name email')
      .populate('companyId', 'name')
      .populate('templateId', 'name type tone')
      .sort(sortOptions)
      .lean();

    const data = emails.map((e: any) => ({
      _id: e._id.toString(),
      contactId: e.contactId && typeof e.contactId === 'object' ? e.contactId._id.toString() : e.contactId?.toString(),
      companyId: e.companyId && typeof e.companyId === 'object' ? e.companyId._id.toString() : e.companyId?.toString(),
      templateId: e.templateId && typeof e.templateId === 'object' ? e.templateId._id.toString() : e.templateId?.toString(),
      contact:
        e.contactId && typeof e.contactId === 'object'
          ? { _id: e.contactId._id.toString(), name: e.contactId.name, email: e.contactId.email }
          : undefined,
      company:
        e.companyId && typeof e.companyId === 'object'
          ? { _id: e.companyId._id.toString(), name: e.companyId.name }
          : undefined,
      template:
        e.templateId && typeof e.templateId === 'object'
          ? { _id: e.templateId._id.toString(), name: e.templateId.name, type: e.templateId.type, tone: e.templateId.tone }
          : undefined,
      subject: e.subject,
      body: e.body,
      status: e.status,
      sentAt: e.sentAt,
      followUpDate: e.followUpDate,
      followUpCount: e.followUpCount ?? 0,
      replyReceivedAt: e.replyReceivedAt,
      outcome: e.outcome,
      replyNote: e.replyNote,
      closedAt: e.closedAt,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch outreach emails' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    const body = await request.json();

    const { contactId, subject, body: emailBody } = body;
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return NextResponse.json({ success: false, error: 'Invalid contactId' }, { status: 400 });
    }
    if (typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json({ success: false, error: 'Subject is required' }, { status: 400 });
    }
    if (typeof emailBody !== 'string' || !emailBody.trim()) {
      return NextResponse.json({ success: false, error: 'Body is required' }, { status: 400 });
    }

    const contact = await OutreachContact.findById(contactId).lean();
    if (!contact) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }

    let templateId: string | undefined;
    if (typeof body.templateId === 'string' && mongoose.Types.ObjectId.isValid(body.templateId)) {
      const exists = await OutreachTemplate.exists({ _id: body.templateId });
      if (exists) templateId = body.templateId;
    }

    const sentAt = body.sentAt ? new Date(body.sentAt) : new Date();
    if (Number.isNaN(sentAt.getTime())) {
      return NextResponse.json({ success: false, error: 'Invalid sentAt' }, { status: 400 });
    }

    const followUpDate = body.followUpDate ? new Date(body.followUpDate) : undefined;
    if (body.followUpDate && (!followUpDate || Number.isNaN(followUpDate.getTime()))) {
      return NextResponse.json({ success: false, error: 'Invalid followUpDate' }, { status: 400 });
    }

    const outreachEmail = new OutreachEmail({
      contactId,
      companyId: (contact as any).companyId,
      templateId,
      subject,
      body: emailBody,
      status: body.status || 'sent',
      sentAt,
      followUpDate,
    });

    await outreachEmail.validate();
    await outreachEmail.save();

    return NextResponse.json({ success: true, data: { _id: outreachEmail._id.toString() } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create outreach email' },
      { status: 400 }
    );
  }
}

