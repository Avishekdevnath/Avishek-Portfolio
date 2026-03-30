import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import ApplicationContactModel from '@/models/ApplicationContact';
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

    const contacts = await ApplicationContactModel.find({ applicationId: id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: contacts.map((c: any) => ({ ...c, _id: c._id.toString(), applicationId: c.applicationId.toString() })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch contacts' }, { status: 500 });
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

    const body = await request.json();
    const { name, title, company, roleAtCompany, linkedinUrl, email, phone, bio, referralStatus, referralNote } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'Contact name is required' }, { status: 400 });
    }

    const contact = await ApplicationContactModel.create({
      applicationId: id,
      name: name.trim(),
      title: title || 'Other',
      company: company?.trim() || undefined,
      roleAtCompany: roleAtCompany?.trim() || undefined,
      linkedinUrl: linkedinUrl?.trim() || undefined,
      email: email?.trim().toLowerCase() || undefined,
      phone: phone?.trim() || undefined,
      bio: bio?.trim() || undefined,
      referralStatus: referralStatus || undefined,
      referralNote: referralNote?.trim() || undefined,
    });

    return NextResponse.json(
      { success: true, data: { ...contact.toObject(), _id: contact._id.toString(), applicationId: id } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create contact' }, { status: 500 });
  }
}
