import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { handleApiError, sendSuccess, sendError } from '@/lib/api-utils';
import Blog from '@/models/Blog';
import BlogStats from '@/models/BlogStats';

// Get blog statistics
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase();

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return sendError('Blog not found', 404);
    }

    const stats = await BlogStats.findOne({ blog: blog._id });
    if (!stats) {
      return sendSuccess({
        views: 0,
        likes: 0,
        shares: 0,
        dailyStats: [],
      });
    }

    // Calculate total stats
    const totalStats = {
      views: stats.views.length,
      likes: stats.likes.length,
      shares: stats.shares.length,
      dailyStats: stats.dailyStats,
    };

    return sendSuccess(totalStats);
  } catch (error) {
    return handleApiError(error);
  }
}

// Track a new view, like, or share
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase();

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return sendError('Blog not found', 404);
    }

    const { type, data } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || 'unknown';

    let stats = await BlogStats.findOne({ blog: blog._id });
    if (!stats) {
      stats = new BlogStats({ blog: blog._id });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyStats = stats.dailyStats.find(
      (stat) => stat.date.getTime() === today.getTime()
    );

    if (!dailyStats) {
      dailyStats = {
        date: today,
        views: 0,
        uniqueVisitors: 0,
        avgTimeSpent: 0,
        likes: 0,
        shares: 0,
      };
      stats.dailyStats.push(dailyStats);
    }

    switch (type) {
      case 'view':
        stats.views.push({ timestamp: new Date(), ip, userAgent, referer });
        dailyStats.views += 1;
        // Check if this is a unique visitor for today
        const todayViews = stats.views.filter(
          (view) => view.ip === ip && 
          new Date(view.timestamp).toDateString() === today.toDateString()
        );
        if (todayViews.length === 1) {
          dailyStats.uniqueVisitors += 1;
        }
        break;

      case 'like':
        // Check if user already liked today
        const existingLike = stats.likes.find(
          (like) => like.ip === ip && 
          new Date(like.timestamp).toDateString() === today.toDateString()
        );
        if (!existingLike) {
          stats.likes.push({ timestamp: new Date(), ip });
          dailyStats.likes += 1;
          // Update blog likes count
          await Blog.findByIdAndUpdate(blog._id, { $inc: { likes: 1 } });
        }
        break;

      case 'share':
        stats.shares.push({ timestamp: new Date(), platform: data.platform });
        dailyStats.shares += 1;
        break;

      case 'reading_progress':
        stats.readingProgress.push({
          timestamp: new Date(),
          progress: data.progress,
          timeSpent: data.timeSpent,
        });
        // Update average time spent
        const todayProgress = stats.readingProgress.filter(
          (progress) => new Date(progress.timestamp).toDateString() === today.toDateString()
        );
        dailyStats.avgTimeSpent = todayProgress.reduce((acc, curr) => acc + curr.timeSpent, 0) / todayProgress.length;
        break;

      default:
        return sendError('Invalid stat type', 400);
    }

    await stats.save();
    return sendSuccess({ message: 'Stats updated successfully' });
  } catch (error) {
    return handleApiError(error);
  }
} 