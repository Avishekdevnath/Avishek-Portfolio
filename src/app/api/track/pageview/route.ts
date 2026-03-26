import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PageView from '@/models/PageView';

export async function POST(request: NextRequest) {
  // Validate internal token — return 200 silently on failure to avoid leaking endpoint
  const token = request.headers.get('x-internal-token');
  if (!token || token !== process.env.INTERNAL_TOKEN) {
    return NextResponse.json({ success: false });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const { path, referer, country, ip, userAgent, isBot, timestamp } = body as {
    path?: string;
    referer?: string;
    country?: string;
    ip?: string;
    userAgent?: string;
    isBot?: boolean;
    timestamp?: number;
  };

  if (!path || typeof path !== 'string') {
    return NextResponse.json({ success: false, error: 'path required' }, { status: 400 });
  }

  try {
    await connectDB();
    await PageView.create({
      path,
      referer:   referer || undefined,
      country:   country || undefined,
      ip:        ip || undefined,
      userAgent: userAgent ? String(userAgent).slice(0, 500) : undefined,
      isBot:     !!isBot,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[track/pageview]', error);
    return NextResponse.json({ success: false });
  }
}
