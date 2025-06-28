import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import connectDB from '@/lib/mongodb';
import Skill from '@/models/Skill';
import { handleApiError, sendSuccess, sendError } from '@/lib/api-utils';

// Helper function to validate MongoDB ObjectId
const validateId = (id: string) => {
  if (!isValidObjectId(id)) {
    return sendError('Invalid skill ID', 400);
  }
};

// GET /api/skills/[id] - Get a single skill
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const skill = await Skill.findById(params.id);
    
    if (!skill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: skill,
    });
  } catch (error) {
    console.error('Error fetching skill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skill' },
      { status: 500 }
    );
  }
}

// PUT /api/skills/[id] - Update a skill
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'proficiency', 'category'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return sendError(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }

    // Validate proficiency level
    if (body.proficiency < 1 || body.proficiency > 5) {
      return sendError('Proficiency must be between 1 and 5', 400);
    }

    // Validate category
    const validCategories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools', 'Other'];
    if (!validCategories.includes(body.category)) {
      return sendError(`Invalid category. Must be one of: ${validCategories.join(', ')}`, 400);
    }

    // Update skill
    const skill = await Skill.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!skill) {
      return sendError('Skill not found', 404);
    }

    return sendSuccess(skill, 'Skill updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/skills/[id] - Partially update a skill
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();

    const skill = await Skill.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!skill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: skill,
    });
  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update skill' },
      { status: 500 }
    );
  }
}

// DELETE /api/skills/[id] - Delete a skill
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const skill = await Skill.findByIdAndDelete(params.id);
    
    if (!skill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Reorder remaining skills in the same category
    await Skill.updateMany(
      { 
        category: skill.category,
        order: { $gt: skill.order }
      },
      { $inc: { order: -1 } }
    );

    return NextResponse.json({
      success: true,
      data: skill,
    });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete skill' },
      { status: 500 }
    );
  }
} 