import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET() {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');

    // Wrap all database operations in a try-catch for better error logging
    try {
      const [
        totalProjects,
        publishedProjects,
        draftProjects,
        featuredProjects,
        projectsByCategory,
        recentProjects,
        techStats,
        statusDistribution
      ] = await Promise.all([
        // Total projects count
        Project.countDocuments(),
        
        // Published projects count
        Project.countDocuments({ status: 'published' }),
        
        // Draft projects count
        Project.countDocuments({ status: 'draft' }),

        // Featured projects count
        Project.countDocuments({ featured: true }),
        
        // Projects by category
        Project.aggregate([
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 }
            }
          }
        ]),
        
        // Recent projects
        Project.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('title status createdAt'),
        
        // Technology usage statistics
        Project.aggregate([
          { $unwind: '$technologies' },
          {
            $group: {
              _id: '$technologies',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),

        // Status distribution
        Project.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      console.log('Stats retrieved successfully:', {
        total: totalProjects,
        published: publishedProjects,
        draft: draftProjects,
        featured: featuredProjects
      });

      return NextResponse.json({
        success: true,
        overview: {
          total: totalProjects,
          published: publishedProjects,
          draft: draftProjects,
          featured: featuredProjects
        },
        categoryDistribution: projectsByCategory.reduce((acc, cat) => {
          acc[cat._id] = cat.count;
          return acc;
        }, {}),
        recentProjects,
        topTechnologies: techStats.reduce((acc, tech) => {
          acc[tech._id] = tech.count;
          return acc;
        }, {}),
        statusDistribution: statusDistribution.reduce((acc, status) => {
          acc[status._id] = status.count;
          return acc;
        }, {})
      });
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Database operation failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in stats endpoint:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch project statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 