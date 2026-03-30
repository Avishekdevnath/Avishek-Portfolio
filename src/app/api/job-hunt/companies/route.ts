import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { JobHuntCompany } from '@/models/JobHuntCompany';
import { JobHuntHRContact } from '@/models/JobHuntHRContact';
import { ensureDashboardAuth } from '../_auth';

export async function GET(request: NextRequest) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;

  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const tier = searchParams.get('tier');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let filter: any = includeInactive ? {} : { isActive: true };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (tier) {
      filter.tier = tier;
    }

    const skip = (page - 1) * limit;

    const companies = await JobHuntCompany.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await JobHuntCompany.countDocuments(filter);

    // Get HR contact counts for each company
    const hrCounts = await JobHuntHRContact.aggregate([
      {
        $match: {
          companyId: { $in: companies.map((c: any) => c._id) },
        },
      },
      {
        $group: {
          _id: '$companyId',
          count: { $sum: 1 },
        },
      },
    ]);

    const countByCompany = new Map<string, number>();
    hrCounts.forEach((row: any) => {
      countByCompany.set(String(row._id), row.count);
    });

    return NextResponse.json({
      success: true,
      data: companies.map((c: any) => ({
        _id: String(c._id),
        name: c.name,
        website: c.website,
        careerPageUrl: c.careerPageUrl,
        linkedinUrl: c.linkedinUrl,
        industry: c.industry,
        size: c.size,
        locationHQ: c.locationHQ,
        tier: c.tier,
        notes: c.notes,
        isActive: c.isActive,
        hrContactCount: countByCompany.get(String(c._id)) || 0,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch companies',
      },
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
    const { name, website, careerPageUrl, linkedinUrl, industry, size, locationHQ, tier, notes } =
      body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Company name is required' },
        { status: 400 }
      );
    }

    const existingCompany = await JobHuntCompany.findOne({
      name: name.toLowerCase().trim(),
    });

    if (existingCompany) {
      return NextResponse.json(
        { success: false, error: 'Company with this name already exists' },
        { status: 409 }
      );
    }

    const company = new JobHuntCompany({
      name: name.toLowerCase().trim(),
      website: website || undefined,
      careerPageUrl: careerPageUrl || undefined,
      linkedinUrl: linkedinUrl || undefined,
      industry: industry || undefined,
      size: size || undefined,
      locationHQ: locationHQ || undefined,
      tier: tier || undefined,
      notes: notes || undefined,
      isActive: true,
    });

    const savedCompany = await company.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: String(savedCompany._id),
          name: savedCompany.name,
          website: savedCompany.website,
          careerPageUrl: savedCompany.careerPageUrl,
          linkedinUrl: savedCompany.linkedinUrl,
          industry: savedCompany.industry,
          size: savedCompany.size,
          locationHQ: savedCompany.locationHQ,
          tier: savedCompany.tier,
          notes: savedCompany.notes,
          isActive: savedCompany.isActive,
          hrContactCount: 0,
          createdAt: savedCompany.createdAt,
          updatedAt: savedCompany.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Company with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create company',
      },
      { status: 500 }
    );
  }
}
