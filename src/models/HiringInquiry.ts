import mongoose, { Schema, model, models, Document, Model } from 'mongoose';

export type HiringInquiryStatus = 'new' | 'reviewed' | 'contacted' | 'archived';

export interface IHiringInquiry extends Document {
  company?: string;
  email: string;
  role?: string;
  message: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: HiringInquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHiringInquiryModel extends Model<IHiringInquiry> {
  getStats: () => Promise<{ total: number; new: number; reviewed: number; contacted: number; archived: number }>;
}

const hiringInquirySchema = new Schema<IHiringInquiry>({
  company: {
    type: String,
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  role: {
    type: String,
    trim: true,
    maxlength: [200, 'Role cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'contacted', 'archived'],
    default: 'new',
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret._id = ret._id.toString();
      return ret;
    }
  }
});

hiringInquirySchema.statics.getStats = async function() {
  const [total, sNew, reviewed, contacted, archived] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ status: 'new' }),
    this.countDocuments({ status: 'reviewed' }),
    this.countDocuments({ status: 'contacted' }),
    this.countDocuments({ status: 'archived' }),
  ]);
  return { total, new: sNew, reviewed, contacted, archived };
};

const HiringInquiry = (models.HiringInquiry || model<IHiringInquiry, IHiringInquiryModel>('HiringInquiry', hiringInquirySchema)) as IHiringInquiryModel;

export default HiringInquiry;

