import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Education } from '@/models/Experience';

// GET /api/experience/education/[id] - Get a specific education entry
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const education = await Education.findById(id);
    
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
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch education entry'
    });
  }
}

// PUT /api/experience/education/[id] - Update an education entry
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
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
      id,
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
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update education entry'
    });
  }
}

// PATCH /api/experience/education/[id] - Partially update an education entry
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    if (body.startDate) body.startDate = new Date(body.startDate);
    if (body.endDate) body.endDate = new Date(body.endDate);

    const education = await Education.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!education) {
      return NextResponse.json({ success: false, error: 'Education entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: education, message: 'Education entry updated successfully' });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update education entry'
    });
  }
}

// DELETE /api/experience/education/[id] - Delete an education entry
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const education = await Education.findByIdAndDelete(id);
    
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
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete education entry'
    });
  }
} 