import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import JobLead from '@/models/JobLead';
import JobApplication from '@/models/JobApplication';
import { LEAD_STATUSES } from '@/lib/job-hunt-utils';
import { ensureDashboardAuth } from '../../_auth';

type BulkAction = 'delete' | 'update-status';

interface BulkBody {
  ids: string[];
  action: BulkAction;
  status?: string;
}

export async function POST(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    const body = (await request.json()) as BulkBody;

    const ids = Array.isArray(body.ids) ? body.ids.filter((id) => mongoose.Types.ObjectId.isValid(id)) : [];
    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid ids provided' }, { status: 400 });
    }

    if (body.action === 'delete') {
      const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
      const deletedLeads = await JobLead.find({ _id: { $in: objectIds } }, { _id: 1 }).lean();

      const deleteResult = await JobLead.deleteMany({ _id: { $in: objectIds } });
      await JobApplication.deleteMany({ sourceLeadId: { $in: deletedLeads.map((lead) => lead._id) } });

      return NextResponse.json({
        success: true,
        data: {
          action: body.action,
          affected: deleteResult.deletedCount || 0,
        },
      });
    }

    if (body.action === 'update-status') {
      if (!body.status || !LEAD_STATUSES.includes(body.status as (typeof LEAD_STATUSES)[number])) {
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
      }

      const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
      const result = await JobLead.updateMany(
        { _id: { $in: objectIds } },
        { status: body.status, updatedAt: new Date() }
      );

      if (body.status === 'Interviewing') {
        await JobApplication.updateMany(
          { sourceLeadId: { $in: objectIds } },
          { status: 'Interview', updatedAt: new Date() }
        );
      }

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
