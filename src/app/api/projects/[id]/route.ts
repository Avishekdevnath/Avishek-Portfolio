import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { deleteImage } from '@/lib/cloudinary';
import mongoose from 'mongoose';

interface RouteParams {
  params: {
    id: string;
  };
}

// Helper function to validate MongoDB ObjectId
const validateId = (id: string) => {
  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid project ID' },
      { status: 400 }
    );
  }
  return null;
};

// GET /api/projects/[id] - Get a single project
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate ID format first
    const idValidation = validateId(params.id);
    if (idValidation) return idValidation;

    await connectDB();

    const project = await Project.findById(params.id).lean({ virtuals: true });
    if (!project) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch project'
    }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      imagePublicId: 'Image ID'
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

    // Get existing project
    const existingProject = await Project.findById(params.id);
    if (!existingProject) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 });
    }

    // If image has changed, delete old image
    if (body.imagePublicId && body.imagePublicId !== existingProject.imagePublicId) {
      try {
        await deleteImage(existingProject.imagePublicId);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Ensure demo URLs have type field
    if (body.demoUrls) {
      body.demoUrls = body.demoUrls.map((demo: any) => ({
        ...demo,
        type: demo.type || 'live' // Set default type if not provided
      }));
    }

    // Update project
    const updateData = {
      ...body,
      // Ensure proper date format if completionDate is provided
      ...(body.completionDate && { completionDate: new Date(body.completionDate) })
    };

    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).lean({ virtuals: true });

    return NextResponse.json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);

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
      error: error instanceof Error ? error.message : 'Failed to update project'
    }, { status: 500 });
  }
}

// PATCH /api/projects/[id] - Partially update a project
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const body = await request.json();

    // Get existing project
    const existingProject = await Project.findById(params.id);
    if (!existingProject) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 });
    }

    // Ensure demo URLs have type field if provided
    if (body.demoUrls) {
      body.demoUrls = body.demoUrls.map((demo: any) => ({
        ...demo,
        type: demo.type || 'live' // Set default type if not provided
      }));
    }

    // Update only provided fields
    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean({ virtuals: true });

    return NextResponse.json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);

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
      error: error instanceof Error ? error.message : 'Failed to update project'
    }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    // Get project to delete
    const project = await Project.findById(params.id);
    if (!project) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 });
    }

    // Delete image from Cloudinary if exists
    if (project.imagePublicId) {
      try {
        await deleteImage(project.imagePublicId);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    // Delete project
    await Project.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete project'
    }, { status: 500 });
  }
} 