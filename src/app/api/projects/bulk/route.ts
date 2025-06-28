import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

export async function POST(request: Request) {
  try {
    const { projects } = await request.json();
    
    if (!projects || !Array.isArray(projects)) {
      return NextResponse.json(
        { success: false, error: 'Projects array is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate all projects before insertion
    for (const project of projects) {
      const validationProject = new Project(project);
      await validationProject.validate();
    }

    // Create all projects in a transaction
    const session = await Project.startSession();
    let createdProjects;
    
    try {
      await session.withTransaction(async () => {
        createdProjects = await Project.insertMany(projects, {
          session,
          ordered: true // This ensures documents are inserted in order and stops on first error
        });
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({
      success: true,
      data: createdProjects,
      message: `${createdProjects.length} projects created successfully`
    });
  } catch (error) {
    console.error('Error in bulk creation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to perform bulk operation'
      },
      { status: 500 }
    );
  }
} 