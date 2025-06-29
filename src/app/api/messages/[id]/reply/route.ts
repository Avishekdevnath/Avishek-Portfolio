import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { IReply } from '@/types/message';
import { sendReply } from '@/lib/email';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const { replyMessage } = await request.json();

    // Find the message
    const message = await Message.findById(id);
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    // Add the reply to the message
    const reply: IReply = {
      message: replyMessage,
      sentBy: 'admin',
      sentAt: new Date(),
    };
    
    message.replies.push(reply);
    await message.save();

    // Send email reply
    const emailResult = await sendReply({
      to: message.email,
      name: message.name,
      subject: message.subject,
      originalMessage: message.message,
      replyMessage: replyMessage,
    });

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
    }

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send reply' },
      { status: 500 }
    );
  }
} 