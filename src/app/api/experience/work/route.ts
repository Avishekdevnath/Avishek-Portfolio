import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { WorkExperience } from '@/models/Experience';
import { IWorkExperience, ExperienceListApiResponse } from '@/types/experience';
import { FlattenMaps } from 'mongoose';

export const dynamic = 'force-dynamic';

// GET /api/experience/work - Get all work experiences
export async function GET(request: NextRequest): Promise<Response> {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all'; // Default to 'all' to show both draft and published
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '50'); // Increased default limit
    const page = parseInt(searchParams.get('page') || '1');
    
    // Build query
    const query: any = { type: 'work' }; // Always filter by type
    if (status !== 'all') {
      query.status = status;
    }
    if (featured !== null) {
      query.featured = featured === 'true';
    }

    // Execute query with pagination and sorting
    const skip = (page - 1) * limit;
    
    const [workExperiences, total] = await Promise.all([
      WorkExperience.find(query)
        .sort({ featured: -1, order: 1, startDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WorkExperience.countDocuments(query),
    ]);

    // Convert MongoDB documents to plain objects and ensure proper field mapping
    const processedExperiences: IWorkExperience[] = workExperiences.map((exp: FlattenMaps<any>): IWorkExperience => ({
      _id: exp._id.toString(),
      type: 'work' as const,
      // Ensure all required fields from IWorkExperience interface
      title: exp.title || exp.jobTitle || exp.position || 'Work Experience',
      organization: exp.organization || exp.company || '',
      location: exp.location || '',
      startDate: exp.startDate ? new Date(exp.startDate).toISOString() : new Date().toISOString(),
      endDate: exp.endDate ? new Date(exp.endDate).toISOString() : null,
      isCurrent: exp.isCurrent || false,
      description: exp.description || '',
      order: exp.order || 0,
      featured: exp.featured || false,
      status: exp.status || 'published',
      // Work-specific fields
      jobTitle: exp.jobTitle || exp.position || '',
      level: exp.level || undefined,
      position: exp.position || exp.jobTitle || '',
      company: exp.company || exp.organization || '',
      employmentType: exp.employmentType || 'full-time',
      technologies: exp.technologies || [],
      achievements: exp.achievements || [],
      responsibilities: exp.responsibilities || [],
      website: exp.website || undefined,
      companySize: exp.companySize || undefined,
    }));

    const response: ExperienceListApiResponse = {
      success: true,
      data: {
        experiences: processedExperiences,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch work experiences'
    });
  }
}

// POST /api/experience/work - Create a new work experience
export async function POST(request: NextRequest): Promise<Response> {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Handle backward compatibility - convert old fields to new structure
    if (body.position && !body.jobTitle) {
      body.jobTitle = body.position;
    }
    
    // Validate required fields (more flexible validation)
    const requiredFields = ['title', 'company', 'organization', 'location', 'startDate', 'description', 'employmentType'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    // If jobTitle is missing but we have title, use title as jobTitle
    if (!body.jobTitle && body.title) {
      body.jobTitle = body.title;
    }
    
    // Ensure we have at least jobTitle or position
    if (!body.jobTitle && !body.position) {
      missingFields.push('jobTitle or position');
    }
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Convert string dates to Date objects
    if (body.startDate) {
      body.startDate = new Date(body.startDate);
    }
    if (body.endDate) {
      body.endDate = new Date(body.endDate);
    }

    // Set type to work
    body.type = 'work';

    // Ensure organization matches company
    if (!body.organization && body.company) {
      body.organization = body.company;
    }

    // Generate title if not provided (level + jobTitle or just jobTitle)
    if (!body.title) {
      body.title = body.level && body.jobTitle 
        ? `${body.level} ${body.jobTitle}` 
        : body.jobTitle || body.position;
    }

    // If no order is provided, get the next order number
    if (!body.order) {
      const lastExperience = await WorkExperience.findOne().sort({ order: -1 });
      body.order = lastExperience ? lastExperience.order + 1 : 1;
    }

    // Create new work experience
    const workExperience = await WorkExperience.create(body);
    
    return NextResponse.json({
      success: true,
      data: workExperience,
      message: 'Work experience created successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create work experience'
    });
  }
} 