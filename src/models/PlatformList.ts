import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPlatformList extends Document {
  name: string;
  description?: string;
  url?: string;
  note?: string;
  needsReferral?: boolean;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Reputation fields
  publicReview?: string;
  recommendation?: string;
  reputationScore?: number;
  remoteFocusScore?: number;
  curationScore?: number;
  payPotentialScore?: number;
  priorityScore?: number;
}

const platformListSchema = new Schema<IPlatformList>(
  {
    name: {
      type: String,
      required: [true, 'Platform name is required'],
      trim: true,
      unique: true,
      lowercase: true,
      maxlength: [100, 'Platform name cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    url: {
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
        message: 'Invalid platform URL format',
      },
    },
    note: {
      type: String,
      trim: true,
      maxlength: [600, 'Note cannot exceed 600 characters'],
    },
    needsReferral: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
    publicReview: { type: String, trim: true, maxlength: [1000, 'Public review cannot exceed 1000 characters'] },
    recommendation: { type: String, trim: true, maxlength: [500, 'Recommendation cannot exceed 500 characters'] },
    reputationScore: { type: Number, min: 1, max: 5 },
    remoteFocusScore: { type: Number, min: 1, max: 5 },
    curationScore: { type: Number, min: 1, max: 5 },
    payPotentialScore: { type: Number, min: 1, max: 5 },
    priorityScore: { type: Number, min: 0, max: 100 },
  },
  {
    timestamps: true,
  }
);

export const PlatformList =
  mongoose.models.PlatformList ||
  mongoose.model<IPlatformList>('PlatformList', platformListSchema);
