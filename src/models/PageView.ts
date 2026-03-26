import mongoose, { Document } from 'mongoose';

export interface IPageView extends Document {
  path: string;
  referer?: string;
  country?: string;
  ip?: string;
  userAgent?: string;
  isBot: boolean;
  timestamp: Date;
}

const pageViewSchema = new mongoose.Schema({
  path:      { type: String, required: true },
  referer:   { type: String },
  country:   { type: String },
  ip:        { type: String },
  userAgent: { type: String, maxlength: 500 },
  isBot:     { type: Boolean, required: true },
  timestamp: { type: Date, required: true },
});

// TTL index — auto-delete after 90 days
pageViewSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });
pageViewSchema.index({ path: 1 });
pageViewSchema.index({ isBot: 1 });
pageViewSchema.index({ path: 1, timestamp: 1 });

const PageView = mongoose.models.PageView || mongoose.model<IPageView>('PageView', pageViewSchema);

export default PageView;
