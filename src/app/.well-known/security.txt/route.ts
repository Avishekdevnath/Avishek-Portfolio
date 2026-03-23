import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/url';

export function GET() {
  const siteUrl = getSiteUrl();
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  const content = [
    `Contact: ${siteUrl}/contact`,
    `Expires: ${expires.toISOString()}`,
    'Preferred-Languages: en',
    `Canonical: ${siteUrl}/.well-known/security.txt`,
  ].join('\n');

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
