import mongoose, { Document, Schema } from 'mongoose';

export type OutreachEmailStatus = 'sent' | 'replied' | 'no_response' | 'closed';
export type OutreachReplyOutcome = 'positive' | 'neutral' | 'rejection';

export interface IOutreachEmail extends Document {
  contactId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  templateId?: mongoose.Types.ObjectId;
  subject: string;
  body: string;
  status: OutreachEmailStatus;
  sentAt: Date;
  followUpDate?: Date;
  followUpCount: number;
  replyReceivedAt?: Date;
  outcome?: OutreachReplyOutcome;
  replyNote?: string;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const outreachEmailSchema = new Schema<IOutreachEmail>(
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
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'OutreachTemplate',
      index: true,
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
    status: {
      type: String,
      enum: {
        values: ['sent', 'replied', 'no_response', 'closed'],
        message: 'Invalid outreach status',
      },
      default: 'sent',
      index: true,
    },
    sentAt: {
      type: Date,
      required: [true, 'sentAt is required'],
      index: true,
    },
    followUpDate: {
      type: Date,
      index: true,
    },
    followUpCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 2,
    },
    replyReceivedAt: {
      type: Date,
    },
    outcome: {
      type: String,
      enum: {
        values: ['positive', 'neutral', 'rejection'],
        message: 'Invalid reply outcome',
      },
    },
    replyNote: {
      type: String,
      trim: true,
      maxlength: [2000, 'Reply note cannot be longer than 2000 characters'],
    },
    closedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

outreachEmailSchema.index({ followUpDate: 1, status: 1 });

const OutreachEmail =
  mongoose.models.OutreachEmail ||
  mongoose.model<IOutreachEmail>('OutreachEmail', outreachEmailSchema);

export default OutreachEmail;

