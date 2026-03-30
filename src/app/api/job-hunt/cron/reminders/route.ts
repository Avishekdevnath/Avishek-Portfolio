import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import { sendPushNotification } from '@/lib/push';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret');
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const now = new Date();
    const due = await JobApplication.find({
      followUpReminderAt: { $lte: now },
      reminderFired: false,
    })
      .select('_id company jobTitle')
      .lean();

    if (due.length === 0) {
      return NextResponse.json({ success: true, fired: 0 });
    }

    // Fire push notifications
    await Promise.allSettled(
      due.map((app: any) =>
        sendPushNotification({
          title: 'Follow-up Reminder',
          body: `${app.company} — ${app.jobTitle}`,
          url: `/dashboard/job-hunt/applications/${app._id.toString()}`,
        })
      )
    );

    // Mark all as fired
    const ids = due.map((app: any) => app._id);
    await JobApplication.updateMany({ _id: { $in: ids } }, { reminderFired: true });

    return NextResponse.json({ success: true, fired: due.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Cron job failed' }, { status: 500 });
  }
}
