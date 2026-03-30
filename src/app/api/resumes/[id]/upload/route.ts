import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { ResumeVariant } from '@/models/ResumeVariant';
import { ensureDashboardAuth } from '../../../job-hunt/_auth';
import { uploadResumeFile, validateResumeFile } from '@/lib/resume-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const form = await request.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    validateResumeFile(file);

    const maxHistoryVersion = variant.fileVersions.reduce(
      (max: number, entry: any) => Math.max(max, Number(entry.version || 0)),
      0
    );

    const currentVersion =
      variant.currentFileVersion || (variant.fileUrl ? Math.max(1, maxHistoryVersion + 1) : 0);

    if (variant.fileUrl) {
      variant.fileVersions.push({
        version: currentVersion,
        url: variant.fileUrl,
        pathname: variant.filePathname || undefined,
        fileName: variant.fileName || undefined,
        fileSizeBytes: variant.fileSizeBytes || undefined,
        mimeType: variant.mimeType || undefined,
        uploadedAt: variant.updatedAt || new Date(),
      });
    }

    const result = await uploadResumeFile(file, variant.slug);
    const nextVersion = Math.max(currentVersion, maxHistoryVersion) + 1;

    variant.fileUrl = result.url;
    variant.filePathname = result.pathname;
    variant.fileName = file.name;
    variant.fileSizeBytes = file.size;
    variant.mimeType = file.type;
    variant.currentFileVersion = nextVersion;
    variant.status = 'ready';

    await variant.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: String(variant._id),
        fileUrl: variant.fileUrl,
        fileName: variant.fileName,
        fileSizeBytes: variant.fileSizeBytes,
        mimeType: variant.mimeType,
        currentFileVersion: variant.currentFileVersion,
        status: variant.status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to upload resume' },
      { status: 500 }
    );
  }
}
