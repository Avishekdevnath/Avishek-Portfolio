import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import mongoose from 'mongoose';

// GET /api/projects - Get all projects with filters and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const sort = searchParams.get('sort') || 'order';

    // Build query
    const query: any = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { 'technologies.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add status filter
    if (status) {
      query.status = status;
    } else {
      // If no status filter, only show published projects for non-admin routes
      const isAdminRoute = request.url.includes('/dashboard') || request.headers.get('x-is-admin') === 'true';
      if (!isAdminRoute) {
        query.status = 'published';
      }
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get sort configuration
    const sortConfig: any = {};
    switch (sort) {
      case 'date':
        sortConfig.completionDate = -1;
        break;
      case 'title':
        sortConfig.title = 1;
        break;
      default:
        sortConfig.order = 1;
        sortConfig.createdAt = -1;
    }

    // Execute query with pagination
    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Project.countDocuments(query)
    ]);

    // Get overview stats
    const overview = {
      total: await Project.countDocuments(),
      published: await Project.countDocuments({ status: 'published' }),
      draft: await Project.countDocuments({ status: 'draft' }),
      featured: await Project.countDocuments({ featured: true })
    };

    return NextResponse.json({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        overview
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch projects'
    }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    const requiredFields = {
      title: 'Title',
      description: 'Description',
      shortDescription: 'Short description',
      category: 'Category',
      technologies: 'Technologies',
      repositories: 'Repositories',
      image: 'Project image',
      imagePublicId: 'Image ID',
      completionDate: 'Completion date'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, label]) => {
        if (key === 'technologies') return !body[key]?.length;
        if (key === 'repositories') return !body[key]?.length;
        return !body[key];
      })
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Create project
    const project = await Project.create({
      ...body,
      // Ensure proper date format
      completionDate: new Date(body.completionDate),
      // Set default values
      status: body.status || 'draft',
      featured: body.featured || false,
      order: body.order || 0
    });

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);

    // Handle validation errors
    if (error instanceof Error && 'errors' in error) {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create project'
    }, { status: 500 });
  }
}

// PATCH /api/projects/bulk - Update multiple projects (e.g., for reordering)
export async function PATCH(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { projects } = body;

    if (!Array.isArray(projects)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request format. Expected an array of projects.'
      }, { status: 400 });
    }

    // Update each project
    const updatePromises = projects.map(async (project) => {
      const { id, ...updateData } = project;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid project ID: ${id}`);
      }

      const updatedProject = await Project.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updatedProject) {
        throw new Error(`Project not found: ${id}`);
      }

      return updatedProject;
    });

    const updatedProjects = await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      data: updatedProjects,
      message: 'Projects updated successfully'
    });
  } catch (error) {
    console.error('Error updating projects:', error);

    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update projects'
    }, { status: 500 });
  }
} 