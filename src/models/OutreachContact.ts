import mongoose, { Document, Schema } from 'mongoose';

export type OutreachContactStatus = 'new' | 'contacted' | 'replied' | 'closed';

export interface IOutreachContact extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  emailLower: string;
  roleTitle?: string;
  linkedinUrl?: string;
  status: OutreachContactStatus;
  lastContactedAt?: Date;
  notes?: string;
  starred: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const urlValidator = (value: string) => {
  if (!value) return true;
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const outreachContactSchema = new Schema<IOutreachContact>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'OutreachCompany',
      required: [true, 'Company is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      maxlength: [200, 'Contact name cannot be longer than 200 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      maxlength: [320, 'Email cannot be longer than 320 characters'],
    },
    emailLower: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    roleTitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Role title cannot be longer than 200 characters'],
    },
    linkedinUrl: {
      type: String,
      trim: true,
      validate: { validator: urlValidator, message: 'Invalid LinkedIn URL' },
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'contacted', 'replied', 'closed'],
        message: 'Invalid contact status',
      },
      default: 'new',
      index: true,
    },
    lastContactedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [4000, 'Notes cannot be longer than 4000 characters'],
    },
    starred: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

outreachContactSchema.pre('validate', function preValidate(next) {
  if (this.email) {
    this.emailLower = this.email.trim().toLowerCase();
  }
  next();
});

const OutreachContact =
  mongoose.models.OutreachContact ||
  mongoose.model<IOutreachContact>('OutreachContact', outreachContactSchema);

export default OutreachContact;

