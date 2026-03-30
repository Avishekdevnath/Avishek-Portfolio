import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PageView from '@/models/PageView';

const OWN_HOSTNAMES = ['avishekdevnath.com', 'www.avishekdevnath.com'];

function normalizeReferer(raw: string | undefined): string {
  if (!raw) return '';
  try {
    const hostname = new URL(raw).hostname;
    if (OWN_HOSTNAMES.includes(hostname)) return ''; // treat internal nav as direct
    return hostname || '';
  } catch {
    return '';
  }
}

export async function POST(request: NextRequest) {
  // Validate internal token — INTERNAL_TOKEN must be set and match
  const envToken = process.env.INTERNAL_TOKEN;
  const reqToken = request.headers.get('x-internal-token');
  if (!envToken || !reqToken || reqToken !== envToken) {
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

  // Skip tracking for owner's IP
  const excludedIps = (process.env.EXCLUDED_IPS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  if (ip && excludedIps.includes(ip)) {
    return NextResponse.json({ success: true, skipped: true });
  }

  try {
    await connectDB();
    const normalizedRef = normalizeReferer(referer);
    await PageView.create({
      path,
      referer:   normalizedRef || undefined,
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
