import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PlatformList } from '@/models/PlatformList';
import { BookmarkedJob } from '@/models/BookmarkedJob';
import { ensureDashboardAuth } from '../_auth';
import { seedPlatforms } from '@/lib/migrations/003-seed-platforms';

export async function GET(request: NextRequest) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const includeInactive = request.nextUrl.searchParams.get('includeInactive') === 'true';
    const baseFilter = includeInactive ? {} : { isActive: true };

    // Add search filter
    const search = (request.nextUrl.searchParams.get('search') || '').trim();
    let filter = { ...baseFilter };
    if (search) {
      filter = {
        ...filter,
        name: { $regex: search, $options: 'i' },
      };
    }

    let platforms = await PlatformList.find(filter).sort({ name: 1 }).lean();

    if (platforms.length === 0 && !search) {
      await seedPlatforms();
      platforms = await PlatformList.find(filter).sort({ name: 1 }).lean();
    }

    const counts = await BookmarkedJob.aggregate([
      {
        $group: {
          _id: '$platform',
          curatedJobsCount: { $sum: 1 },
        },
      },
    ]);

    const countByPlatform = new Map<string, number>(
      counts.map((row) => [String(row._id || '').toLowerCase(), Number(row.curatedJobsCount || 0)])
    );

    return NextResponse.json({
      success: true,
      data: platforms.map((p) => ({
        _id: String((p as any)._id),
        name: p.name,
        description: p.description,
        url: p.url,
        note: (p as any).note,
        needsReferral: Boolean((p as any).needsReferral),
        isActive: Boolean((p as any).isActive),
        curatedJobsCount: countByPlatform.get(String(p.name).toLowerCase()) || 0,
        priorityScore: (p as any).priorityScore,
        reputationScore: (p as any).reputationScore,
        remoteFocusScore: (p as any).remoteFocusScore,
        curationScore: (p as any).curationScore,
        payPotentialScore: (p as any).payPotentialScore,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch platforms',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const { name, description, url, note, needsReferral, publicReview, recommendation, reputationScore, remoteFocusScore, curationScore, payPotentialScore, priorityScore } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Platform name is required' },
        { status: 400 }
      );
    }

    const platform = new PlatformList({
      name: name.toLowerCase().trim(),
      description: description || undefined,
      url: url || undefined,
      note: note || undefined,
      needsReferral: Boolean(needsReferral),
      isActive: true,
      publicReview: publicReview || undefined,
      recommendation: recommendation || undefined,
      reputationScore: reputationScore != null && reputationScore !== '' ? Number(reputationScore) : undefined,
      remoteFocusScore: remoteFocusScore != null && remoteFocusScore !== '' ? Number(remoteFocusScore) : undefined,
      curationScore: curationScore != null && curationScore !== '' ? Number(curationScore) : undefined,
      payPotentialScore: payPotentialScore != null && payPotentialScore !== '' ? Number(payPotentialScore) : undefined,
      priorityScore: priorityScore != null && priorityScore !== '' ? Number(priorityScore) : undefined,
    });

    await platform.validate();
    await platform.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: platform._id.toString(),
          name: platform.name,
          description: platform.description,
          url: platform.url,
          note: platform.note,
          needsReferral: platform.needsReferral,
          isActive: platform.isActive,
          curatedJobsCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Platform already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create platform',
      },
      { status: 500 }
    );
  }
}
