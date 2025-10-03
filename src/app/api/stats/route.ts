import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Stats from '@/models/Stats';
import Project from '@/models/Project';
import Skill from '@/models/Skill';
import BlogStats from '@/models/BlogStats';
import Blog from '@/models/Blog';

interface BlogStatsItem {
  title: string;
  views: number;
}

interface AggregatedBlogStats {
  totalViews: number;
  uniqueVisitors: number;
  totalLikes: number;
  totalShares: number;
  avgTimeSpent: number;
  blogs: BlogStatsItem[];
}

// GET /api/stats - Get portfolio stats for homepage
export async function GET(request: Request) {
  try {
    await connectDB();

    // Get or create default stats
    let stats = await Stats.findOne();
    
    if (!stats) {
      // Create default stats if none exist
      stats = await Stats.create({
        programmingLanguages: {
          value: 15,
          description: "Languages & Frameworks"
        },
        projectsCompleted: {
          value: 50,
          description: "Successful Projects"
        },
        studentsCount: {
          value: 100,
          description: "Students Mentored"
        },
        workExperience: {
          value: 5,
          description: "Years of Experience"
        },
        customStats: [],
        tagline: "Passionate developer creating innovative solutions and mentoring the next generation of programmers."
      });
    }

    // Calculate dynamic stats from database (with fallbacks)
    let projectCount = 0;
    let skillCount = 0;
    
    try {
      [projectCount, skillCount] = await Promise.all([
        Project.countDocuments({}).catch(() => 0),
        Skill.countDocuments({}).catch(() => 0)
      ]);
    } catch (countError) {
      // Using defaults due to count error
    }

    // Update stats with real data
    const responseData = {
      programmingLanguages: {
        value: skillCount || stats.programmingLanguages?.value || 15,
        description: stats.programmingLanguages?.description || "Languages & Frameworks"
      },
      projectsCompleted: {
        value: projectCount || stats.projectsCompleted?.value || 50,
        description: stats.projectsCompleted?.description || "Successful Projects"
      },
      studentsCount: stats.studentsCount || { value: 100, description: "Students Mentored" },
      workExperience: stats.workExperience || { value: 5, description: "Years of Experience" },
      customStats: stats.customStats || [],
      tagline: stats.tagline || "Passionate developer creating innovative solutions"
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch portfolio stats' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/stats - Update editable stats fields
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate required fields
    if (!body.studentsCount || !body.workExperience) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let stats = await Stats.findOne();

    if (!stats) {
      // Create new stats document with all fields
      stats = await Stats.create({
        programmingLanguages: {
          value: 15,
          description: "Languages & Frameworks"
        },
        projectsCompleted: {
          value: 50,
          description: "Successful Projects"
        },
        studentsCount: body.studentsCount,
        workExperience: body.workExperience,
        customStats: body.customStats || [],
        tagline: body.tagline || "Passionate about creating impactful solutions"
      });
    } else {
      // Update only editable fields (preserve dynamic fields)
      stats.studentsCount = body.studentsCount;
      stats.workExperience = body.workExperience;
      stats.customStats = body.customStats || [];
      stats.tagline = body.tagline || stats.tagline;
      await stats.save();
    }

    // Return updated stats in the same format as GET
    const [projectCount, skillCount] = await Promise.all([
      Project.countDocuments({}).catch(() => 0),
      Skill.countDocuments({}).catch(() => 0)
    ]);

    const responseData = {
      programmingLanguages: {
        value: skillCount || stats.programmingLanguages?.value || 15,
        description: stats.programmingLanguages?.description || "Languages & Frameworks"
      },
      projectsCompleted: {
        value: projectCount || stats.projectsCompleted?.value || 50,
        description: stats.projectsCompleted?.description || "Successful Projects"
      },
      studentsCount: stats.studentsCount,
      workExperience: stats.workExperience,
      customStats: stats.customStats || [],
      tagline: stats.tagline
    };

    return NextResponse.json({ 
      success: true, 
      data: responseData,
      message: 'Stats updated successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update stats' 
      },
      { status: 500 }
    );
  }
} 