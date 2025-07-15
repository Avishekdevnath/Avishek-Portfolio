import mongoose, { Schema, Document, models } from 'mongoose';

export interface IAchievement extends Document {
  title: string;
  description?: string;
  date?: Date;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  icon: { type: String },
}, {
  timestamps: true
});

export default models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema); 