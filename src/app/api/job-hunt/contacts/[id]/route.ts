import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import JobContact from '@/models/JobContact';
import { ensureDashboardAuth } from '../../_auth';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid contact id' }, { status: 400 });
    }

    const item = await JobContact.findById(params.id).lean();
    if (!item) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { ...item, _id: item._id.toString() } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch contact' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid contact id' }, { status: 400 });
    }

    const body = await request.json();
    const updated = await JobContact.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { ...updated, _id: updated._id.toString() } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update contact' },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid contact id' }, { status: 400 });
    }

    const deleted = await JobContact.findByIdAndDelete(params.id).lean();
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { _id: deleted._id.toString() } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
