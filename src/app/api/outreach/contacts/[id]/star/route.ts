import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import OutreachContact from '@/models/OutreachContact';
import { ensureDashboardAuth } from '../../../_auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const { starred } = body;

    if (typeof starred !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'starred field is required' },
        { status: 400 }
      );
    }

    const contact = await OutreachContact.findByIdAndUpdate(
      id,
      { starred },
      { new: true }
    ).lean();

    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Star toggle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle star' },
      { status: 500 }
    );
  }
}
