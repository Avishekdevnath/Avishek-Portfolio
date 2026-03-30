import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ApplicationNote extends Document {
  applicationId?: Types.ObjectId;
  bookmarkId?: Types.ObjectId;
  sourceType: 'application' | 'bookmark';
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationNoteSchema = new Schema<ApplicationNote>(
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
    body: {
      type: String,
      required: [true, 'Note body is required'],
      trim: true,
      maxlength: [10000, 'Note cannot exceed 10000 characters'],
    },
  },
  { timestamps: true }
);

applicationNoteSchema.index({ applicationId: 1, createdAt: -1 }, { sparse: true });
applicationNoteSchema.index({ bookmarkId: 1, createdAt: -1 }, { sparse: true });

const ApplicationNoteModel: Model<ApplicationNote> =
  mongoose.models.ApplicationNote ||
  mongoose.model<ApplicationNote>('ApplicationNote', applicationNoteSchema);

export default ApplicationNoteModel;
