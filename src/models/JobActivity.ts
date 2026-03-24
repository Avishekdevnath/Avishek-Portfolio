import mongoose, { Document, Model, Schema } from 'mongoose';
import {
  ACTIVITY_TYPES,
  ActivityType,
  FOLLOW_UP_DONE_OPTIONS,
  FollowUpDoneOption,
  PRIORITY_LEVELS,
  PriorityLevel,
} from '@/lib/job-hunt-utils';

export interface JobActivity extends Document {
  date: Date;
  activityType: ActivityType;
  companyOrContact?: string;
  description?: string;
  timeSpentHours?: number;
  followUpDate?: Date;
  followUpDone: FollowUpDoneOption;
  priority: PriorityLevel;
  createdAt: Date;
  updatedAt: Date;
}

const jobActivitySchema = new Schema<JobActivity>(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
      default: Date.now,
    },
    activityType: {
      type: String,
      required: [true, 'Activity type is required'],
      enum: {
        values: [...ACTIVITY_TYPES],
        message: 'Invalid activity type',
      },
      index: true,
    },
    companyOrContact: {
      type: String,
      trim: true,
      maxlength: [180, 'Company/Contact cannot exceed 180 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    timeSpentHours: {
      type: Number,
      min: [0, 'Time spent cannot be negative'],
      max: [24, 'Time spent cannot exceed 24 hours'],
    },
    followUpDate: {
      type: Date,
      default: null,
      index: true,
    },
    followUpDone: {
      type: String,
      enum: {
        values: [...FOLLOW_UP_DONE_OPTIONS],
        message: 'Invalid follow-up status',
      },
      default: 'N/A',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: [...PRIORITY_LEVELS],
        message: 'Invalid priority',
      },
      default: 'Medium',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

jobActivitySchema.index({ date: -1, createdAt: -1 });
jobActivitySchema.index({ priority: 1, followUpDone: 1 });

const JobActivityModel: Model<JobActivity> =
  mongoose.models.JobActivity || mongoose.model<JobActivity>('JobActivity', jobActivitySchema);

export default JobActivityModel;
