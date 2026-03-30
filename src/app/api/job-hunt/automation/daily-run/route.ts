import { NextRequest, NextResponse } from 'next/server';
import { ensureDashboardAuth } from '../../_auth';

export async function POST(request: NextRequest) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    const origin = request.nextUrl.origin;
    const cookie = request.headers.get('cookie') || '';

    const fetchRes = await fetch(`${origin}/api/job-hunt/leads/fetch`, {
      method: 'POST',
      headers: { cookie },
      cache: 'no-store',
    });

    const fetchData = (await fetchRes.json()) as {
      success: boolean;
      data?: {
        fetched: number;
        inserted: number;
        skipped: number;
        failedSources: string[];
      };
      error?: string;
    };

    if (!fetchData.success) {
      return NextResponse.json({ success: false, error: fetchData.error || 'Lead fetch failed' }, { status: 500 });
    }

    const digestRes = await fetch(`${origin}/api/job-hunt/digest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie,
      },
      body: JSON.stringify({ onlyToday: true, sendEmail: true }),
      cache: 'no-store',
    });

    const digestData = (await digestRes.json()) as {
      success: boolean;
      data?: {
        total: number;
        remote: number;
        dhaka: number;
        emailSent: boolean;
      };
      error?: string;
    };

    if (!digestData.success) {
      return NextResponse.json({ success: false, error: digestData.error || 'Digest failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        fetch: fetchData.data,
        digest: digestData.data,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Daily run failed' },
      { status: 500 }
    );
  }
}
