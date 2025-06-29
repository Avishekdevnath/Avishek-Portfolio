import mongoose, { Document } from 'mongoose';

interface IView {
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  referer?: string;
}

interface ILike {
  timestamp: Date;
  ip?: string;
}

interface IShare {
  timestamp: Date;
  platform: string;
}

interface IReadingProgress {
  timestamp: Date;
  progress: number;
  timeSpent: number;
}

interface IDailyStats {
  date: Date;
  views: number;
  uniqueVisitors: number;
  avgTimeSpent: number;
  likes: number;
  shares: number;
}

export interface IBlogStats extends Document {
  blog: mongoose.Types.ObjectId;
  views: IView[];
  likes: ILike[];
  shares: IShare[];
  readingProgress: IReadingProgress[];
  dailyStats: IDailyStats[];
  createdAt: Date;
  updatedAt: Date;
}

const blogStatsSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  views: [{
    timestamp: { type: Date, default: Date.now },
    ip: String,
    userAgent: String,
    referer: String,
  }],
  likes: [{
    timestamp: { type: Date, default: Date.now },
    ip: String,
  }],
  shares: [{
    timestamp: { type: Date, default: Date.now },
    platform: String, // e.g., 'twitter', 'facebook', etc.
  }],
  readingProgress: [{
    timestamp: { type: Date, default: Date.now },
    progress: Number, // percentage of content read
    timeSpent: Number, // time spent in seconds
  }],
  dailyStats: [{
    date: { type: Date, required: true },
    views: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    avgTimeSpent: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
  }],
}, {
  timestamps: true,
});

// Indexes for better query performance
blogStatsSchema.index({ blog: 1 });
blogStatsSchema.index({ 'dailyStats.date': 1 });
blogStatsSchema.index({ 'views.timestamp': 1 });

const BlogStats = mongoose.models.BlogStats || mongoose.model<IBlogStats>('BlogStats', blogStatsSchema);

export default BlogStats;