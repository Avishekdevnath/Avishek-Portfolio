import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { parseIncomingEmailReply } from '@/lib/email';

export async function POST(request: Request) {
  try {
    await connectDB();

    // Parse the email data from the request
    const emailData = await request.json();
    
    // Parse the reply data
    const replyData = parseIncomingEmailReply(emailData);

    // Find the original message and add the reply
    const message = await Message.findById(replyData.messageId);
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Original message not found' },
        { status: 404 }
      );
    }

    // Add the reply to the message
    message.replies.push({
      message: replyData.message,
      sentBy: 'user',
      sentAt: replyData.date,
    });

    // Save the updated message
    await message.save();

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error handling email reply:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process email reply' },
      { status: 500 }
    );
  }
} 