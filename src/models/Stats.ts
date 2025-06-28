import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
  programmingLanguages: {
    value: { type: Number, default: 0 },
    description: { type: String, default: "Languages mastered in programming" }
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
statsSchema.pre('save', async function(next) {
  const Stats = this.constructor as mongoose.Model<any>;
  if (this.isNew) {
    const count = await Stats.countDocuments();
    if (count > 0) {
      const err = new Error('Only one stats document can exist');
      next(err);
    }
  }
  next();
});

const Stats = mongoose.models.Stats || mongoose.model('Stats', statsSchema);

export default Stats; 