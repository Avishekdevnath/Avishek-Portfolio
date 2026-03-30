import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { APPLICATION_STATUSES, JOB_TYPES, ApplicationStatus, JobType } from '@/lib/job-hunt-utils';

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  changedAt: Date;
  note?: string;
}

export interface JobApplication extends Document {
  company: string;
  jobTitle: string;
  jobUrl?: string;
  dateApplied: Date;
  status: ApplicationStatus;
  jobType?: JobType;
  location?: string;
  salaryRange?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
  sourceLeadId?: Types.ObjectId;
  statusHistory: StatusHistoryEntry[];
  followUpReminderAt?: Date;
  reminderFired: boolean;
  resumeLink?: string;
  jobDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<JobApplication>(
  {
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
      maxlength: [120, 'Company cannot exceed 120 characters'],
      index: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [180, 'Job title cannot exceed 180 characters'],
      index: true,
    },
    jobUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (value: string) => {
          if (!value) return true;
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
    dateApplied: {
      type: Date,
      required: [true, 'Date applied is required'],
      index: true,
    },
    status: {
      type: String,
      required: [true, 'Application status is required'],
      enum: {
        values: [...APPLICATION_STATUSES],
        message: 'Invalid application status',
      },
      default: 'Applied',
      index: true,
    },
    jobType: {
      type: String,
      enum: {
        values: [...JOB_TYPES],
        message: 'Invalid job type',
      },
      index: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters'],
    },
    salaryRange: {
      type: String,
      trim: true,
      maxlength: [120, 'Salary range cannot exceed 120 characters'],
    },
    contactName: {
      type: String,
      trim: true,
      maxlength: [120, 'Contact name cannot exceed 120 characters'],
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => {
          if (!value) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: 'Invalid contact email format',
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [3000, 'Notes cannot exceed 3000 characters'],
    },
    sourceLeadId: {
      type: Schema.Types.ObjectId,
      ref: 'JobLead',
      index: true,
      sparse: true,
      unique: true,
    },
    statusHistory: {
      type: [
        {
          status: { type: String, required: true },
          changedAt: { type: Date, required: true },
          note: { type: String },
        },
      ],
      default: [],
    },
    followUpReminderAt: {
      type: Date,
      default: null,
    },
    reminderFired: {
      type: Boolean,
      default: false,
    },
    resumeLink: {
      type: String,
      trim: true,
      maxlength: [500, 'Resume link cannot exceed 500 characters'],
    },
    jobDescription: {
      type: String,
      trim: true,
      maxlength: [20000, 'Job description cannot exceed 20000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

jobApplicationSchema.index({ status: 1, dateApplied: -1 });
jobApplicationSchema.index({ createdAt: -1 });

const JobApplicationModel: Model<JobApplication> =
  mongoose.models.JobApplication || mongoose.model<JobApplication>('JobApplication', jobApplicationSchema);

export default JobApplicationModel;
