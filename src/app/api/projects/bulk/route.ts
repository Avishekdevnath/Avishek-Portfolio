import { NextRequest, NextResponse } from 'next/server';
import Project, { Project as ProjectType } from '@/models/Project';
import { connectDB } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { projects } = await request.json();

    if (!Array.isArray(projects)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request body. Expected an array of projects.',
      });
    }

    // Delete all existing projects
    await Project.deleteMany({});

    // Create new projects
    let createdProjects: ProjectType[] = [];

    for (const project of projects) {
      const newProject = new Project(project);
      await newProject.save();
      createdProjects.push(newProject);
    }

    return NextResponse.json({
      success: true,
      data: {
        projects: createdProjects,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create projects',
    });
  }
} 