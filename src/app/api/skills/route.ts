import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Skill from '@/models/Skill';

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
    const skills = await Skill.find(query).sort({ order: 1, category: 1 });

    // Group skills by category
    const groupedSkills = skills.reduce((acc: any, skill) => {
      const key = skill.category.toLowerCase().replace(/\s+/g, '');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({
        name: skill.name,
        _id: skill._id,
        order: skill.order,
        proficiency: convertLevelToProficiency(skill.level)
      });
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: groupedSkills,
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

// POST /api/skills - Create a new skill
export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'level', 'category', 'type'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Create skill
    const skill = await Skill.create(body);

    return NextResponse.json({
      success: true,
      data: skill,
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create skill' },
      { status: 500 }
    );
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

// Helper function to convert level to numeric proficiency
function convertLevelToProficiency(level: string): number {
  const levelMap: Record<string, number> = {
    'Expert': 5,
    'Advanced': 4,
    'Intermediate': 3,
    'Basic': 2,
    'Beginner': 1,
    'Proficient': 4.5,
    'Native': 5,
    'Explored': 2.5
  };
  return levelMap[level] || 3;
} 