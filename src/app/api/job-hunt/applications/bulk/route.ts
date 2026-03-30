import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import { APPLICATION_STATUSES } from '@/lib/job-hunt-utils';
import { ensureDashboardAuth } from '../../_auth';

type BulkAction = 'delete' | 'update-status';

interface BulkBody {
  ids: string[];
  action: BulkAction;
  status?: string;
}

export async function POST(request: NextRequest) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    const body = (await request.json()) as BulkBody;

    const ids = Array.isArray(body.ids) ? body.ids.filter((id) => mongoose.Types.ObjectId.isValid(id)) : [];
    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid ids provided' }, { status: 400 });
    }

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

    if (body.action === 'delete') {
      const result = await JobApplication.deleteMany({ _id: { $in: objectIds } });
      return NextResponse.json({
        success: true,
        data: {
          action: body.action,
          affected: result.deletedCount || 0,
        },
      });
    }

    if (body.action === 'update-status') {
      if (!body.status || !APPLICATION_STATUSES.includes(body.status as (typeof APPLICATION_STATUSES)[number])) {
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
      }

      const result = await JobApplication.updateMany(
        { _id: { $in: objectIds } },
        { status: body.status, updatedAt: new Date() }
      );

      return NextResponse.json({
        success: true,
        data: {
          action: body.action,
          status: body.status,
          affected: result.modifiedCount || 0,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported bulk action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Bulk operation failed' },
      { status: 500 }
    );
  }
}
