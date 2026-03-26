import mongoose, { Document, Schema } from 'mongoose';
import { CompanyTier, COMPANY_TIERS } from '@/lib/job-hunt-utils';

export interface IJobHuntCompany extends Document {
  name: string;
  website?: string;
  careerPageUrl?: string;
  linkedinUrl?: string;
  industry?: string;
  size?: string;
  locationHQ?: string;
  tier?: CompanyTier;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobHuntCompanySchema = new Schema<IJobHuntCompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
      lowercase: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
      index: true,
    },
    website: {
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
        message: 'Invalid website URL format',
      },
    },
    careerPageUrl: {
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
        message: 'Invalid career page URL format',
      },
    },
    linkedinUrl: {
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
        message: 'Invalid LinkedIn URL format',
      },
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [100, 'Industry cannot exceed 100 characters'],
    },
    size: {
      type: String,
      trim: true,
      enum: {
        values: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise'],
        message: 'Invalid company size',
      },
    },
    locationHQ: {
      type: String,
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters'],
    },
    tier: {
      type: String,
      enum: {
        values: [...COMPANY_TIERS],
        message: 'Invalid company tier',
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search
jobHuntCompanySchema.index({ name: 'text', industry: 'text', notes: 'text' });

export const JobHuntCompany =
  mongoose.models.JobHuntCompany ||
  mongoose.model<IJobHuntCompany>('JobHuntCompany', jobHuntCompanySchema);
