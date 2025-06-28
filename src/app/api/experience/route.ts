import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WorkExperience, Education } from '@/models/Experience';
import { handleApiError, sendSuccess } from '@/lib/api-utils';

// GET /api/experience - Get all experiences (work + education)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
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

    return sendSuccess({
      work: workExperiences,
      education: education,
      summary: {
        totalWork: workExperiences.length,
        totalEducation: education.length,
        featuredWork: workExperiences.filter(exp => exp.featured).length,
        featuredEducation: education.filter(edu => edu.featured).length,
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
} 