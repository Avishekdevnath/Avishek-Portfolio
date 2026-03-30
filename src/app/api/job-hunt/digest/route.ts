import { NextRequest, NextResponse } from 'next/server';
import { ensureDashboardAuth } from '../_auth';
import { connectDB } from '@/lib/mongodb';
import JobLead from '@/models/JobLead';
import { buildJobHuntDigestHtml } from '@/lib/job-hunt-digest';
import { sendEmailNotification } from '@/lib/email';

function isDhakaLead(location?: string, jobType?: string) {
  const value = `${location || ''} ${jobType || ''}`.toLowerCase();
  return value.includes('dhaka') || value.includes('bangladesh') || value.includes('onsite');
}

export async function POST(request: NextRequest) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json().catch(() => ({} as { onlyToday?: boolean; sendEmail?: boolean }));
    const onlyToday = body.onlyToday !== false;
    const shouldSend = body.sendEmail !== false;

    const start = new Date();
    if (onlyToday) start.setHours(0, 0, 0, 0);
    else start.setDate(start.getDate() - 1);

    const leads = await JobLead.find({ dateFound: { $gte: start } })
      .sort({ dateFound: -1 })
      .limit(120)
      .lean();

    const normalized = leads.map((lead) => ({
      title: lead.title,
      company: lead.company,
      location: lead.location,
      jobType: lead.jobType,
      source: lead.source,
      jobUrl: lead.jobUrl,
    }));

    const dhakaJobs = normalized.filter((lead) => isDhakaLead(lead.location, lead.jobType));
    const remoteJobs = normalized.filter((lead) => !isDhakaLead(lead.location, lead.jobType));

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const html = buildJobHuntDigestHtml({
      dateLabel: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' }),
      remoteJobs,
      dhakaJobs,
      leadsUrl: `${siteUrl}/dashboard/job-hunt/leads`,
    });

    let emailSent = false;

    if (shouldSend) {
      await sendEmailNotification({
        subject: `Daily Job Digest — ${new Date().toLocaleDateString()} (${normalized.length} jobs)`,
        text: `Daily Job Digest\nRemote: ${remoteJobs.length}\nDhaka: ${dhakaJobs.length}\nTotal: ${normalized.length}`,
        html,
      });
      emailSent = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
    }

    return NextResponse.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        total: normalized.length,
        remote: remoteJobs.length,
        dhaka: dhakaJobs.length,
        emailSent,
        previewHtml: html,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to build digest' },
      { status: 500 }
    );
  }
}
