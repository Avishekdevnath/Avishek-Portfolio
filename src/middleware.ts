import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BOT_KEYWORDS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot',
  'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot',
  'applebot', 'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'petalbot',
  'crawler', 'spider', 'scraper', 'bot', 'curl', 'wget', 'python-requests',
  'go-http-client', 'axios', 'java/', 'httpclient', 'libwww',
];

function detectBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  const ua = userAgent.toLowerCase();
  return BOT_KEYWORDS.some((kw) => ua.includes(kw));
}

export function middleware(request: NextRequest, event: { waitUntil: (p: Promise<unknown>) => void }) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.get('auth')?.value === 'true';
  const isLoginPage = pathname === '/login';

  // ── Existing auth logic (unchanged) ──────────────────────────────────────
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ── Public route tracking ─────────────────────────────────────────────────
  // Skip localhost (dev environment)
  const host = request.headers.get('host') ?? '';
  const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1');

  // Skip Next.js prefetch requests (would inflate counts)
  const purpose = request.headers.get('Purpose') ?? request.headers.get('purpose') ?? '';
  const isPrefetch =
    purpose === 'prefetch' ||
    request.headers.get('Next-Router-Prefetch') === '1';

  if (!isLocalhost && !isPrefetch) {
    const ua        = request.headers.get('user-agent');
    const referer   = request.headers.get('referer') ?? '';
    const country   = request.headers.get('x-vercel-ip-country') ?? '';
    const forwarded = request.headers.get('x-forwarded-for') ?? '';
    const ip        = forwarded.split(',')[0].trim();
    const isBot     = detectBot(ua);

    const payload = JSON.stringify({
      path:      pathname,
      referer,
      country,
      ip,
      userAgent: ua ? ua.slice(0, 500) : '',
      isBot,
      timestamp: Date.now(),
    });

    const token    = process.env.INTERNAL_TOKEN ?? '';
    const trackUrl = new URL('/api/track/pageview', request.url).toString();

    // event.waitUntil keeps the fetch alive after the response is sent
    event.waitUntil(
      fetch(trackUrl, {
        method:  'POST',
        headers: {
          'Content-Type':     'application/json',
          'x-internal-token': token,
        },
        body: payload,
      }).catch(() => {/* swallow — never block the visitor */})
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/',
    '/about',
    '/contact',
    '/hire-me',
    '/education',
    '/tools',
    '/projects',
    '/projects/:path*',
    '/blogs',
    '/blogs/:path*',
    '/resume',
    '/resume/:path*',
  ],
};
