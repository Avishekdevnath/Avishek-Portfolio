import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { WorkExperience } from '@/models/Experience';
import { IWorkExperience } from '@/types/experience';

// GET /api/experience/work/[id] - Get a specific work experience
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    await connectDB();
    
    const workExperience = await WorkExperience.findById(params.id);
    
    if (!workExperience) {
      return NextResponse.json({
        success: false,
        error: 'Work experience not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: workExperience
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch work experience'
    });
  }
}

// PUT /api/experience/work/[id] - Update a work experience
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'organization', 'location', 'startDate', 'description', 'jobTitle', 'company', 'employmentType'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
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

    // Ensure type is 'work'
    body.type = 'work';

    // Update work experience
    const workExperience = await WorkExperience.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!workExperience) {
      return NextResponse.json({
        success: false,
        error: 'Work experience not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: workExperience,
      message: 'Work experience updated successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update work experience'
    });
  }
}

// DELETE /api/experience/work/[id] - Delete a work experience
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    await connectDB();
    
    const workExperience = await WorkExperience.findByIdAndDelete(params.id);
    
    if (!workExperience) {
      return NextResponse.json({
        success: false,
        error: 'Work experience not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Work experience deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete work experience'
    });
  }
} 