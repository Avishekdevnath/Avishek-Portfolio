import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    // Test database connection
    await connectDB();
    
    return NextResponse.json(
      { 
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 