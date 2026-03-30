import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import { APPLICATION_STATUSES, daysSince } from '@/lib/job-hunt-utils';
import { ensureDashboardAuth } from '../_auth';

function monthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export async function GET() {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const applications = await JobApplication.find({})
      .sort({ dateApplied: -1 })
      .lean();

    const totalApplications = applications.length;

    const statusCounts = APPLICATION_STATUSES.reduce<Record<string, number>>((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    let dueSoon = 0;
    let overdue = 0;

    for (const app of applications) {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;

      if (app.status === 'Applied' || app.status === 'No Response') {
        const days = daysSince(app.dateApplied);
        if (days >= 14) overdue += 1;
        else if (days >= 7) dueSoon += 1;
      }
    }

    const monthlyMap = new Map<
      string,
      { label: string; applied: number; responses: number; interviews: number }
    >();

    for (const app of applications) {
      const date = new Date(app.dateApplied);
      if (Number.isNaN(date.getTime())) continue;

      const key = monthKey(date);
      const entry = monthlyMap.get(key) || {
        label: monthLabel(date),
        applied: 0,
        responses: 0,
        interviews: 0,
      };

      entry.applied += 1;

      if (['Phone Screen', 'Interview', 'Offer', 'Rejected'].includes(app.status)) {
        entry.responses += 1;
      }

      if (['Interview', 'Offer'].includes(app.status)) {
        entry.interviews += 1;
      }

      monthlyMap.set(key, entry);
    }

    const monthlyResponseRate = [...monthlyMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, entry]) => ({
        month: entry.label,
        applied: entry.applied,
        responses: entry.responses,
        responseRate: entry.applied > 0 ? Number(((entry.responses / entry.applied) * 100).toFixed(1)) : 0,
        interviews: entry.interviews,
        interviewRate: entry.applied > 0 ? Number(((entry.interviews / entry.applied) * 100).toFixed(1)) : 0,
      }));

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const weeklySummary = { applications: 0, responses: 0, interviews: 0, offers: 0 };
    const monthlySummary = { applications: 0, responses: 0, interviews: 0, offers: 0 };

    for (const app of applications) {
      const date = new Date(app.dateApplied);
      if (Number.isNaN(date.getTime())) continue;

      const isResponse = ['Phone Screen', 'Interview', 'Offer', 'Rejected'].includes(app.status);
      const isInterview = ['Interview', 'Offer'].includes(app.status);
      const isOffer = app.status === 'Offer';

      if (date >= weekAgo && date <= now) {
        weeklySummary.applications += 1;
        if (isResponse) weeklySummary.responses += 1;
        if (isInterview) weeklySummary.interviews += 1;
        if (isOffer) weeklySummary.offers += 1;
      }

      if (date >= monthStart && date <= now) {
        monthlySummary.applications += 1;
        if (isResponse) monthlySummary.responses += 1;
        if (isInterview) monthlySummary.interviews += 1;
        if (isOffer) monthlySummary.offers += 1;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalApplications,
        statusCounts,
        followUp: {
          dueSoon,
          overdue,
        },
        monthlyResponseRate,
        weeklySummary,
        monthlySummary,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
