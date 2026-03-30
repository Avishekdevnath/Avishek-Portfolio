import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { JobHuntCompany } from '@/models/JobHuntCompany';
import { JobHuntHRContact } from '@/models/JobHuntHRContact';
import { ensureDashboardAuth } from '../../_auth';
import { Types } from 'mongoose';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;
  const { id } = await params;

  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid company ID' }, { status: 400 });
    }

    const company = (await JobHuntCompany.findById(id).lean()) as any;

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get HR contacts count
    const hrContactCount = await JobHuntHRContact.countDocuments({
      companyId: company._id,
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: String(company._id),
        name: company.name,
        website: company.website,
        careerPageUrl: company.careerPageUrl,
        linkedinUrl: company.linkedinUrl,
        industry: company.industry,
        size: company.size,
        locationHQ: company.locationHQ,
        tier: company.tier,
        notes: company.notes,
        isActive: company.isActive,
        hrContactCount,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch company',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;
  const { id } = await params;

  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid company ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, website, careerPageUrl, linkedinUrl, industry, size, locationHQ, tier, notes, isActive } = body;

    const company = await JobHuntCompany.findById(id);

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if new name already exists (if name is being changed)
    if (name && name.toLowerCase().trim() !== company.name) {
      const existing = await JobHuntCompany.findOne({
        name: name.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Company with this name already exists' },
          { status: 409 }
        );
      }
      company.name = name.toLowerCase().trim();
    }

    if (website !== undefined) company.website = website || undefined;
    if (careerPageUrl !== undefined) company.careerPageUrl = careerPageUrl || undefined;
    if (linkedinUrl !== undefined) company.linkedinUrl = linkedinUrl || undefined;
    if (industry !== undefined) company.industry = industry || undefined;
    if (size !== undefined) company.size = size || undefined;
    if (locationHQ !== undefined) company.locationHQ = locationHQ || undefined;
    if (tier !== undefined) company.tier = tier || undefined;
    if (notes !== undefined) company.notes = notes || undefined;
    if (isActive !== undefined) company.isActive = isActive;

    const updatedCompany = await company.save();

    // Get HR contacts count
    const hrContactCount = await JobHuntHRContact.countDocuments({
      companyId: updatedCompany._id,
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: String(updatedCompany._id),
        name: updatedCompany.name,
        website: updatedCompany.website,
        careerPageUrl: updatedCompany.careerPageUrl,
        linkedinUrl: updatedCompany.linkedinUrl,
        industry: updatedCompany.industry,
        size: updatedCompany.size,
        locationHQ: updatedCompany.locationHQ,
        tier: updatedCompany.tier,
        notes: updatedCompany.notes,
        isActive: updatedCompany.isActive,
        hrContactCount,
        createdAt: updatedCompany.createdAt,
        updatedAt: updatedCompany.updatedAt,
      },
    });
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
        error: error instanceof Error ? error.message : 'Failed to update company',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await ensureDashboardAuth();
  if (authError) return authError;
  const { id } = await params;

  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid company ID' }, { status: 400 });
    }

    // Check if company has linked HR contacts
    const hrContactCount = await JobHuntHRContact.countDocuments({
      companyId: id,
    });

    if (hrContactCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete company with ${hrContactCount} linked HR contact(s)`,
        },
        { status: 409 }
      );
    }

    const company = await JobHuntCompany.findByIdAndDelete(id);

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete company',
      },
      { status: 500 }
    );
  }
}
