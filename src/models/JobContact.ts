import mongoose, { Document, Model, Schema } from 'mongoose';
import {
  CONTACT_STATUSES,
  ContactStatus,
  REFERRAL_OPTIONS,
  REFERRAL_OPTIONS as REFERRAL_VALUES,
  ReferralOption,
  RELATIONSHIP_TYPES,
  RelationshipType,
} from '@/lib/job-hunt-utils';

export interface JobContact extends Document {
  name: string;
  company?: string;
  titleOrRole?: string;
  relationship: RelationshipType;
  contactInfo?: string;
  lastContact?: Date;
  nextFollowUp?: Date;
  referredYou: ReferralOption;
  notes?: string;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
}

const jobContactSchema = new Schema<JobContact>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
      index: true,
    },
    company: {
      type: String,
      trim: true,
      maxlength: [120, 'Company cannot exceed 120 characters'],
      index: true,
    },
    titleOrRole: {
      type: String,
      trim: true,
      maxlength: [150, 'Title/Role cannot exceed 150 characters'],
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      enum: {
        values: [...RELATIONSHIP_TYPES],
        message: 'Invalid relationship type',
      },
      index: true,
    },
    contactInfo: {
      type: String,
      trim: true,
      maxlength: [320, 'Contact info cannot exceed 320 characters'],
    },
    lastContact: {
      type: Date,
      default: null,
      index: true,
    },
    nextFollowUp: {
      type: Date,
      default: null,
      index: true,
    },
    referredYou: {
      type: String,
      enum: {
        values: [...REFERRAL_VALUES],
        message: 'Invalid referral status',
      },
      default: REFERRAL_OPTIONS[1],
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [3000, 'Notes cannot exceed 3000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: [...CONTACT_STATUSES],
        message: 'Invalid contact status',
      },
      default: 'Warm',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

jobContactSchema.index({ status: 1, nextFollowUp: 1 });
jobContactSchema.index({ company: 1, name: 1 });

const JobContactModel: Model<JobContact> =
  mongoose.models.JobContact || mongoose.model<JobContact>('JobContact', jobContactSchema);

export default JobContactModel;
