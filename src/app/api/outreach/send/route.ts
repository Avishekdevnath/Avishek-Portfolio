import { NextRequest, NextResponse } from 'next/server';
import { sendOutreachEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { to, toName, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendOutreachEmail({
      to,
      toName: toName || 'there',
      subject,
      body,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending outreach email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
