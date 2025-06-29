import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
  iconSet?: string;
  description?: string;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      enum: {
        values: [
          'Frontend Development',
          'Backend Development',
          'AI & Machine Learning',
          'Graphics & Design',
          'Office & Productivity'
        ],
        message: 'Invalid skill category',
      },
    },
    proficiency: {
      type: Number,
      required: [true, 'Skill proficiency is required'],
      min: [0, 'Proficiency must be at least 0'],
      max: [5, 'Proficiency cannot exceed 5'],
    },
    icon: {
      type: String,
      trim: true,
    },
    iconSet: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
skillSchema.index({ category: 1 });
skillSchema.index({ order: 1 });
skillSchema.index({ featured: 1 });

export default mongoose.models.Skill || mongoose.model<ISkill>('Skill', skillSchema); 