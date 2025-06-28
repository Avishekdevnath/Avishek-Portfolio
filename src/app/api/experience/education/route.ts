import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Education } from '@/models/Experience';
import { handleApiError, sendSuccess, sendError } from '@/lib/api-utils';

// GET /api/experience/education - Get all education entries
export async function GET(request: NextRequest) {
  try {
    console.log('🎓 Education API: Starting request...');
    await connectToDatabase();
    console.log('📡 Education API: Database connected');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    console.log('🔍 Education API: Query params:', { status, featured, limit, page });
    
    // Build query
    const query: any = {};
    
    // Only filter by status if it's not 'all'
    if (status !== 'all') {
      query.status = status;
    }
    
    if (featured !== null) {
      query.featured = featured === 'true';
    }

    console.log('📊 Education API: MongoDB query:', query);

    // Execute query with pagination and sorting
    const skip = (page - 1) * limit;
    
    // First, let's check total count without any filters
    const totalEducationCount = await Education.countDocuments({});
    console.log('📈 Education API: Total education records in DB:', totalEducationCount);
    
    const [educationEntries, total] = await Promise.all([
      Education.find(query)
        .sort({ featured: -1, order: 1, startDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Education.countDocuments(query),
    ]);

    console.log('✅ Education API: Found entries:', educationEntries.length);
    console.log('📚 Education API: Sample entry:', educationEntries[0] || 'No entries');

    return sendSuccess({
      education: educationEntries,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('💥 Education API Error:', error);
    return handleApiError(error);
  }
}

// POST /api/experience/education - Create a new education entry
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'degree', 'institution', 'organization', 'location', 'startDate', 'description', 'fieldOfStudy'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
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

    // Set type to education
    body.type = 'education';

    // If no order is provided, get the next order number
    if (!body.order) {
      const lastEducation = await Education.findOne().sort({ order: -1 });
      body.order = lastEducation ? lastEducation.order + 1 : 1;
    }

    // Create new education entry
    const education = await Education.create(body);
    
    return sendSuccess(education, 'Education entry created successfully');
  } catch (error) {
    return handleApiError(error);
  }
} 