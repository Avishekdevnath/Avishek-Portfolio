import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Project from '@/models/Project';
import { BaseQuery, SortConfig, PaginationOptions } from '@/types/api';
import { Project as ProjectType } from '@/types/dashboard';

// GET /api/projects - Get all projects with filters and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'order';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build query
    const query: BaseQuery<ProjectType> = {};
    if (status) query.status = status as 'draft' | 'published';
    if (featured) query.featured = featured === 'true';
    if (category) query.category = category;

    // Build sort config
    const sortConfig: SortConfig = {
      [sortBy]: sortOrder as 'asc' | 'desc'
    };

    // Add secondary sort by order
    if (sortBy !== 'order') {
      sortConfig.order = 'asc';
    }

    const paginationOptions: PaginationOptions = {
      page,
      limit
    };

    // Get total count for pagination
    const total = await Project.countDocuments(query);
    const pages = Math.ceil(total / limit);

    // Get paginated projects
    const projects = await Project.find(query)
      .sort(sortConfig)
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          page,
          limit,
          pages
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch projects'
    });
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const project = new Project(body);
    await project.validate();
    await project.save();

    return NextResponse.json({
      success: true,
      data: project
    });
  } catch (error) {
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
      error: error instanceof Error ? error.message : 'Failed to create project'
    });
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