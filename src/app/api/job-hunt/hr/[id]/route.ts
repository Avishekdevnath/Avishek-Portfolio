import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { JobHuntHRContact } from '@/models/JobHuntHRContact';
import { ensureDashboardAuth } from '../../_auth';
import { Types } from 'mongoose';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;
  const { id } = await params;

  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid HR contact ID' }, { status: 400 });
    }

    const hrContact = (await JobHuntHRContact.findById(id)
      .populate('companyId', 'name')
      .lean()) as any;

    if (!hrContact) {
      return NextResponse.json(
        { success: false, error: 'HR contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: String(hrContact._id),
        companyId: String((hrContact.companyId as any)._id),
        companyName: (hrContact.companyId as any).name,
        name: hrContact.name,
        email: hrContact.email,
        phone: hrContact.phone,
        linkedinUrl: hrContact.linkedinUrl,
        roleTitle: hrContact.roleTitle,
        status: hrContact.status,
        lastContactedAt: hrContact.lastContactedAt,
        nextFollowUpAt: hrContact.nextFollowUpAt,
        notes: hrContact.notes,
        createdAt: hrContact.createdAt,
        updatedAt: hrContact.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch HR contact',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;
  const { id } = await params;

  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid HR contact ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, phone, linkedinUrl, roleTitle, status, lastContactedAt, nextFollowUpAt, notes } = body;

    const hrContact = await JobHuntHRContact.findById(id);

    if (!hrContact) {
      return NextResponse.json(
        { success: false, error: 'HR contact not found' },
        { status: 404 }
      );
    }

    if (name !== undefined) hrContact.name = name.trim();
    if (email !== undefined) hrContact.email = email || undefined;
    if (phone !== undefined) hrContact.phone = phone || undefined;
    if (linkedinUrl !== undefined) hrContact.linkedinUrl = linkedinUrl || undefined;
    if (roleTitle !== undefined) hrContact.roleTitle = roleTitle || undefined;
    if (status !== undefined) hrContact.status = status;
    if (lastContactedAt !== undefined) hrContact.lastContactedAt = lastContactedAt ? new Date(lastContactedAt) : undefined;
    if (nextFollowUpAt !== undefined) hrContact.nextFollowUpAt = nextFollowUpAt ? new Date(nextFollowUpAt) : undefined;
    if (notes !== undefined) hrContact.notes = notes || undefined;

    const updatedContact = await hrContact.save();
    await updatedContact.populate('companyId', 'name');

    return NextResponse.json({
      success: true,
      data: {
        _id: String(updatedContact._id),
        companyId: String((updatedContact.companyId as any)._id),
        companyName: (updatedContact.companyId as any).name,
        name: updatedContact.name,
        email: updatedContact.email,
        phone: updatedContact.phone,
        linkedinUrl: updatedContact.linkedinUrl,
        roleTitle: updatedContact.roleTitle,
        status: updatedContact.status,
        lastContactedAt: updatedContact.lastContactedAt,
        nextFollowUpAt: updatedContact.nextFollowUpAt,
        notes: updatedContact.notes,
        createdAt: updatedContact.createdAt,
        updatedAt: updatedContact.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update HR contact',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;
  const { id } = await params;

  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid HR contact ID' }, { status: 400 });
    }

    const hrContact = await JobHuntHRContact.findByIdAndDelete(id);

    if (!hrContact) {
      return NextResponse.json(
        { success: false, error: 'HR contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'HR contact deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete HR contact',
      },
      { status: 500 }
    );
  }
}
