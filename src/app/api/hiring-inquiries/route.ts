import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HiringInquiry from '@/models/HiringInquiry';

// Simple in-memory rate limit by IP
const rateLimiter = new Map<string, { count: number; ts: number }>();
const RATE_LIMIT = 5; // per hour
const RATE_WINDOW = 60 * 60 * 1000;

function allowRequest(ip: string) {
  const now = Date.now();
  const entry = rateLimiter.get(ip);
  if (!entry || now - entry.ts > RATE_WINDOW) {
    rateLimiter.set(ip, { count: 1, ts: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';

    const query: any = {};
    if (status !== 'all') query.status = status;

    const skip = (page - 1) * limit;
    const [items, total, stats] = await Promise.all([
      HiringInquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      HiringInquiry.countDocuments(query),
      HiringInquiry.getStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        inquiries: items,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          totalItems: total,
        },
        stats,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.ip || 'unknown';
    if (!allowRequest(ip)) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const { company, email, role, message } = body || {};

    if (!email || !message) {
      return NextResponse.json({ success: false, error: 'Email and message are required' }, { status: 400 });
    }

    const created = await HiringInquiry.create({
      company,
      email,
      role,
      message,
      ipAddress: ip,
      userAgent: request.headers.get('user-agent'),
      status: 'new',
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create inquiry' }, { status: 500 });
  }
}


