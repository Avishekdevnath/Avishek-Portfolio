import mongoose, { Document, Model, Schema } from 'mongoose';
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  LOCATION_TYPES,
  LeadSource,
  LeadStatus,
  LocationType,
  normalizeDedupValue,
} from '@/lib/job-hunt-utils';

export interface JobLead extends Document {
  title: string;
  company: string;
  location?: string;
  jobType?: LocationType;
  source: LeadSource;
  jobUrl: string;
  status: LeadStatus;
  dateFound: Date;
  dateApplied?: Date;
  synced: boolean;
  normalizedTitle: string;
  normalizedCompany: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobLeadSchema = new Schema<JobLead>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
      maxlength: [120, 'Company cannot exceed 120 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters'],
    },
    jobType: {
      type: String,
      enum: {
        values: [...LOCATION_TYPES],
        message: 'Invalid location type',
      },
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      enum: {
        values: [...LEAD_SOURCES],
        message: 'Invalid lead source',
      },
      index: true,
    },
    jobUrl: {
      type: String,
      required: [true, 'Job URL is required'],
      trim: true,
      validate: {
        validator: (value: string) => {
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
    status: {
      type: String,
      enum: {
        values: [...LEAD_STATUSES],
        message: 'Invalid lead status',
      },
      default: 'New',
      index: true,
    },
    dateFound: {
      type: Date,
      default: Date.now,
      index: true,
    },
    dateApplied: {
      type: Date,
      default: null,
    },
    synced: {
      type: Boolean,
      default: false,
      index: true,
    },
    normalizedTitle: {
      type: String,
      required: true,
      index: true,
    },
    normalizedCompany: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

jobLeadSchema.pre('validate', function normalizeFields(next) {
  this.normalizedTitle = normalizeDedupValue(this.title || '');
  this.normalizedCompany = normalizeDedupValue(this.company || '');
  next();
});

jobLeadSchema.index(
  { normalizedTitle: 1, normalizedCompany: 1, source: 1 },
  { unique: true, name: 'lead_dedup_idx' }
);
jobLeadSchema.index({ status: 1, dateFound: -1 });

const JobLeadModel: Model<JobLead> =
  mongoose.models.JobLead || mongoose.model<JobLead>('JobLead', jobLeadSchema);

export default JobLeadModel;
