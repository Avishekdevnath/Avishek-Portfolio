import { connectDB } from '../lib/mongodb';
import mongoose from 'mongoose';
import Skill from '../models/Skill';

async function updateOfficeCategory() {
  try {
    await connectDB();
    
    
    // Use the Skill model directly instead of the raw collection
    const result = await Skill.updateMany(
      { category: 'Office' },
      { $set: { category: 'Office & Productivity' } }
    );
    
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error updating skills:', error);
    process.exit(1);
  }
}

updateOfficeCategory(); 