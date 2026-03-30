import mongoose, { Document, Schema, Types } from 'mongoose';

export type BookmarkStatus = 'saved' | 'applied' | 'discarded';

export interface IBookmarkAIAnalysis {
  relevanceScore: number;
  relevanceSummary: string;
  interviewPrep: string[];
  resumeTips: string[];
  skillGaps: string[];
  generatedAt: Date;
}

export interface IBookmarkedJob extends Document {
  jobTitle: string;
  company: string;
  platform: string;
  jobUrl: string;
  notes?: string;
  jobDescription?: string;
  resumeLink?: string;
  followUpDate?: Date;
  followUpDone: boolean;
  aiAnalysis?: IBookmarkAIAnalysis;
  status: BookmarkStatus;
  linkedApplicationId?: Types.ObjectId;
  bookmarkedDate: Date;
  statusChangedDate?: Date;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkedJobSchema = new Schema<IBookmarkedJob>(
  {
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [180, 'Job title cannot exceed 180 characters'],
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
      maxlength: [120, 'Company cannot exceed 120 characters'],
      index: true,
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      trim: true,
      lowercase: true,
      maxlength: [100, 'Platform cannot exceed 100 characters'],
      index: true,
    },
    jobUrl: {
      type: String,
      required: [true, 'Job URL is required'],
      trim: true,
      validate: {
        validator: (value: string) => {
          if (!value) return false;
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Invalid job URL format',
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['saved', 'applied', 'discarded'],
        message: 'Invalid status',
      },
      default: 'saved',
      index: true,
    },
    linkedApplicationId: {
      type: Schema.Types.ObjectId,
      ref: 'JobApplication',
      sparse: true,
    },
    bookmarkedDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    statusChangedDate: {
      type: Date,
      sparse: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true,
    },
    jobDescription: {
      type: String,
      trim: true,
      maxlength: [20000, 'Job description cannot exceed 20000 characters'],
    },
    resumeLink: {
      type: String,
      trim: true,
      maxlength: [500, 'Resume link cannot exceed 500 characters'],
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    followUpDone: {
      type: Boolean,
      default: false,
    },
    aiAnalysis: {
      relevanceScore: { type: Number, min: 0, max: 100 },
      relevanceSummary: { type: String },
      interviewPrep: { type: [String], default: [] },
      resumeTips: { type: [String], default: [] },
      skillGaps: { type: [String], default: [] },
      generatedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient user + platform filtering
bookmarkedJobSchema.index({ createdBy: 1, platform: 1 });
bookmarkedJobSchema.index({ createdBy: 1, status: 1 });
bookmarkedJobSchema.index({ createdBy: 1, bookmarkedDate: -1 });

export const BookmarkedJob =
  mongoose.models.BookmarkedJob ||
  mongoose.model<IBookmarkedJob>('BookmarkedJob', bookmarkedJobSchema);
