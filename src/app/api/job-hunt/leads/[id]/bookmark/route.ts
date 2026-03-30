import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import JobLead from '@/models/JobLead';
import { BookmarkedJob } from '@/models/BookmarkedJob';
import { PlatformList } from '@/models/PlatformList';
import { ensureDashboardAuth } from '../../../_auth';
import { formatBookmarkResponse } from '@/lib/bookmark-helpers';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'Invalid lead id' }, { status: 400 });
    }

    const lead = await JobLead.findById(params.id).lean();
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const normalizedPlatform = String((lead as any).source || '').trim().toLowerCase();
    const platformExists = await PlatformList.findOne({ name: normalizedPlatform, isActive: true }).lean();
    if (!platformExists) {
      return NextResponse.json(
        {
          success: false,
          error: `Platform '${normalizedPlatform}' is not active. Please add/activate it in Platforms first.`,
        },
        { status: 400 }
      );
    }

    const existing = await BookmarkedJob.findOne({
      $or: [
        { jobUrl: (lead as any).jobUrl },
        { jobTitle: (lead as any).title, company: (lead as any).company, platform: normalizedPlatform },
      ],
    }).lean();

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          data: formatBookmarkResponse(existing as any),
          meta: { alreadyExists: true },
        },
        { status: 200 }
      );
    }

    const created = await BookmarkedJob.create({
      jobTitle: (lead as any).title,
      company: (lead as any).company,
      platform: normalizedPlatform,
      jobUrl: (lead as any).jobUrl,
      notes: (lead as any).location ? `Lead source: ${(lead as any).source} • Location: ${(lead as any).location}` : `Lead source: ${(lead as any).source}`,
      status: 'saved',
      bookmarkedDate: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        data: formatBookmarkResponse(created as any),
        meta: { alreadyExists: false },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to save lead as bookmark' },
      { status: 500 }
    );
  }
}
