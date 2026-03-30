import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { ResumeVariant } from '@/models/ResumeVariant';
import { ensureDashboardAuth } from '../../../job-hunt/_auth';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ success: false, error: 'Invalid resume id' }, { status: 400 });
  }

  try {
    await connectDB();

    const variant = await ResumeVariant.findById(id);
    if (!variant) {
      return NextResponse.json({ success: false, error: 'Resume variant not found' }, { status: 404 });
    }

    await ResumeVariant.updateMany({}, { $set: { isPrimary: false } });
    variant.isPrimary = true;
    await variant.save();

    return NextResponse.json({ success: true, data: { _id: String(variant._id), isPrimary: true } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to set primary resume' },
      { status: 500 }
    );
  }
}
