import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import JobInterview from '@/models/JobInterview';
import { ensureDashboardAuth } from '../_auth';

interface InterviewQuery {
  result?: string;
  interviewType?: string;
  $or?: Array<Record<string, unknown>>;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: NextRequest) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const result = searchParams.get('result');
    const interviewType = searchParams.get('interviewType');
    const q = (searchParams.get('q') || '').trim();
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit') || '20')));
    const sortBy = searchParams.get('sortBy') || 'interviewDate';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const query: InterviewQuery = {};
    if (result) query.result = result;
    if (interviewType) query.interviewType = interviewType;
    if (q) {
      const regex = new RegExp(escapeRegex(q), 'i');
      query.$or = [
        { company: regex },
        { jobTitle: regex },
        { interviewers: regex },
      ];
    }

    const total = await JobInterview.countDocuments(query);
    const pages = Math.ceil(total / limit) || 1;

    const items = await JobInterview.find(query)
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
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch interviews' },
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

    const item = new JobInterview(body);
    await item.validate();
    await item.save();

    return NextResponse.json({
      success: true,
      data: { ...item.toObject(), _id: item.id },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create interview' },
      { status: 400 }
    );
  }
}
