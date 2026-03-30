import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import JobContact from '@/models/JobContact';
import { ensureDashboardAuth } from '../_auth';

interface ContactQuery {
  status?: string;
  relationship?: string;
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
    const relationship = searchParams.get('relationship');
    const q = (searchParams.get('q') || '').trim();
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit') || '20')));
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const query: ContactQuery = {};
    if (status) query.status = status;
    if (relationship) query.relationship = relationship;
    if (q) {
      const regex = new RegExp(escapeRegex(q), 'i');
      query.$or = [
        { name: regex },
        { company: regex },
        { titleOrRole: regex },
        { notes: regex },
      ];
    }

    const total = await JobContact.countDocuments(query);
    const pages = Math.ceil(total / limit) || 1;

    const items = await JobContact.find(query)
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
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch contacts' },
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

    const item = new JobContact(body);
    await item.validate();
    await item.save();

    return NextResponse.json({
      success: true,
      data: { ...item.toObject(), _id: item.id },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create contact' },
      { status: 400 }
    );
  }
}
