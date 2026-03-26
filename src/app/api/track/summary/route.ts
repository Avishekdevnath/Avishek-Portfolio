import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PageView from '@/models/PageView';
import { ensureDashboardAuth } from '@/app/api/job-hunt/_auth';

function getRangeMs(range: string): number {
  if (range === '30d') return 30 * 24 * 60 * 60 * 1000;
  if (range === '90d') return 90 * 24 * 60 * 60 * 1000;
  return 7 * 24 * 60 * 60 * 1000; // default 7d
}

function normalizeReferer(raw: string | null | undefined): string {
  if (!raw) return 'direct';
  try {
    const url = new URL(raw);
    return url.hostname || 'direct';
  } catch {
    return 'unknown';
  }
}

export async function GET(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  const range = request.nextUrl.searchParams.get('range') ?? '7d';
  const since = new Date(Date.now() - getRangeMs(range));

  try {
    await connectDB();

    const [totals, topPages, topReferrers, topCountries, dailyRaw] = await Promise.all([
      // Total / human / bot counts
      PageView.aggregate([
        { $match: { timestamp: { $gte: since } } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: 1 },
            humanViews: { $sum: { $cond: [{ $eq: ['$isBot', false] }, 1, 0] } },
            botViews:   { $sum: { $cond: [{ $eq: ['$isBot', true]  }, 1, 0] } },
          },
        },
      ]),

      // Top 10 pages
      PageView.aggregate([
        { $match: { timestamp: { $gte: since } } },
        {
          $group: {
            _id: '$path',
            views:      { $sum: 1 },
            humanViews: { $sum: { $cond: [{ $eq: ['$isBot', false] }, 1, 0] } },
          },
        },
        { $sort: { views: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, path: '$_id', views: 1, humanViews: 1 } },
      ]),

      // Top 10 referrers (all visits)
      PageView.aggregate([
        { $match: { timestamp: { $gte: since }, referer: { $exists: true, $ne: '' } } },
        {
          $group: {
            _id:   '$referer',
            views: { $sum: 1 },
          },
        },
        { $sort: { views: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, referer: '$_id', views: 1 } },
      ]),

      // Top 10 countries (human only)
      PageView.aggregate([
        { $match: { timestamp: { $gte: since }, isBot: false, country: { $exists: true, $ne: '' } } },
        {
          $group: {
            _id:   '$country',
            views: { $sum: 1 },
          },
        },
        { $sort: { views: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, country: '$_id', views: 1 } },
      ]),

      // Daily trend
      PageView.aggregate([
        { $match: { timestamp: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
            },
            humanViews: { $sum: { $cond: [{ $eq: ['$isBot', false] }, 1, 0] } },
            botViews:   { $sum: { $cond: [{ $eq: ['$isBot', true]  }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', humanViews: 1, botViews: 1 } },
      ]),
    ]);

    const summary = totals[0] ?? { totalViews: 0, humanViews: 0, botViews: 0 };

    // Normalize referrer hostnames
    const normalizedReferrers = (topReferrers as Array<{ referer: string; views: number }>).map((r) => ({
      referer: normalizeReferer(r.referer),
      views: r.views,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalViews:   summary.totalViews,
        humanViews:   summary.humanViews,
        botViews:     summary.botViews,
        topPages,
        topReferrers: normalizedReferrers,
        topCountries,
        dailyTrend:   dailyRaw,
      },
    });
  } catch (error) {
    console.error('[track/summary]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch summary' }, { status: 500 });
  }
}
