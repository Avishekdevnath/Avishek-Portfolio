import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WorkExperience } from '@/models/Experience';
import { handleApiError, sendSuccess, sendError } from '@/lib/api-utils';

// GET /api/experience/work/[id] - Get a specific work experience
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const workExperience = await WorkExperience.findById(params.id);
    
    if (!workExperience) {
      return sendError('Work experience not found', 404);
    }

    return sendSuccess(workExperience);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/experience/work/[id] - Update a work experience
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Convert string dates to Date objects
    if (body.startDate) {
      body.startDate = new Date(body.startDate);
    }
    if (body.endDate) {
      body.endDate = new Date(body.endDate);
    }

    // Update work experience
    const workExperience = await WorkExperience.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!workExperience) {
      return sendError('Work experience not found', 404);
    }

    return sendSuccess(workExperience, 'Work experience updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/experience/work/[id] - Delete a work experience
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const workExperience = await WorkExperience.findByIdAndDelete(params.id);
    
    if (!workExperience) {
      return sendError('Work experience not found', 404);
    }

    return sendSuccess(null, 'Work experience deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
} 