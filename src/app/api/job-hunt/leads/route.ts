import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import JobLead from '@/models/JobLead';
import { ensureDashboardAuth } from '../_auth';

interface LeadQuery {
  status?: string;
  source?: string;
  $or?: Array<Record<string, unknown>>;
  dateFound?: Record<string, Date>;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitKeywords(value: string): string[] {
  return value
    .split(/[\s,]+/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

function calculateFitScore(input: {
  title?: string;
  company?: string;
  location?: string;
  jobType?: string;
  source?: string;
  dateFound?: Date | string;
  roleKeywords: string[];
  techKeywords: string[];
}) {
  const title = (input.title || '').toLowerCase();
  const company = (input.company || '').toLowerCase();
  const location = (input.location || '').toLowerCase();
  const jobType = (input.jobType || '').toLowerCase();
  const source = (input.source || '').toLowerCase();
  const haystack = `${title} ${company} ${location}`;

  let score = 25;

  const roleHits = input.roleKeywords.filter((kw) => haystack.includes(kw)).length;
  const techHits = input.techKeywords.filter((kw) => haystack.includes(kw)).length;

  score += Math.min(35, roleHits * 12);
  score += Math.min(30, techHits * 10);

  if (jobType.includes('remote') || location.includes('remote')) score += 10;
  if (source.includes('remotive') || source.includes('himalayas')) score += 5;

  const foundDate = input.dateFound ? new Date(input.dateFound) : null;
  if (foundDate && !Number.isNaN(foundDate.getTime())) {
    const now = new Date();
    const ageDays = Math.max(0, Math.floor((now.getTime() - foundDate.getTime()) / (1000 * 60 * 60 * 24)));
    if (ageDays <= 3) score += 15;
    else if (ageDays <= 7) score += 10;
    else if (ageDays <= 14) score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

export async function GET(request: NextRequest) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const q = (searchParams.get('q') || '').trim();
    const role = (searchParams.get('role') || '').trim();
    const tech = (searchParams.get('tech') || '').trim();
    const minFit = Math.max(0, Math.min(100, Number(searchParams.get('minFit') || '0')));
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit') || '20')));
    const sortBy = searchParams.get('sortBy') || 'dateFound';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const roleKeywords = splitKeywords(role);
    const techKeywords = splitKeywords(tech);

    const query: LeadQuery = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (q) {
      const regex = new RegExp(escapeRegex(q), 'i');
      query.$or = [
        { title: regex },
        { company: regex },
        { location: regex },
      ];
    }

    if (dateFrom || dateTo) {
      query.dateFound = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        query.dateFound.$gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.dateFound.$lte = toDate;
      }
    }

    const leads = await JobLead.find(query)
      .sort({ [sortBy === 'fitScore' ? 'dateFound' : sortBy]: sortOrder, createdAt: -1 })
      .lean();

    const enriched = leads
      .map((lead) => {
        const fitScore = calculateFitScore({
          title: (lead as any).title,
          company: (lead as any).company,
          location: (lead as any).location,
          jobType: (lead as any).jobType,
          source: (lead as any).source,
          dateFound: (lead as any).dateFound,
          roleKeywords,
          techKeywords,
        });
        return {
          ...lead,
          fitScore,
        };
      })
      .filter((lead) => {
        const title = String((lead as any).title || '').toLowerCase();
        const location = String((lead as any).location || '').toLowerCase();
        const haystack = `${title} ${location}`;

        const rolePass = roleKeywords.length === 0 || roleKeywords.some((kw) => haystack.includes(kw));
        const techPass = techKeywords.length === 0 || techKeywords.some((kw) => haystack.includes(kw));
        const fitPass = Number((lead as any).fitScore || 0) >= minFit;

        return rolePass && techPass && fitPass;
      });

    if (sortBy === 'fitScore') {
      enriched.sort((a, b) => (Number((b as any).fitScore || 0) - Number((a as any).fitScore || 0)) * sortOrder * -1);
    }

    const total = enriched.length;
    const pages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paged = enriched.slice(start, start + limit);

    const items = paged.map((lead) => ({
      ...lead,
      _id: (lead as any)._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          pages,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const body = await request.json();
    const lead = new JobLead({
      title: body.title,
      company: body.company,
      location: body.location || undefined,
      jobType: body.jobType || undefined,
      source: body.source,
      jobUrl: body.jobUrl,
      status: body.status || 'New',
      dateFound: body.dateFound ? new Date(body.dateFound) : new Date(),
      synced: Boolean(body.synced),
    });

    await lead.validate();
    await lead.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          ...lead.toObject(),
          _id: lead._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if ((error as any)?.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Lead already exists for this title/company/source' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create lead' },
      { status: 400 }
    );
  }
}
