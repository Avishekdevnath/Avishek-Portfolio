import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WorkExperience } from '@/models/Experience';
import { handleApiError, sendSuccess, sendError } from '@/lib/api-utils';

// GET /api/experience/work - Get all work experiences
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Build query - if status is 'all', get both published and draft
    const query: any = {};
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
    const processedExperiences = workExperiences.map(exp => ({
      ...exp,
      _id: exp._id.toString(),
      type: 'work',
      // Ensure backward compatibility
      jobTitle: exp.jobTitle || exp.position,
      position: exp.position || exp.jobTitle,
      // Ensure all required fields have fallbacks
      title: exp.title || exp.jobTitle || exp.position || 'Work Experience',
      organization: exp.organization || exp.company,
      company: exp.company || exp.organization,
    }));

    return sendSuccess({
      workExperiences: processedExperiences,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/experience/work - Create a new work experience
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
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
      return sendError(`Missing required fields: ${missingFields.join(', ')}`, 400);
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
    
    return sendSuccess(workExperience, 'Work experience created successfully');
  } catch (error) {
    return handleApiError(error);
  }
} 