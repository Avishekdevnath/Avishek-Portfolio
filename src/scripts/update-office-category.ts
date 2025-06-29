import { connectDB } from '../lib/mongodb';
import mongoose from 'mongoose';
import Skill from '../models/Skill';

async function updateOfficeCategory() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('Updating skills with Office category...');
    
    // Use the Skill model directly instead of the raw collection
    const result = await Skill.updateMany(
      { category: 'Office' },
      { $set: { category: 'Office & Productivity' } }
    );
    
    console.log(`Updated ${result.modifiedCount} skills from 'Office' to 'Office & Productivity'`);
    console.log('Update completed successfully');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error updating skills:', error);
    process.exit(1);
  }
}

updateOfficeCategory(); 