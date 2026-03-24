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
  },
  {
    timestamps: true,
  }
);

export const PlatformList =
  mongoose.models.PlatformList ||
  mongoose.model<IPlatformList>('PlatformList', platformListSchema);
