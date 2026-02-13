import mongoose, { Document, Schema } from 'mongoose';

export type OutreachDraftIntent = 'cold' | 'post_application' | 'follow_up';
export type OutreachTone = 'professional' | 'friendly';

export interface IOutreachDraft extends Document {
  contactId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  intent: OutreachDraftIntent;
  tone: OutreachTone;
  jobTitle?: string;
  jobDescription?: string;
  selectedProjectIds?: mongoose.Types.ObjectId[];
  selectedSkillIds?: mongoose.Types.ObjectId[];
  selectedExperienceIds?: mongoose.Types.ObjectId[];
  subject: string;
  body: string;
  modelUsed?: string;
  createdAt: Date;
  updatedAt: Date;
}

const outreachDraftSchema = new Schema<IOutreachDraft>(
  {
    contactId: {
      type: Schema.Types.ObjectId,
      ref: 'OutreachContact',
      required: [true, 'Contact is required'],
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'OutreachCompany',
      required: [true, 'Company is required'],
      index: true,
    },
    intent: {
      type: String,
      required: [true, 'Intent is required'],
      enum: {
        values: ['cold', 'post_application', 'follow_up'],
        message: 'Invalid draft intent',
      },
      index: true,
    },
    tone: {
      type: String,
      required: [true, 'Tone is required'],
      enum: {
        values: ['professional', 'friendly'],
        message: 'Invalid tone',
      },
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Job title cannot be longer than 200 characters'],
    },
    jobDescription: {
      type: String,
      trim: true,
      maxlength: [10000, 'Job description cannot be longer than 10000 characters'],
    },
    selectedProjectIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Project',
      default: [],
    },
    selectedSkillIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Skill',
      default: [],
    },
    selectedExperienceIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Experience',
      default: [],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [300, 'Subject cannot be longer than 300 characters'],
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
      trim: true,
      maxlength: [12000, 'Body cannot be longer than 12000 characters'],
    },
    modelUsed: {
      type: String,
      trim: true,
      maxlength: [100, 'Model name cannot be longer than 100 characters'],
    },
  },
  { timestamps: true }
);

outreachDraftSchema.index({ contactId: 1, createdAt: -1 });
outreachDraftSchema.index({ companyId: 1, createdAt: -1 });

const OutreachDraft =
  mongoose.models.OutreachDraft ||
  mongoose.model<IOutreachDraft>('OutreachDraft', outreachDraftSchema);

export default OutreachDraft;
