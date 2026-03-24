import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import JobActivity from '@/models/JobActivity';
import { ensureDashboardAuth } from '../_auth';

interface ActivityQuery {
  activityType?: string;
  priority?: string;
  followUpDone?: string;
  $or?: Array<Record<string, unknown>>;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const activityType = searchParams.get('activityType');
    const priority = searchParams.get('priority');
    const followUpDone = searchParams.get('followUpDone');
    const q = (searchParams.get('q') || '').trim();
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit') || '20')));
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const query: ActivityQuery = {};
    if (activityType) query.activityType = activityType;
    if (priority) query.priority = priority;
    if (followUpDone) query.followUpDone = followUpDone;
    if (q) {
      const regex = new RegExp(escapeRegex(q), 'i');
      query.$or = [
        { companyOrContact: regex },
        { description: regex },
      ];
    }

    const total = await JobActivity.countDocuments(query);
    const pages = Math.ceil(total / limit) || 1;

    const items = await JobActivity.find(query)
      .sort({ [sortBy]: sortOrder, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        items: items.map((item) => ({ ...item, _id: item._id.toString() })),
        pagination: { total, page, limit, pages },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch activities' },
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

    const item = new JobActivity(body);
    await item.validate();
    await item.save();

    return NextResponse.json({
      success: true,
      data: { ...item.toObject(), _id: item.id },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create activity' },
      { status: 400 }
    );
  }
}
