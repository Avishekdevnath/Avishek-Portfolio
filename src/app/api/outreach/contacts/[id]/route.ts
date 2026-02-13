import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import OutreachContact from '@/models/OutreachContact';
import OutreachCompany from '@/models/OutreachCompany';
import OutreachEmail from '@/models/OutreachEmail';
import { ensureDashboardAuth } from '../../_auth';

export async function GET(_: NextRequest, context: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  const { id } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid contact id' }, { status: 400 });
  }

  try {
    await connectDB();

    const contact = await OutreachContact.findById(id).populate('companyId', 'name').lean();
    if (!contact) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }

    const company =
      contact.companyId && typeof contact.companyId === 'object'
        ? { _id: contact.companyId._id.toString(), name: (contact.companyId as any).name }
        : undefined;
    const companyId =
      contact.companyId && typeof contact.companyId === 'object'
        ? contact.companyId._id.toString()
        : (contact.companyId as any)?.toString();

    return NextResponse.json({
      success: true,
      data: {
        _id: contact._id.toString(),
        companyId,
        company,
        name: contact.name,
        email: contact.email,
        roleTitle: contact.roleTitle,
        linkedinUrl: contact.linkedinUrl,
        status: contact.status,
        lastContactedAt: contact.lastContactedAt,
        notes: contact.notes,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch contact' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  const { id } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid contact id' }, { status: 400 });
  }

  try {
    await connectDB();
    const contact = await OutreachContact.findById(id);
    if (!contact) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }

    const body = await request.json();

    if (typeof body.name === 'string') contact.name = body.name;
    if (typeof body.email === 'string') contact.email = body.email;
    if (typeof body.roleTitle === 'string') contact.roleTitle = body.roleTitle || undefined;
    if (typeof body.linkedinUrl === 'string') contact.linkedinUrl = body.linkedinUrl || undefined;
    if (typeof body.notes === 'string') contact.notes = body.notes || undefined;
    if (typeof body.status === 'string' && ['new', 'contacted', 'replied', 'closed'].includes(body.status)) {
      contact.status = body.status;
    }
    if (typeof body.lastContactedAt === 'string' || body.lastContactedAt instanceof Date) {
      const dt = new Date(body.lastContactedAt);
      if (!Number.isNaN(dt.getTime())) contact.lastContactedAt = dt;
    }
    if (typeof body.companyId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(body.companyId)) {
        return NextResponse.json({ success: false, error: 'Invalid companyId' }, { status: 400 });
      }
      const companyExists = await OutreachCompany.exists({ _id: body.companyId });
      if (!companyExists) {
        return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
      }
      contact.companyId = body.companyId;
    }

    await contact.save();

    return NextResponse.json({ success: true, message: 'Contact updated' });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, error: 'Contact already exists' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update contact' }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  const { id } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid contact id' }, { status: 400 });
  }

  try {
    await connectDB();

    const emailsCount = await OutreachEmail.countDocuments({ contactId: id });
    if (emailsCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Delete outreach emails linked to this contact first' },
        { status: 409 }
      );
    }

    const contact = await OutreachContact.findByIdAndDelete(id);
    if (!contact) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Contact deleted' });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete contact' }, { status: 500 });
  }
}

