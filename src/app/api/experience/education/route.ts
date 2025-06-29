import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Education } from '@/models/Experience';
import { BaseQuery, SortConfig, PaginationOptions } from '@/types/api';
import { Experience as ExperienceType } from '@/types/experience';
import { handleApiError, sendSuccess, sendError } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

// GET /api/experience/education - Get all education entries
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'startDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: BaseQuery<ExperienceType> = {
      type: 'education'
    };
    if (status) query.status = status as 'draft' | 'published';

    // Build sort config
    const sortConfig: SortConfig = {
      [sortBy]: sortOrder as 'asc' | 'desc'
    };

    // Add secondary sort by startDate
    if (sortBy !== 'startDate') {
      sortConfig.startDate = 'desc';
    }

    const paginationOptions: PaginationOptions = {
      page,
      limit
    };

    // Get total count for pagination
    const total = await Education.countDocuments(query);
    const pages = Math.ceil(total / limit);

    // Get paginated education experiences
    const education = await Education.find(query)
      .sort(sortConfig)
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: {
        education,
        pagination: {
          total,
          page,
          limit,
          pages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching education:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch education'
    });
  }
}

// POST /api/experience/education - Create a new education entry
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    body.type = 'education'; // Ensure type is set to education

    const education = new Education(body);
    await education.validate();
    await education.save();

    return NextResponse.json({
      success: true,
      data: education
    });
  } catch (error) {
    console.error('Error creating education:', error);
    if (error instanceof Error && 'errors' in error) {
      const validationErrors = Object.values(error.errors as Record<string, { message: string }>)
        .map(err => err.message);
      return NextResponse.json({
        success: false,
        error: `Validation failed: ${validationErrors.join(', ')}`
      });
    }
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create education'
    });
  }
} 