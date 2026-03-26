import mongoose, { Document, Schema, Types } from 'mongoose';
import { HRRoleTitle, HRContactStatus, HR_ROLE_TITLES, HR_CONTACT_STATUSES } from '@/lib/job-hunt-utils';

export interface IJobHuntHRContact extends Document {
  companyId: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  roleTitle?: HRRoleTitle;
  status: HRContactStatus;
  lastContactedAt?: Date;
  nextFollowUpAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobHuntHRContactSchema = new Schema<IJobHuntHRContact>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'JobHuntCompany',
      required: [true, 'Company is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'HR contact name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => {
          if (!value) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: 'Invalid email format',
      },
      maxlength: [255, 'Email cannot exceed 255 characters'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
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
    roleTitle: {
      type: String,
      enum: {
        values: [...HR_ROLE_TITLES],
        message: 'Invalid HR role title',
      },
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      default: 'New',
      enum: {
        values: [...HR_CONTACT_STATUSES],
        message: 'Invalid HR contact status',
      },
      index: true,
    },
    lastContactedAt: {
      type: Date,
    },
    nextFollowUpAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient queries
jobHuntHRContactSchema.index({ companyId: 1, status: 1 });
jobHuntHRContactSchema.index({ name: 'text', notes: 'text' });

export const JobHuntHRContact =
  mongoose.models.JobHuntHRContact ||
  mongoose.model<IJobHuntHRContact>('JobHuntHRContact', jobHuntHRContactSchema);
