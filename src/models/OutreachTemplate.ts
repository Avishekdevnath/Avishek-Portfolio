import mongoose, { Document, Schema } from 'mongoose';

export type OutreachTemplateType = 'cold' | 'follow_up' | 'referral' | 'post_application';
export type OutreachTone = 'professional' | 'friendly';

export interface IOutreachTemplate extends Document {
  name: string;
  type: OutreachTemplateType;
  tone: OutreachTone;
  subjectTemplate: string;
  bodyTemplate: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

const outreachTemplateSchema = new Schema<IOutreachTemplate>(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      maxlength: [200, 'Template name cannot be longer than 200 characters'],
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: {
        values: ['cold', 'follow_up', 'referral', 'post_application'],
        message: 'Invalid template type',
      },
      index: true,
    },
    tone: {
      type: String,
      required: true,
      enum: {
        values: ['professional', 'friendly'],
        message: 'Invalid tone',
      },
      index: true,
    },
    subjectTemplate: {
      type: String,
      required: [true, 'Subject template is required'],
      trim: true,
      maxlength: [300, 'Subject template cannot be longer than 300 characters'],
    },
    bodyTemplate: {
      type: String,
      required: [true, 'Body template is required'],
      trim: true,
      maxlength: [8000, 'Body template cannot be longer than 8000 characters'],
    },
    variables: {
      type: [String],
      default: [],
      set: (vars: string[]) =>
        Array.isArray(vars)
          ? vars.map((v) => String(v).trim()).filter(Boolean)
          : [],
    },
  },
  { timestamps: true }
);

const OutreachTemplate =
  mongoose.models.OutreachTemplate ||
  mongoose.model<IOutreachTemplate>('OutreachTemplate', outreachTemplateSchema);

export default OutreachTemplate;

