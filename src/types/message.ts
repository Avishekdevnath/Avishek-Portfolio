export enum MessageCategory {
  JOB = 'Job Opportunity',
  PROJECT = 'Project Collaboration',
  GENERAL = 'General Inquiry'
}

export enum MessageStatus {
  UNREAD = 'unread',
  READ = 'read',
  REPLIED = 'replied',
  ARCHIVED = 'archived'
}

export interface IReply {
  message: string;
  sentAt: Date;
  sentBy: 'user' | 'admin';
}

export interface IMessage {
  _id: string;
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
} 