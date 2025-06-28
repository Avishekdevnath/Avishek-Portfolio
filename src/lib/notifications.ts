import { connectDB } from './mongodb';
import Notification from '@/models/Notification';
import { INotification } from '@/models/Notification';

export interface CreateNotificationData {
  type: 'message' | 'comment' | 'like' | 'system' | 'update' | 'warning';
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  relatedId?: string;
  relatedType?: 'project' | 'blog' | 'experience' | 'message';
  actionUrl?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a new notification
 */
export async function createNotification(data: CreateNotificationData) {
  try {
    await connectDB();
    
    const notification = await Notification.create({
      ...data,
      userId: data.userId || 'admin',
      priority: data.priority || 'medium',
      metadata: data.metadata || {},
      isRead: false
    });

    return { success: true, data: notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Create notification for new contact message
 */
export async function createMessageNotification(data: {
  sender: string;
  subject: string;
  id: string;
  metadata?: Record<string, any>;
}) {
  try {
    await connectDB();

    const notificationData: Partial<INotification> = {
      type: 'message',
      title: `New Message from ${data.sender}`,
      message: `You have received a new message: "${data.subject}"`,
      priority: 'high',
      relatedType: 'message',
      relatedId: data.id,
      actionUrl: `/dashboard/messages/${data.id}`,
      metadata: data.metadata
    };

    return await Notification.createNotification(notificationData);
  } catch (error) {
    console.error('Error creating message notification:', error);
    throw error;
  }
}

/**
 * Create notification for new blog comment
 */
export async function createCommentNotification(commentData: {
  commenterName: string;
  blogTitle: string;
  blogSlug: string;
  commentId: string;
}) {
  return createNotification({
    type: 'comment',
    title: 'New Blog Comment',
    message: `${commentData.commenterName} commented on your blog post "${commentData.blogTitle}"`,
    priority: 'medium',
    relatedId: commentData.commentId,
    relatedType: 'blog',
    actionUrl: `/blogs/${commentData.blogSlug}#comments`,
    metadata: {
      commenterName: commentData.commenterName,
      blogTitle: commentData.blogTitle,
      blogSlug: commentData.blogSlug
    }
  });
}

/**
 * Create notification for project likes
 */
export async function createLikeNotification(likeData: {
  projectTitle: string;
  projectId: string;
  likeCount: number;
}) {
  return createNotification({
    type: 'like',
    title: 'Project Liked',
    message: `Your project "${likeData.projectTitle}" received ${likeData.likeCount} new ${likeData.likeCount === 1 ? 'like' : 'likes'}`,
    priority: 'low',
    relatedId: likeData.projectId,
    relatedType: 'project',
    actionUrl: `/projects/${likeData.projectId}`,
    metadata: {
      projectTitle: likeData.projectTitle,
      likeCount: likeData.likeCount
    }
  });
}

/**
 * Create notification for blog likes
 */
export async function createBlogLikeNotification(likeData: {
  blogTitle: string;
  blogSlug: string;
  likeCount: number;
}) {
  return createNotification({
    type: 'like',
    title: 'Blog Post Liked',
    message: `Your blog post "${likeData.blogTitle}" received ${likeData.likeCount} new ${likeData.likeCount === 1 ? 'like' : 'likes'}`,
    priority: 'low',
    relatedId: likeData.blogSlug,
    relatedType: 'blog',
    actionUrl: `/blogs/${likeData.blogSlug}`,
    metadata: {
      blogTitle: likeData.blogTitle,
      likeCount: likeData.likeCount
    }
  });
}

/**
 * Create system notification
 */
export async function createSystemNotification(data: {
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await connectDB();

    const notificationData: Partial<INotification> = {
      type: 'system',
      title: data.title,
      message: data.message,
      priority: data.priority || 'medium',
      actionUrl: data.actionUrl,
      metadata: data.metadata
    };

    return await Notification.createNotification(notificationData);
  } catch (error) {
    console.error('Error creating system notification:', error);
    throw error;
  }
}

/**
 * Create update notification
 */
export async function createUpdateNotification(updateData: {
  title: string;
  message: string;
  actionUrl?: string;
}) {
  return createNotification({
    type: 'update',
    title: updateData.title,
    message: updateData.message,
    priority: 'medium',
    actionUrl: updateData.actionUrl
  });
}

/**
 * Create warning notification
 */
export async function createWarningNotification(data: {
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await connectDB();

    const notificationData: Partial<INotification> = {
      type: 'warning',
      title: data.title,
      message: data.message,
      priority: 'high',
      actionUrl: data.actionUrl,
      metadata: data.metadata
    };

    return await Notification.createNotification(notificationData);
  } catch (error) {
    console.error('Error creating warning notification:', error);
    throw error;
  }
}

/**
 * Create milestone notification
 */
export async function createMilestoneNotification(milestoneData: {
  type: 'views' | 'likes' | 'comments' | 'projects' | 'blogs';
  count: number;
  period?: string;
}) {
  const typeMessages = {
    views: `Your portfolio has reached ${milestoneData.count.toLocaleString()} profile views${milestoneData.period ? ` this ${milestoneData.period}` : ''}!`,
    likes: `Your content has received ${milestoneData.count.toLocaleString()} total likes!`,
    comments: `You've received ${milestoneData.count.toLocaleString()} comments on your content!`,
    projects: `You've published ${milestoneData.count} projects on your portfolio!`,
    blogs: `You've written ${milestoneData.count} blog posts!`
  };

  return createNotification({
    type: 'update',
    title: `${milestoneData.type.charAt(0).toUpperCase() + milestoneData.type.slice(1)} Milestone!`,
    message: `Congratulations! ${typeMessages[milestoneData.type]}`,
    priority: 'medium',
    actionUrl: '/dashboard/stats',
    metadata: {
      milestoneType: milestoneData.type,
      count: milestoneData.count,
      period: milestoneData.period
    }
  });
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string = 'admin') {
  try {
    await connectDB();
    return await Notification.getUnreadCount(userId);
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string = 'admin') {
  try {
    await connectDB();
    return await Notification.markAllAsRead(userId);
  } catch (error) {
    console.error('Error marking all as read:', error);
    return { modifiedCount: 0 };
  }
}

/**
 * Clean up old notifications
 */
export async function cleanupOldNotifications(daysOld: number = 30) {
  try {
    await connectDB();
    return await Notification.deleteOldNotifications(daysOld);
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    throw error;
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(userId: string = 'admin') {
  try {
    await connectDB();
    
    const stats = await Notification.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$isRead', true] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          byType: {
            $push: {
              type: '$type',
              isRead: '$isRead',
              priority: '$priority'
            }
          }
        }
      }
    ]);

    const result = stats[0] || { total: 0, unread: 0, read: 0, highPriority: 0, byType: [] };
    
    // Group by type
    const typeStats = result.byType.reduce((acc: any, item: any) => {
      if (!acc[item.type]) {
        acc[item.type] = { total: 0, unread: 0 };
      }
      acc[item.type].total++;
      if (!item.isRead) {
        acc[item.type].unread++;
      }
      return acc;
    }, {});

    return {
      ...result,
      typeStats
    };
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return { total: 0, unread: 0, read: 0, highPriority: 0, typeStats: {} };
  }
}

export async function createBlogNotification(data: {
  title: string;
  slug: string;
  action: 'published' | 'commented' | 'liked' | 'viewed';
  metadata?: Record<string, any>;
}) {
  try {
    await connectDB();

    const notificationData: Partial<INotification> = {
      type: data.action === 'published' ? 'update' : 
            data.action === 'commented' ? 'comment' :
            data.action === 'liked' ? 'like' : 'system',
      title: getNotificationTitle(data),
      message: getNotificationMessage(data),
      priority: data.action === 'published' ? 'high' : 'medium',
      relatedType: 'blog',
      relatedId: data.slug,
      actionUrl: `/blogs/${data.slug}`,
      metadata: data.metadata
    };

    return await Notification.createNotification(notificationData);
  } catch (error) {
    console.error('Error creating blog notification:', error);
    throw error;
  }
}

export async function createProjectNotification(data: {
  title: string;
  id: string;
  action: 'created' | 'updated' | 'completed' | 'viewed';
  metadata?: Record<string, any>;
}) {
  try {
    await connectDB();

    const notificationData: Partial<INotification> = {
      type: data.action === 'created' || data.action === 'updated' ? 'update' : 'system',
      title: getProjectNotificationTitle(data),
      message: getProjectNotificationMessage(data),
      priority: data.action === 'created' ? 'high' : 'medium',
      relatedType: 'project',
      relatedId: data.id,
      actionUrl: `/projects/${data.id}`,
      metadata: data.metadata
    };

    return await Notification.createNotification(notificationData);
  } catch (error) {
    console.error('Error creating project notification:', error);
    throw error;
  }
}

// Helper functions for notification messages
function getNotificationTitle(data: { title: string; action: string }) {
  switch (data.action) {
    case 'published':
      return `New Blog Post Published: ${data.title}`;
    case 'commented':
      return `New Comment on "${data.title}"`;
    case 'liked':
      return `Someone Liked "${data.title}"`;
    case 'viewed':
      return `Blog Post Milestone: "${data.title}"`;
    default:
      return `Blog Update: ${data.title}`;
  }
}

function getNotificationMessage(data: { title: string; action: string }) {
  switch (data.action) {
    case 'published':
      return `Your blog post "${data.title}" has been published successfully.`;
    case 'commented':
      return `Someone left a new comment on your blog post "${data.title}".`;
    case 'liked':
      return `Someone liked your blog post "${data.title}".`;
    case 'viewed':
      return `Your blog post "${data.title}" has reached a new view milestone!`;
    default:
      return `There has been an update to your blog post "${data.title}".`;
  }
}

function getProjectNotificationTitle(data: { title: string; action: string }) {
  switch (data.action) {
    case 'created':
      return `New Project Created: ${data.title}`;
    case 'updated':
      return `Project Updated: ${data.title}`;
    case 'completed':
      return `Project Completed: ${data.title}`;
    case 'viewed':
      return `Project Milestone: ${data.title}`;
    default:
      return `Project Update: ${data.title}`;
  }
}

function getProjectNotificationMessage(data: { title: string; action: string }) {
  switch (data.action) {
    case 'created':
      return `Your new project "${data.title}" has been created successfully.`;
    case 'updated':
      return `Your project "${data.title}" has been updated.`;
    case 'completed':
      return `Congratulations! Your project "${data.title}" has been marked as completed.`;
    case 'viewed':
      return `Your project "${data.title}" has reached a new view milestone!`;
    default:
      return `There has been an update to your project "${data.title}".`;
  }
} 