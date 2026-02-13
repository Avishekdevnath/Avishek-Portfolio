import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import OutreachCompany from '@/models/OutreachCompany';
import { ensureDashboardAuth } from '../_auth';

export async function GET(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const search = request.nextUrl.searchParams.get('search')?.trim();
    const showArchived = request.nextUrl.searchParams.get('showArchived') === 'true';
    
    // Build the query
    const query: Record<string, any> = {};
    
    if (!showArchived) {
      if (search) {
        // Both search and archive filter
        query.$and = [
          { $or: [
            { archived: false },
            { archived: { $exists: false } },
          ]},
          { $or: [
            { name: { $regex: search, $options: 'i' } },
            { tags: { $elemMatch: { $regex: search, $options: 'i' } } },
          ]},
        ];
      } else {
        // Only archive filter
        query.$or = [
          { archived: false },
          { archived: { $exists: false } },
        ];
      }
    } else if (search) {
      // Only search filter
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    const companies = await OutreachCompany.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    const data = companies.map((company: any) => ({
      _id: company._id.toString(),
      name: company.name,
      country: company.country,
      website: company.website,
      careerPageUrl: company.careerPageUrl,
      tags: company.tags || [],
      notes: company.notes,
      starred: company.starred || false,
      archived: company.archived || false,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();
    const body = await request.json();

    const tags =
      typeof body.tags === 'string'
        ? body.tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : Array.isArray(body.tags)
          ? body.tags
          : [];

    const company = new OutreachCompany({
      name: body.name,
      country: body.country,
      website: body.website || undefined,
      careerPageUrl: body.careerPageUrl || undefined,
      tags,
      notes: body.notes || undefined,
    });

    await company.validate();
    await company.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: company._id.toString(),
        name: company.name,
        country: company.country,
        website: company.website,
        careerPageUrl: company.careerPageUrl,
        tags: company.tags || [],
        notes: company.notes,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Company already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create company' },
      { status: 400 }
    );
  }
}

