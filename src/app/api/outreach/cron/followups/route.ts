import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import OutreachEmail from '@/models/OutreachEmail';
import Notification from '@/models/Notification';
import Settings from '@/models/Settings';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = request.nextUrl.searchParams.get('secret');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && cronSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    interface SettingsData {
      outreachSettings?: {
        maxFollowUps?: number;
      };
    }

    const settingsDoc = await Settings.findOne().lean();
    const settings = settingsDoc as unknown as SettingsData | null;
    const maxFollowUps = settings?.outreachSettings?.maxFollowUps || 2;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find emails that need follow-up reminders
    const emailsToFollowUp = await OutreachEmail.find({
      status: 'sent',
      followUpDate: { $lte: today },
      followUpCount: { $lt: maxFollowUps },
    }).lean();

    interface EmailDoc {
      _id: { toString(): string };
    }

    let createdCount = 0;

    for (const email of emailsToFollowUp) {
      const emailDoc = email as unknown as EmailDoc;
      const emailId = emailDoc._id.toString();

      // Check if we already created a notification recently (within 24 hours)
      const existingNotification = await Notification.findOne({
        'metadata.kind': 'outreach_follow_up_due',
        'metadata.outreachEmailId': emailId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }).lean();

      if (!existingNotification) {
        await Notification.create({
          type: 'system',
          title: 'Follow-up Reminder',
          message: `Time to follow up on your outreach.`,
          priority: 'medium',
          metadata: {
            kind: 'outreach_follow_up_due',
            outreachEmailId: emailId,
          },
          actionUrl: '/dashboard/outreach/follow-ups',
          isRead: false,
          userId: 'admin',
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processed: emailsToFollowUp.length,
        notificationsCreated: createdCount,
      },
    });
  } catch (error) {
    console.error('Follow-up cron error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process follow-ups' },
      { status: 500 }
    );
  }
}
