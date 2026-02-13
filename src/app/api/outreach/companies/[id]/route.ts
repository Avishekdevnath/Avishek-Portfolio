import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import OutreachCompany from '@/models/OutreachCompany';
import OutreachContact from '@/models/OutreachContact';
import { ensureDashboardAuth } from '../../_auth';

export async function GET(_: NextRequest, context: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  const { id } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid company id' }, { status: 400 });
  }

  try {
    await connectDB();
    const company = await OutreachCompany.findById(id).lean();
    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: company._id.toString(),
        name: company.name,
        website: company.website,
        careerPageUrl: company.careerPageUrl,
        tags: company.tags || [],
        notes: company.notes,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch company' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  const { id } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid company id' }, { status: 400 });
  }

  try {
    await connectDB();
    const company = await OutreachCompany.findById(id);
    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    const body = await request.json();

    if (typeof body.name === 'string') company.name = body.name;
    if (typeof body.website === 'string') company.website = body.website || undefined;
    if (typeof body.careerPageUrl === 'string') company.careerPageUrl = body.careerPageUrl || undefined;
    if (typeof body.notes === 'string') company.notes = body.notes || undefined;
    if (typeof body.tags === 'string') {
      company.tags = body.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean);
    } else if (Array.isArray(body.tags)) {
      company.tags = body.tags.map((t: any) => String(t).trim()).filter(Boolean);
    }

    await company.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: company._id.toString(),
        name: company.name,
        website: company.website,
        careerPageUrl: company.careerPageUrl,
        tags: company.tags || [],
        notes: company.notes,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, error: 'Company already exists' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update company' }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  const { id } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid company id' }, { status: 400 });
  }

  try {
    await connectDB();

    const contactsCount = await OutreachContact.countDocuments({ companyId: id });
    if (contactsCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Delete contacts linked to this company first' },
        { status: 409 }
      );
    }

    const company = await OutreachCompany.findByIdAndDelete(id);
    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Company deleted' });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete company' }, { status: 500 });
  }
}

