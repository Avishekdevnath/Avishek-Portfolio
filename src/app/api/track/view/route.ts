import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PageView from '@/models/PageView';

const PUBLIC_ROUTES = new Set([
  '/', '/about', '/contact', '/hire-me', '/education',
  '/tools', '/projects', '/blogs', '/resume',
]);

function isPublicPath(path: string): boolean {
  if (PUBLIC_ROUTES.has(path)) return true;
  return (
    path.startsWith('/projects/') ||
    path.startsWith('/blogs/') ||
    path.startsWith('/resume/')
  );
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const { path, userAgent, timestamp } = body as {
    path?: string;
    userAgent?: string;
    timestamp?: number;
  };

  if (!path || typeof path !== 'string' || !isPublicPath(path)) {
    return NextResponse.json({ success: false });
  }

  // Skip tracking for owner's IP
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '';
  const excludedIps = (process.env.EXCLUDED_IPS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  if (clientIp && excludedIps.includes(clientIp)) {
    return NextResponse.json({ success: true, skipped: true });
  }

  try {
    await connectDB();
    await PageView.create({
      path,
      userAgent: userAgent ? String(userAgent).slice(0, 500) : undefined,
      isBot: false, // client-side means JS executed = human
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[track/view]', error);
    return NextResponse.json({ success: false });
  }
}
