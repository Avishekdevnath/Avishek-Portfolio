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

    // Clear file info but keep variant data, tags, markdown, etc.
    variant.fileUrl = undefined;
    variant.filePathname = undefined;
    variant.fileName = undefined;
    variant.fileSizeBytes = undefined;
    variant.mimeType = undefined;
    variant.currentFileVersion = 0;
    variant.status = 'draft'; // Reset to draft since no file
    variant.publicViewEnabled = false; // Can't be public without a file

    await variant.save();

    return NextResponse.json({
      success: true,
      data: {
        ...variant.toObject(),
        _id: String(variant._id),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to remove file' },
      { status: 500 }
    );
  }
}
