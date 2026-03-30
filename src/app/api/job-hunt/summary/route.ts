import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import JobLead from '@/models/JobLead';
import { ensureDashboardAuth } from '../_auth';

export async function GET() {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const safeCount = async (fn: () => Promise<number>): Promise<number> => {
      try { return await fn(); } catch { return 0; }
    };

    const [
      totalApplications,
      overdueCount,
      followUpSoonCount,
      pipelineApplied,
      pipelineInterview,
      pipelineOffer,
      newLeadsCount,
    ] = await Promise.all([
      safeCount(() => JobApplication.countDocuments({})),
      safeCount(() => JobApplication.countDocuments({
        status: 'Applied',
        dateApplied: { $lte: fourteenDaysAgo },
      })),
      safeCount(() => JobApplication.countDocuments({
        status: 'Applied',
        dateApplied: { $lte: sevenDaysAgo, $gt: fourteenDaysAgo },
      })),
      safeCount(() => JobApplication.countDocuments({ status: 'Applied' })),
      safeCount(() => JobApplication.countDocuments({ status: 'Interview' })),
      safeCount(() => JobApplication.countDocuments({ status: 'Offer' })),
      safeCount(() => JobLead.countDocuments({ status: 'New' })),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalApplications,
        overdueCount,
        followUpSoonCount,
        pipeline: {
          applied: pipelineApplied,
          interview: pipelineInterview,
          offer: pipelineOffer,
        },
        newLeadsCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job hunt summary' },
      { status: 500 }
    );
  }
}
