import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { WorkExperience, Education } from '@/models/Experience';

export const dynamic = 'force-dynamic';

// GET /api/experience - Get all experiences (work + education)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'published';
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Build query
    const query: any = { status };
    if (featured !== null) {
      query.featured = featured === 'true';
    }

    // Fetch both work experience and education
    const [workExperiences, education] = await Promise.all([
      WorkExperience.find(query)
        .sort({ featured: -1, order: 1, startDate: -1 })
        .limit(limit),
      Education.find(query)
        .sort({ featured: -1, order: 1, startDate: -1 })
        .limit(limit),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        work: workExperiences,
        education: education,
        summary: {
          totalWork: workExperiences.length,
          totalEducation: education.length,
          featuredWork: workExperiences.filter(exp => exp.featured).length,
          featuredEducation: education.filter(edu => edu.featured).length,
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch experiences'
    });
  }
} 