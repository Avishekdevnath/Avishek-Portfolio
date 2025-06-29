import { Document, Model } from 'mongoose';

export interface INotification extends Document {
  type: 'message' | 'comment' | 'like' | 'system' | 'update' | 'warning';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedId?: string;
  relatedType?: 'project' | 'blog' | 'experience' | 'message';
  actionUrl?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  markAsRead(): Promise<INotification>;
  markAsUnread(): Promise<INotification>;
}

export interface INotificationModel extends Model<INotification> {
  createNotification(data: Partial<INotification>): Promise<INotification>;
  markAsRead(id: string): Promise<INotification | null>;
  markAsUnread(id: string): Promise<INotification | null>;
  markAllAsRead(userId?: string): Promise<{ acknowledged: boolean; modifiedCount: number }>;
  getUnreadCount(userId?: string): Promise<number>;
  deleteOldNotifications(daysOld?: number): Promise<{ acknowledged: boolean; deletedCount: number }>;
}