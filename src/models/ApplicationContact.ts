import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { APPLICATION_CONTACT_TITLES, ApplicationContactTitle, REFERRAL_STATUSES, ReferralStatus } from '@/lib/job-hunt-utils';

export interface ApplicationContact extends Document {
  applicationId?: Types.ObjectId;
  bookmarkId?: Types.ObjectId;
  sourceType: 'application' | 'bookmark';
  name: string;
  title: ApplicationContactTitle;
  company?: string;
  roleAtCompany?: string;
  linkedinUrl?: string;
  email?: string;
  phone?: string;
  bio?: string;
  referralStatus?: ReferralStatus;
  referralNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationContactSchema = new Schema<ApplicationContact>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'JobApplication',
      index: true,
      sparse: true,
    },
    bookmarkId: {
      type: Schema.Types.ObjectId,
      ref: 'BookmarkedJob',
      index: true,
      sparse: true,
    },
    sourceType: {
      type: String,
      enum: ['application', 'bookmark'],
      required: true,
      default: 'application',
    },
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    title: {
      type: String,
      enum: { values: [...APPLICATION_CONTACT_TITLES], message: 'Invalid contact title' },
      default: 'Other',
    },
    linkedinUrl: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: [500, 'Bio cannot exceed 500 characters'] },
    company: { type: String, trim: true, maxlength: [120, 'Company cannot exceed 120 characters'] },
    roleAtCompany: { type: String, trim: true, maxlength: [120, 'Role cannot exceed 120 characters'] },
    referralStatus: {
      type: String,
      enum: { values: [...REFERRAL_STATUSES], message: 'Invalid referral status' },
    },
    referralNote: { type: String, trim: true, maxlength: [500, 'Referral note cannot exceed 500 characters'] },
  },
  { timestamps: true }
);

applicationContactSchema.index({ applicationId: 1, createdAt: 1 }, { sparse: true });
applicationContactSchema.index({ bookmarkId: 1, createdAt: 1 }, { sparse: true });

const ApplicationContactModel: Model<ApplicationContact> =
  mongoose.models.ApplicationContact ||
  mongoose.model<ApplicationContact>('ApplicationContact', applicationContactSchema);

export default ApplicationContactModel;
