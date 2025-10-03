import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import BlogStats from '@/models/BlogStats';
import Project from '@/models/Project';
import Message from '@/models/Message';
import Skill from '@/models/Skill';
import Notification from '@/models/Notification';

interface BlogStatsResult {
  _id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  score: number;
}

export async function GET() {
  try {
    await connectDB();

    // Get blog stats with trending posts
    const blogStats = await Blog.aggregate([
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                published: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'published'] }, 1, 0]
                  }
                },
                draft: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'draft'] }, 1, 0]
                  }
                }
              }
            }
          ],
          trending: [
            {
              $match: { status: 'published' }
            },
            {
              $lookup: {
                from: BlogStats.collection.name,
                localField: '_id',
                foreignField: 'blog',
                as: 'stats'
              }
            },
            {
              $unwind: {
                path: '$stats',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                title: 1,
                views: { $size: { $ifNull: ['$stats.views', []] } },
                likes: { $size: { $ifNull: ['$stats.likes', []] } },
                comments: { $size: { $ifNull: ['$stats.comments', []] } }
              }
            },
            {
              $addFields: {
                score: {
                  $add: [
                    '$views',
                    { $multiply: ['$likes', 5] },
                    { $multiply: ['$comments', 10] }
                  ]
                }
              }
            },
            {
              $sort: { score: -1 }
            },
            {
              $limit: 5
            }
          ]
        }
      }
    ]) as [{ counts: any[], trending: BlogStatsResult[] }];

    // Get project stats with active projects
    const projectStats = await Project.aggregate([
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                active: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
                  }
                },
                completed: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
                  }
                }
              }
            }
          ],
          recent: [
            {
              $match: { status: 'active' }
            },
            {
              $sort: { updatedAt: -1 }
            },
            {
              $limit: 3
            },
            {
              $project: {
                title: 1,
                progress: 1,
                updatedAt: 1
              }
            }
          ]
        }
      }
    ]);

    // Get message stats with recent unread messages
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const messageStats = await Message.aggregate([
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                unread: {
                  $sum: {
                    $cond: [{ $eq: ['$read', false] }, 1, 0]
                  }
                },
                last30Days: {
                  $sum: {
                    $cond: [
                      { $gte: ['$createdAt', thirtyDaysAgo] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],
          recent: [
            {
              $match: { read: false }
            },
            {
              $sort: { createdAt: -1 }
            },
            {
              $limit: 5
            },
            {
              $project: {
                sender: '$name',
                subject: 1,
                preview: { $substr: ['$message', 0, 100] },
                createdAt: 1
              }
            }
          ]
        }
      }
    ]);

    // Get skill stats with trending skills
    const skillStats = await Skill.aggregate([
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                featured: {
                  $sum: {
                    $cond: [{ $eq: ['$featured', true] }, 1, 0]
                  }
                }
              }
            }
          ],
          trending: [
            {
              $match: { featured: true }
            },
            {
              $sort: { proficiency: -1 }
            },
            {
              $limit: 5
            },
            {
              $project: {
                name: 1,
                proficiency: 1,
                category: 1
              }
            }
          ]
        }
      }
    ]);

    // Get recent activity from notifications
    const recentActivity = await Notification.aggregate([
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          type: 1,
          title: 1,
          message: 1,
          createdAt: 1,
          priority: 1,
          actionUrl: 1
        }
      }
    ]);

    // Calculate engagement metrics
    const engagementStats = await BlogStats.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: { $size: '$views' } },
          totalLikes: { $sum: { $size: '$likes' } },
          totalShares: { $sum: { $size: '$shares' } },
          avgReadingTime: { $avg: '$readingProgress.timeSpent' }
        }
      }
    ]);

    return NextResponse.json({
      blogs: {
        total: blogStats[0]?.counts[0]?.total || 0,
        published: blogStats[0]?.counts[0]?.published || 0,
        draft: blogStats[0]?.counts[0]?.draft || 0,
        trending: blogStats[0]?.trending || []
      },
      projects: {
        total: projectStats[0]?.counts[0]?.total || 0,
        active: projectStats[0]?.counts[0]?.active || 0,
        completed: projectStats[0]?.counts[0]?.completed || 0,
        recent: projectStats[0]?.recent || []
      },
      messages: {
        total: messageStats[0]?.counts[0]?.total || 0,
        unread: messageStats[0]?.counts[0]?.unread || 0,
        last30Days: messageStats[0]?.counts[0]?.last30Days || 0,
        recent: messageStats[0]?.recent || []
      },
      skills: {
        total: skillStats[0]?.counts[0]?.total || 0,
        featured: skillStats[0]?.counts[0]?.featured || 0,
        trending: skillStats[0]?.trending || []
      },
      engagement: engagementStats[0] || {
        totalViews: 0,
        totalLikes: 0,
        totalShares: 0,
        avgReadingTime: 0
      },
      recentActivity
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}