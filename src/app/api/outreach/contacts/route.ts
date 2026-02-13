import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import OutreachContact from '@/models/OutreachContact';
import OutreachCompany from '@/models/OutreachCompany';
import { ensureDashboardAuth } from '../_auth';

export async function GET(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const search = request.nextUrl.searchParams.get('search')?.trim();
    const status = request.nextUrl.searchParams.get('status')?.trim();
    const companyId = request.nextUrl.searchParams.get('companyId')?.trim();

    const query: Record<string, any> = {};
    if (status && ['new', 'contacted', 'replied', 'closed'].includes(status)) {
      query.status = status;
    }
    if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
      query.companyId = companyId;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { roleTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const contacts = await OutreachContact.find(query)
      .populate('companyId', 'name')
      .sort({ updatedAt: -1 })
      .lean();

    const data = contacts.map((c: any) => {
      const company = c.companyId && typeof c.companyId === 'object'
        ? { _id: c.companyId._id.toString(), name: c.companyId.name }
        : undefined;
      const normalizedCompanyId = c.companyId && typeof c.companyId === 'object'
        ? c.companyId._id.toString()
        : c.companyId?.toString();
      return {
        _id: c._id.toString(),
        companyId: normalizedCompanyId,
        company,
        name: c.name,
        email: c.email,
        roleTitle: c.roleTitle,
        linkedinUrl: c.linkedinUrl,
        status: c.status,
        lastContactedAt: c.lastContactedAt,
        notes: c.notes,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(body.companyId)) {
      return NextResponse.json({ success: false, error: 'Invalid companyId' }, { status: 400 });
    }

    const companyExists = await OutreachCompany.exists({ _id: body.companyId });
    if (!companyExists) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    const contact = new OutreachContact({
      companyId: body.companyId,
      name: body.name,
      email: body.email,
      roleTitle: body.roleTitle || undefined,
      linkedinUrl: body.linkedinUrl || undefined,
      status: body.status || 'new',
      notes: body.notes || undefined,
    });

    await contact.validate();
    await contact.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: contact._id.toString(),
        companyId: contact.companyId.toString(),
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
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, error: 'Contact already exists' }, { status: 409 });
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create contact' },
      { status: 400 }
    );
  }
}

