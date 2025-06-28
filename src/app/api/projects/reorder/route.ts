import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Project from '@/models/Project';

export async function POST(request: Request) {
  try {
    const { projectIds } = await request.json();
    
    if (!projectIds || !Array.isArray(projectIds)) {
      return NextResponse.json(
        { error: 'Project IDs array is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Update each project's order in a transaction
    const session = await Project.startSession();
    try {
      await session.withTransaction(async () => {
        const updates = projectIds.map((id, index) => ({
          updateOne: {
            filter: { _id: id },
            update: { $set: { order: index } }
          }
        }));

        await Project.bulkWrite(updates, { session });
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({
      message: 'Projects reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering projects:', error);
    return NextResponse.json(
      { error: 'Failed to reorder projects' },
      { status: 500 }
    );
  }
} 