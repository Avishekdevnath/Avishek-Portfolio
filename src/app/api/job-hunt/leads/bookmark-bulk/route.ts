import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import JobLead from '@/models/JobLead';
import { BookmarkedJob } from '@/models/BookmarkedJob';
import { PlatformList } from '@/models/PlatformList';
import { ensureDashboardAuth } from '../../_auth';

function normalize(value: string) {
  return String(value || '').trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? body.ids : [];

    if (!ids.length) {
      return NextResponse.json({ success: false, error: 'ids must be a non-empty array' }, { status: 400 });
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (!validIds.length) {
      return NextResponse.json({ success: false, error: 'No valid lead ids provided' }, { status: 400 });
    }

    const leads = await JobLead.find({ _id: { $in: validIds } }).lean();
    if (!leads.length) {
      return NextResponse.json({ success: false, error: 'No leads found for provided ids' }, { status: 404 });
    }

    const sourceSet = Array.from(new Set(leads.map((lead) => normalize((lead as any).source))));
    const activePlatforms = await PlatformList.find({ name: { $in: sourceSet }, isActive: true }).lean();
    const activeSet = new Set(activePlatforms.map((p) => normalize((p as any).name)));

    const urlSet = new Set(leads.map((lead) => String((lead as any).jobUrl || '').trim()).filter(Boolean));
    const existingByUrl = await BookmarkedJob.find({ jobUrl: { $in: Array.from(urlSet) } })
      .select('jobUrl jobTitle company platform')
      .lean();

    const existingUrlSet = new Set(existingByUrl.map((b) => String((b as any).jobUrl || '').trim()));
    const existingKeySet = new Set(
      existingByUrl.map((b) => `${normalize((b as any).jobTitle)}::${normalize((b as any).company)}::${normalize((b as any).platform)}`)
    );

    const inserts: Array<Record<string, unknown>> = [];
    let alreadyExists = 0;
    let skippedInvalidPlatform = 0;

    for (const lead of leads) {
      const source = normalize((lead as any).source);
      if (!activeSet.has(source)) {
        skippedInvalidPlatform += 1;
        continue;
      }

      const key = `${normalize((lead as any).title)}::${normalize((lead as any).company)}::${source}`;
      const url = String((lead as any).jobUrl || '').trim();
      if (existingUrlSet.has(url) || existingKeySet.has(key)) {
        alreadyExists += 1;
        continue;
      }

      existingUrlSet.add(url);
      existingKeySet.add(key);

      inserts.push({
        jobTitle: (lead as any).title,
        company: (lead as any).company,
        platform: source,
        jobUrl: (lead as any).jobUrl,
        notes: (lead as any).location
          ? `Lead source: ${(lead as any).source} • Location: ${(lead as any).location}`
          : `Lead source: ${(lead as any).source}`,
        status: 'saved',
        bookmarkedDate: new Date(),
      });
    }

    let created = 0;
    if (inserts.length > 0) {
      const result = await BookmarkedJob.insertMany(inserts, { ordered: false });
      created = result.length;
    }

    return NextResponse.json({
      success: true,
      data: {
        requested: ids.length,
        processed: leads.length,
        created,
        alreadyExists,
        skippedInvalidPlatform,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to bulk-save leads as bookmarks' },
      { status: 500 }
    );
  }
}
