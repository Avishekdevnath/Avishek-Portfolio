import mongoose, { Document, Model } from 'mongoose';

interface IStatItem {
  value: number;
  description: string;
}

interface ICustomStat {
  title: string;
  value: number;
  description: string;
  icon: string;
}

export interface IStats extends Document {
  programmingLanguages: IStatItem;
  projectsCompleted: IStatItem;
  studentsCount: IStatItem;
  workExperience: IStatItem;
  customStats: ICustomStat[];
  tagline: string;
  createdAt: Date;
  updatedAt: Date;
}

const statsSchema = new mongoose.Schema({
  programmingLanguages: {
    value: { type: Number, default: 0 },
    description: { type: String, default: "Languages mastered in programming" }
  },
  projectsCompleted: {
    value: { type: Number, default: 0 },
    description: { type: String, default: "Projects successfully completed" }
  },
  studentsCount: {
    value: { type: Number, default: 0 },
    description: { type: String, default: "Students mentored and guided" }
  },
  workExperience: {
    value: { type: Number, default: 0 },
    description: { type: String, default: "Years of professional experience" }
  },
  customStats: [{
    title: String,
    value: Number,
    description: String,
    icon: { type: String, default: 'FaCode' }
  }],
  tagline: { type: String, default: "Passionate about creating impactful solutions and sharing knowledge" }
}, {
  timestamps: true
});

// Ensure only one stats document exists
statsSchema.pre('save', async function(this: IStats) {
  const Stats = this.constructor as Model<IStats>;
  if (this.isNew) {
    const count = await Stats.countDocuments();
    if (count > 0) {
      throw new Error('Only one stats document can exist');
    }
  }
});

const Stats = mongoose.models.Stats || mongoose.model<IStats>('Stats', statsSchema);

export default Stats;