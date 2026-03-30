import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ApplicationOutreachDraft extends Document {
  applicationId: Types.ObjectId;
  contactId: Types.ObjectId;
  emailSubject?: string;
  emailBody?: string;
  linkedinDm?: string;
  generatedAt: Date;
  modelUsed?: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationOutreachDraftSchema = new Schema<ApplicationOutreachDraft>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'JobApplication',
      required: true,
      index: true,
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: 'ApplicationContact',
      required: true,
      index: true,
    },
    emailSubject: { type: String, trim: true },
    emailBody: { type: String, trim: true },
    linkedinDm: { type: String, trim: true },
    generatedAt: { type: Date, required: true },
    modelUsed: { type: String, trim: true },
  },
  { timestamps: true }
);

// One draft per application+contact pair — regeneration overwrites
applicationOutreachDraftSchema.index({ applicationId: 1, contactId: 1 }, { unique: true });

const ApplicationOutreachDraftModel: Model<ApplicationOutreachDraft> =
  mongoose.models.ApplicationOutreachDraft ||
  mongoose.model<ApplicationOutreachDraft>('ApplicationOutreachDraft', applicationOutreachDraftSchema);

export default ApplicationOutreachDraftModel;
