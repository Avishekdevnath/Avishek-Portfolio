import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Education } from '@/models/Experience';

// GET /api/experience/education/[id] - Get a specific education entry
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const education = await Education.findById(params.id);
    
    if (!education) {
      return NextResponse.json({
        success: false,
        error: 'Education entry not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: education
    });
  } catch (error) {
    console.error('Error fetching education entry:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch education entry'
    });
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
      return NextResponse.json({
        success: false,
        error: 'Education entry not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: education,
      message: 'Education entry updated successfully'
    });
  } catch (error) {
    console.error('Error updating education entry:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update education entry'
    });
  }
}

// DELETE /api/experience/education/[id] - Delete an education entry
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const education = await Education.findByIdAndDelete(params.id);
    
    if (!education) {
      return NextResponse.json({
        success: false,
        error: 'Education entry not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Education entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting education entry:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete education entry'
    });
  }
} 