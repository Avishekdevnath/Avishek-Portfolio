import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Settings, { ISettings } from '@/models/Settings';

export async function GET() {
  try {
    await connectDB();
    
    // For now, we'll just get the first user's settings
    // In a real app, you'd get the current user's ID from the session
    const settings = await Settings.findOne();
    
    if (!settings) {
      return NextResponse.json({
        success: false,
        message: 'Settings not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch settings'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // For now, we'll just update the first user's settings
    // In a real app, you'd get the current user's ID from the session
    const settings = await Settings.findOne();
    
    if (!settings) {
      // Create new settings if none exist
      const newSettings = await Settings.create({
        userId: 'default', // Replace with actual user ID in production
        ...body
      });
      
      return NextResponse.json({
        success: true,
        data: newSettings
      });
    }

    // Update existing settings
    const updatedSettings = await Settings.findOneAndUpdate(
      { _id: settings._id },
      { $set: body },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedSettings
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to update settings'
    }, { status: 500 });
  }
} 