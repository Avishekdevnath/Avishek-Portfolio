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
    const { starred } = body;

    if (typeof starred !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'starred field is required' },
        { status: 400 }
      );
    }

    const company = await OutreachCompany.findByIdAndUpdate(
      id,
      { starred },
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
    console.error('Star toggle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle star' },
      { status: 500 }
    );
  }
}
