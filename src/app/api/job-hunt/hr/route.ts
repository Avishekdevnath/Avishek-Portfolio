import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { JobHuntHRContact } from '@/models/JobHuntHRContact';
import { JobHuntCompany } from '@/models/JobHuntCompany';
import { ensureDashboardAuth } from '../_auth';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let filter: any = {};

    if (companyId) {
      if (!Types.ObjectId.isValid(companyId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid company ID' },
          { status: 400 }
        );
      }
      filter.companyId = new Types.ObjectId(companyId);
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const hrContacts = await JobHuntHRContact.find(filter)
      .populate('companyId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await JobHuntHRContact.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: hrContacts.map((contact: any) => ({
        _id: String(contact._id),
        companyId: String(contact.companyId._id),
        companyName: contact.companyId.name,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        linkedinUrl: contact.linkedinUrl,
        roleTitle: contact.roleTitle,
        status: contact.status,
        lastContactedAt: contact.lastContactedAt,
        nextFollowUpAt: contact.nextFollowUpAt,
        notes: contact.notes,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch HR contacts',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { companyId, name, email, phone, linkedinUrl, roleTitle, notes } = body;

    if (!companyId || !Types.ObjectId.isValid(companyId)) {
      return NextResponse.json(
        { success: false, error: 'Valid company ID is required' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'HR contact name is required' },
        { status: 400 }
      );
    }

    // Verify company exists
    const company = await JobHuntCompany.findById(companyId);
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    const hrContact = new JobHuntHRContact({
      companyId: new Types.ObjectId(companyId),
      name: name.trim(),
      email: email || undefined,
      phone: phone || undefined,
      linkedinUrl: linkedinUrl || undefined,
      roleTitle: roleTitle || undefined,
      status: 'New',
      notes: notes || undefined,
    });

    const savedContact = await hrContact.save();
    await savedContact.populate('companyId', 'name');

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: String(savedContact._id),
          companyId: String((savedContact.companyId as any)._id),
          companyName: (savedContact.companyId as any).name,
          name: savedContact.name,
          email: savedContact.email,
          phone: savedContact.phone,
          linkedinUrl: savedContact.linkedinUrl,
          roleTitle: savedContact.roleTitle,
          status: savedContact.status,
          lastContactedAt: savedContact.lastContactedAt,
          nextFollowUpAt: savedContact.nextFollowUpAt,
          notes: savedContact.notes,
          createdAt: savedContact.createdAt,
          updatedAt: savedContact.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create HR contact',
      },
      { status: 500 }
    );
  }
}
