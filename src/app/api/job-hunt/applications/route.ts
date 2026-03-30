import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import { daysSince, getFollowUpAlert } from '@/lib/job-hunt-utils';
import { ensureDashboardAuth } from '../_auth';

interface ApplicationQuery {
  status?: string;
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
    const status = searchParams.get('status');
    const q = (searchParams.get('q') || '').trim();
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit') || '20')));
    const sortBy = searchParams.get('sortBy') || 'dateApplied';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const query: ApplicationQuery = {};
    if (status) query.status = status;
    if (q) {
      const regex = new RegExp(escapeRegex(q), 'i');
      query.$or = [
        { company: regex },
        { jobTitle: regex },
        { location: regex },
      ];
    }

    const total = await JobApplication.countDocuments(query);
    const pages = Math.ceil(total / limit) || 1;

    const applications = await JobApplication.find(query)
      .sort({ [sortBy]: sortOrder, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const items = applications.map((item) => {
      const appliedDays = daysSince(item.dateApplied);
      const alert = getFollowUpAlert(item.status, appliedDays);

      return {
        ...item,
        _id: item._id.toString(),
        sourceLeadId: item.sourceLeadId ? item.sourceLeadId.toString() : undefined,
        daysSinceApplied: appliedDays,
        followUpAlert: alert,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          pages,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch applications',
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
    const application = new JobApplication(body);
    await application.validate();
    await application.save();

    return NextResponse.json({
      success: true,
      data: {
        ...application.toObject(),
        _id: application.id,
        sourceLeadId: application.sourceLeadId ? application.sourceLeadId.toString() : undefined,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create application',
      },
      { status: 400 }
    );
  }
}
