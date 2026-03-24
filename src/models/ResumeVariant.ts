import mongoose, { Document, Schema } from 'mongoose';

export type ResumeStatus = 'draft' | 'ready' | 'failed';

export interface ResumeFileVersion {
  version: number;
  url: string;
  pathname?: string;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  uploadedAt: Date;
}

export interface IResumeVariant extends Document {
  title: string;
  slug: string;
  slugHistory: string[];
  focusTags: string[];
  summary?: string;
  markdownContent?: string;
  markdownUpdatedAt?: Date;
  fileUrl?: string;
  filePathname?: string;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  currentFileVersion: number;
  fileVersions: ResumeFileVersion[];
  publicViewEnabled: boolean;
  isPrimary: boolean;
  status: ResumeStatus;
  uploadSource: 'dashboard';
  createdAt: Date;
  updatedAt: Date;
}

const resumeFileVersionSchema = new Schema<ResumeFileVersion>(
  {
    version: { type: Number, required: true, min: 1 },
    url: { type: String, required: true, trim: true },
    pathname: { type: String, trim: true },
    fileName: { type: String, trim: true },
    fileSizeBytes: { type: Number, min: 0 },
    mimeType: { type: String, trim: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const resumeVariantSchema = new Schema<IResumeVariant>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      lowercase: true,
      maxlength: [180, 'Slug cannot exceed 180 characters'],
      index: true,
      unique: true,
    },
    slugHistory: {
      type: [String],
      default: [],
    },
    focusTags: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [800, 'Summary cannot exceed 800 characters'],
    },
    markdownContent: {
      type: String,
      default: null,
      maxlength: [250000, 'Markdown content is too large'],
    },
    markdownUpdatedAt: {
      type: Date,
      default: null,
    },
    fileUrl: {
      type: String,
      trim: true,
      default: null,
    },
    filePathname: {
      type: String,
      trim: true,
      default: null,
    },
    fileName: {
      type: String,
      trim: true,
      default: null,
    },
    fileSizeBytes: {
      type: Number,
      default: null,
      min: [0, 'File size cannot be negative'],
    },
    mimeType: {
      type: String,
      trim: true,
      default: null,
    },
    currentFileVersion: {
      type: Number,
      default: 0,
      min: [0, 'Current file version cannot be negative'],
    },
    fileVersions: {
      type: [resumeFileVersionSchema],
      default: [],
    },
    publicViewEnabled: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'ready', 'failed'],
        message: 'Invalid resume status',
      },
      default: 'draft',
      index: true,
    },
    uploadSource: {
      type: String,
      enum: ['dashboard'],
      default: 'dashboard',
    },
  },
  {
    timestamps: true,
  }
);

resumeVariantSchema.index({ slug: 1 }, { unique: true, name: 'resume_slug_unique_idx' });
resumeVariantSchema.index({ publicViewEnabled: 1, status: 1, updatedAt: -1 }, { name: 'resume_public_idx' });

export const ResumeVariant =
  mongoose.models.ResumeVariant ||
  mongoose.model<IResumeVariant>('ResumeVariant', resumeVariantSchema);
