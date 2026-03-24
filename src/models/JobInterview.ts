import mongoose, { Document, Model, Schema } from 'mongoose';
import {
  INTERVIEW_RESULTS,
  INTERVIEW_ROUNDS,
  INTERVIEW_TYPES,
  InterviewResult,
  InterviewRound,
  InterviewType,
} from '@/lib/job-hunt-utils';

export interface JobInterview extends Document {
  company: string;
  jobTitle: string;
  interviewRound: InterviewRound;
  interviewDate: Date;
  interviewType: InterviewType;
  interviewers?: string;
  questionsAsked?: string;
  selfRating?: number;
  result: InterviewResult;
  nextSteps?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobInterviewSchema = new Schema<JobInterview>(
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
    interviewRound: {
      type: String,
      required: [true, 'Interview round is required'],
      enum: {
        values: [...INTERVIEW_ROUNDS],
        message: 'Invalid interview round',
      },
    },
    interviewDate: {
      type: Date,
      required: [true, 'Interview date is required'],
      index: true,
    },
    interviewType: {
      type: String,
      required: [true, 'Interview type is required'],
      enum: {
        values: [...INTERVIEW_TYPES],
        message: 'Invalid interview type',
      },
    },
    interviewers: {
      type: String,
      trim: true,
      maxlength: [500, 'Interviewers cannot exceed 500 characters'],
    },
    questionsAsked: {
      type: String,
      trim: true,
      maxlength: [5000, 'Questions asked cannot exceed 5000 characters'],
    },
    selfRating: {
      type: Number,
      min: [1, 'Self rating must be between 1 and 5'],
      max: [5, 'Self rating must be between 1 and 5'],
    },
    result: {
      type: String,
      enum: {
        values: [...INTERVIEW_RESULTS],
        message: 'Invalid interview result',
      },
      default: 'Pending',
      index: true,
    },
    nextSteps: {
      type: String,
      trim: true,
      maxlength: [2000, 'Next steps cannot exceed 2000 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

jobInterviewSchema.index({ interviewDate: -1, company: 1 });
jobInterviewSchema.index({ result: 1, createdAt: -1 });

const JobInterviewModel: Model<JobInterview> =
  mongoose.models.JobInterview || mongoose.model<JobInterview>('JobInterview', jobInterviewSchema);

export default JobInterviewModel;
