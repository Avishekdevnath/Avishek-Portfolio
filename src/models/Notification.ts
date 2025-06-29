import { Schema, model, models, Document, Model } from 'mongoose';

export interface INotification extends Document {
  type: 'message' | 'comment' | 'like' | 'system' | 'update' | 'warning';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedId?: string;
  relatedType?: 'project' | 'blog' | 'experience' | 'message';
  actionUrl?: string;
  userId?: string; // For multi-user support in future
  metadata?: Record<string, any>; // Additional data
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
  markAllAsRead(userId?: string): Promise<any>;
  getUnreadCount(userId?: string): Promise<number>;
  deleteOldNotifications(daysOld?: number): Promise<any>;
}

const notificationSchema = new Schema<INotification>({
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: {
      values: ['message', 'comment', 'like', 'system', 'update', 'warning'],
      message: 'Invalid notification type'
    },
    index: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be longer than 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot be longer than 1000 characters']
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Invalid priority level'
    },
    default: 'medium',
    index: true
  },
  relatedId: {
    type: String,
    trim: true,
    index: true
  },
  relatedType: {
    type: String,
    enum: {
      values: ['project', 'blog', 'experience', 'message'],
      message: 'Invalid related type'
    },
    index: true
  },
  actionUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(value: string) {
        if (!value) return true; // Optional field
        // Basic URL validation
        return /^\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/.test(value);
      },
      message: 'Invalid action URL format'
    }
  },
  userId: {
    type: String,
    trim: true,
    index: true,
    default: 'admin' // Default for single-user portfolio
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  readAt: {
    type: Date,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, priority: 1, createdAt: -1 });
notificationSchema.index({ relatedType: 1, relatedId: 1 });

// Text index for search functionality
notificationSchema.index({
  title: 'text',
  message: 'text'
}, {
  weights: {
    title: 10,
    message: 5
  }
});

// Virtual for time ago calculation
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now.getTime() - this.createdAt.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
});

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  } else if (!this.isRead) {
    this.readAt = undefined;
  }
  next();
});

// Static methods
notificationSchema.statics.createNotification = async function(data: Partial<INotification>) {
  const notification = new this(data);
  return await notification.save();
};

notificationSchema.statics.markAsRead = async function(id: string) {
  return await this.findByIdAndUpdate(
    id,
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

notificationSchema.statics.markAsUnread = async function(id: string) {
  return await this.findByIdAndUpdate(
    id,
    { isRead: false, $unset: { readAt: 1 } },
    { new: true }
  );
};

notificationSchema.statics.markAllAsRead = async function(userId: string = 'admin') {
  return await this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

notificationSchema.statics.getUnreadCount = async function(userId: string = 'admin') {
  return await this.countDocuments({ userId, isRead: false });
};

notificationSchema.statics.deleteOldNotifications = async function(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = undefined;
  return this.save();
};

const Notification = (models.Notification || model<INotification, INotificationModel>('Notification', notificationSchema)) as INotificationModel;

export default Notification; 