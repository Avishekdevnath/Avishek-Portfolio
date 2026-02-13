import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import OutreachCompany from '@/models/OutreachCompany';
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
    const { archived } = body;

    if (typeof archived !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'archived field is required' },
        { status: 400 }
      );
    }

    const company = await OutreachCompany.findByIdAndUpdate(
      id,
      { archived },
      { new: true }
    ).lean();

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error('Archive toggle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle archive' },
      { status: 500 }
    );
  }
}
