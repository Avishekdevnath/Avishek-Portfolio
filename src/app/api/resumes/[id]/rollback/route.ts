import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { ResumeVariant } from '@/models/ResumeVariant';
import { ensureDashboardAuth } from '../../../job-hunt/_auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ success: false, error: 'Invalid resume id' }, { status: 400 });
  }

  try {
    await connectDB();

    const body = await request.json();
    const targetVersionNumber = Number(body.version);
    const targetUrl = String(body.url || '').trim();

    if (!Number.isFinite(targetVersionNumber) && !targetUrl) {
      return NextResponse.json({ success: false, error: 'Target version is required' }, { status: 400 });
    }

    const variant = await ResumeVariant.findById(id);
    if (!variant) {
      return NextResponse.json({ success: false, error: 'Resume variant not found' }, { status: 404 });
    }

    const maxHistoryVersion = variant.fileVersions.reduce(
      (max: number, entry: any) => Math.max(max, Number(entry.version || 0)),
      0
    );
    const currentVersion =
      variant.currentFileVersion || (variant.fileUrl ? Math.max(1, maxHistoryVersion + 1) : 0);

    const targetVersion = variant.fileVersions.find((v: any) => {
      const byVersion = Number.isFinite(targetVersionNumber) && Number(v.version) === targetVersionNumber;
      const byUrl = !!targetUrl && v.url === targetUrl;
      return byVersion || byUrl;
    });
    if (!targetVersion) {
      return NextResponse.json({ success: false, error: 'Requested version not found' }, { status: 404 });
    }

    if (variant.fileUrl) {
      variant.fileVersions.push({
        version: currentVersion,
        url: variant.fileUrl,
        pathname: variant.filePathname || undefined,
        fileName: variant.fileName || undefined,
        fileSizeBytes: variant.fileSizeBytes || undefined,
        mimeType: variant.mimeType || undefined,
        uploadedAt: new Date(),
      });
    }

    variant.fileUrl = targetVersion.url;
    variant.filePathname = targetVersion.pathname || null;
    variant.fileName = targetVersion.fileName || null;
    variant.fileSizeBytes = targetVersion.fileSizeBytes || null;
    variant.mimeType = targetVersion.mimeType || null;
    variant.currentFileVersion = Number(targetVersion.version || 0);
    variant.status = 'ready';

    variant.fileVersions = variant.fileVersions.filter(
      (v: any) => !(Number(v.version) === Number(targetVersion.version) && v.url === targetVersion.url)
    );

    await variant.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: String(variant._id),
        fileUrl: variant.fileUrl,
        fileName: variant.fileName,
        currentFileVersion: variant.currentFileVersion,
        status: variant.status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to rollback resume version' },
      { status: 500 }
    );
  }
}
