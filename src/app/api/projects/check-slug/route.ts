import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Project from '@/models/Project';

// GET /api/projects/check-slug?slug=value&exclude=projectId
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const exclude = searchParams.get('exclude'); // Current project ID to exclude

    if (!slug) {
      return NextResponse.json({
        success: false,
        error: 'Slug is required'
      }, { status: 400 });
    }

    // Check if slug exists (excluding current project if provided)
    const query: any = { slug };
    if (exclude) {
      query._id = { $ne: exclude };
    }

    const exists = !!(await Project.findOne(query));

    return NextResponse.json({
      success: true,
      data: {
        slug,
        exists
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check slug'
    }, { status: 500 });
  }
}
