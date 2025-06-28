import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  level: string;
  category: string;
  type: 'programming' | 'software' | 'language';
  subCategory?: string;
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
    level: {
      type: String,
      required: [true, 'Skill level is required'],
      enum: {
        values: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert', 'Proficient', 'Native', 'Explored'],
        message: 'Invalid skill level',
      },
    },
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      enum: {
        values: [
          'Core Languages',
          'Front End',
          'Back End',
          'Frameworks',
          'Tools',
          'Graphic Design',
          'Video Editing',
          'Office',
          'Language',
        ],
        message: 'Invalid skill category',
      },
    },
    type: {
      type: String,
      required: [true, 'Skill type is required'],
      enum: {
        values: ['programming', 'software', 'language'],
        message: 'Invalid skill type',
      },
    },
    subCategory: {
      type: String,
      trim: true,
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
skillSchema.index({ category: 1, type: 1 });
skillSchema.index({ order: 1 });

export default mongoose.models.Skill || mongoose.model<ISkill>('Skill', skillSchema); 