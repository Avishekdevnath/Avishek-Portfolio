import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Education } from '@/models/Experience';
import { handleApiError, sendSuccess, sendError } from '@/lib/api-utils';

// GET /api/experience/education/[id] - Get a specific education entry
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const education = await Education.findById(params.id);
    
    if (!education) {
      return sendError('Education entry not found', 404);
    }

    return sendSuccess(education);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/experience/education/[id] - Update an education entry
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

    // Update education entry
    const education = await Education.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!education) {
      return sendError('Education entry not found', 404);
    }

    return sendSuccess(education, 'Education entry updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/experience/education/[id] - Delete an education entry
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const education = await Education.findByIdAndDelete(params.id);
    
    if (!education) {
      return sendError('Education entry not found', 404);
    }

    return sendSuccess(null, 'Education entry deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
} 