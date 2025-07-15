import mongoose, { Schema, Document, models } from 'mongoose';

export interface ITool extends Document {
  name: string;
  description?: string;
  link?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ToolSchema = new Schema<ITool>({
  name: { type: String, required: true },
  description: { type: String },
  link: { type: String },
  icon: { type: String },
}, {
  timestamps: true
});

export default models.Tool || mongoose.model<ITool>('Tool', ToolSchema); 