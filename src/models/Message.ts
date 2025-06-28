import mongoose, { Model } from 'mongoose';

export enum MessageStatus {
  UNREAD = 'unread',
  READ = 'read',
  REPLIED = 'replied',
  ARCHIVED = 'archived'
}

export enum MessageCategory {
  JOB = 'Job Opportunity',
  PROJECT = 'Project Collaboration',
  GENERAL = 'General Inquiry'
}

// Interface for a reply
export interface IReply {
  message: string;
  sentAt: Date;
  sentBy: 'user' | 'admin';
}

// Define interface for Message document
export interface IMessage extends mongoose.Document {
  name: string;
  email: string;
  subject: MessageCategory;
  message: string;
  status: MessageStatus;
  ipAddress?: string;
  userAgent?: string;
  readAt?: Date | null;
  repliedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  replies: IReply[];
  markAsRead: () => Promise<IMessage>;
  markAsReplied: () => Promise<IMessage>;
  archive: () => Promise<IMessage>;
  addReply: (reply: string) => Promise<IMessage>;
}

// Define interface for Message model
interface IMessageModel extends Model<IMessage> {
  getStats: () => Promise<{
    total: number;
    unread: number;
    replied: number;
    archived: number;
  }>;
}

const replySchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true,
    maxLength: [5000, 'Reply cannot be more than 5000 characters']
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  sentBy: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  }
});

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: Object.values(MessageCategory),
    default: MessageCategory.GENERAL
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxLength: [5000, 'Message cannot be more than 5000 characters']
  },
  status: {
    type: String,
    enum: Object.values(MessageStatus),
    default: MessageStatus.UNREAD
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  readAt: {
    type: Date,
    default: null
  },
  repliedAt: {
    type: Date,
    default: null
  },
  replies: [replySchema]
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ email: 1, createdAt: -1 });

// Method to mark message as read
messageSchema.methods.markAsRead = async function() {
  if (this.status === MessageStatus.UNREAD) {
    this.status = MessageStatus.READ;
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

// Method to mark message as replied
messageSchema.methods.markAsReplied = async function() {
  this.status = MessageStatus.REPLIED;
  this.repliedAt = new Date();
  await this.save();
  return this;
};

// Method to archive message
messageSchema.methods.archive = async function() {
  this.status = MessageStatus.ARCHIVED;
  await this.save();
  return this;
};

// Method to add a reply
messageSchema.methods.addReply = async function(replyMessage: string) {
  this.replies.push({
    message: replyMessage,
    sentAt: new Date(),
    sentBy: 'admin'
  });
  this.status = MessageStatus.REPLIED;
  this.repliedAt = new Date();
  await this.save();
  return this;
};

// Static method to get message statistics
messageSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: {
          $sum: {
            $cond: [{ $eq: ['$status', MessageStatus.UNREAD] }, 1, 0]
          }
        },
        replied: {
          $sum: {
            $cond: [{ $eq: ['$status', MessageStatus.REPLIED] }, 1, 0]
          }
        },
        archived: {
          $sum: {
            $cond: [{ $eq: ['$status', MessageStatus.ARCHIVED] }, 1, 0]
          }
        }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    unread: 0,
    replied: 0,
    archived: 0
  };
};

// Safe model initialization
let Message: IMessageModel;

try {
  // Try to get existing model
  Message = mongoose.model<IMessage, IMessageModel>('Message');
} catch {
  // Model doesn't exist, create it
  Message = mongoose.model<IMessage, IMessageModel>('Message', messageSchema);
}

export default Message; 