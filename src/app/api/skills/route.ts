import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Skill from '@/models/Skill';
import { revalidatePath } from 'next/cache';

// GET /api/skills - Get all skills
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    // Build query
    const query: any = {};
    if (type) query.type = type;
    if (category) query.category = category;

    // Get skills
    const skills = await Skill.find(query)
      .sort({ category: 1, order: 1 })
      .lean();

    // Group skills by category
    const skillsByCategory = skills.reduce((acc: Record<string, any[]>, skill) => {
      const category = skill.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        _id: skill._id.toString(),
        name: skill.name,
        proficiency: skill.proficiency,
        icon: skill.icon,
        iconSet: skill.iconSet,
        description: skill.description,
        featured: skill.featured,
        order: skill.order
      });
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: skillsByCategory
    });
  } catch (error) {
    console.error('Error in GET /api/skills:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch skills'
    }, { status: 500 });
  }
}

// POST /api/skills - Create a new skill
export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      name,
      category,
      proficiency,
      icon,
      iconSet,
      description,
      featured,
      order
    } = body;

    // Validate required fields
    if (!name || !category || proficiency === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Create new skill
    const skill = await Skill.create({
      name,
      category,
      proficiency,
      icon,
      iconSet,
      description,
      featured: featured || false,
      order: order || 0
    });

    revalidatePath('/');
    revalidatePath('/dashboard/skills');

    return NextResponse.json({
      success: true,
      data: skill
    });
  } catch (error) {
    console.error('Error in POST /api/skills:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create skill'
    }, { status: 500 });
  }
}

// PATCH /api/skills/bulk - Update multiple skills (e.g., for reordering)
export async function PATCH(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { skills } = body;

    if (!Array.isArray(skills)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request format. Expected an array of skills.'
      }, { status: 400 });
    }

    // Update each skill
    const updatePromises = skills.map(async (skill) => {
      const { _id, ...updateData } = skill;
      return Skill.findByIdAndUpdate(_id, updateData, { new: true });
    });

    const updatedSkills = await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      data: updatedSkills,
    });
  } catch (error) {
    console.error('Error updating skills:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update skills' },
      { status: 500 }
    );
  }
} 