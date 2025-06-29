import mongoose, { Model } from 'mongoose';
import { MessageCategory, MessageStatus, IMessage as IMessageType, IReply } from '@/types/message';

// Re-export types for convenience (but components should import from @/types/message)
export type { IReply } from '@/types/message';
export { MessageCategory, MessageStatus } from '@/types/message';

// Define interface for Message document extending mongoose.Document and IMessageType
export interface IMessage extends mongoose.Document, Omit<IMessageType, '_id'> {
  _id: mongoose.Types.ObjectId;
  markAsRead: () => Promise<IMessage>;
  markAsReplied: () => Promise<IMessage>;
  archive: () => Promise<IMessage>;
  addReply: (reply: string) => Promise<IMessage>;
}

// Define interface for Message model
export interface IMessageModel extends Model<IMessage> {
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
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret._id = ret._id.toString();
      return ret;
    }
  }
});

// Add methods to the schema
messageSchema.methods.markAsRead = async function(): Promise<IMessage> {
  this.status = MessageStatus.READ;
  this.readAt = new Date();
  return await this.save();
};

messageSchema.methods.markAsReplied = async function(): Promise<IMessage> {
  this.status = MessageStatus.REPLIED;
  this.repliedAt = new Date();
  return await this.save();
};

messageSchema.methods.archive = async function(): Promise<IMessage> {
  this.status = MessageStatus.ARCHIVED;
  return await this.save();
};

messageSchema.methods.addReply = async function(replyMessage: string): Promise<IMessage> {
  this.replies.push({
    message: replyMessage,
    sentAt: new Date(),
    sentBy: 'admin'
  });
  return await this.save();
};

// Add static methods to the schema
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

// Create and export the model
const Message = (mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema)) as IMessageModel;

export default Message;