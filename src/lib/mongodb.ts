import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
  var mongoose: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering for serverless
      // Connection pooling optimizations
      maxPoolSize: 1, // Single connection for serverless
      minPoolSize: 0, // No minimum connections
      maxConnecting: 1,
      maxIdleTimeMS: 30000, // Close idle connections quickly
      // Timeout configurations
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000, // Faster server selection
      socketTimeoutMS: 45000,
      // Network optimizations
      family: 4,
      heartbeatFrequencyMS: 10000, // Less frequent heartbeats
      // Compression
      compressors: ['zlib' as const], // Enable compression
      zlibCompressionLevel: 6 as const, // Balanced compression
      // Read preferences
      readPreference: 'secondaryPreferred' as const, // Use secondary for reads when available
      // Error handling and retries
      directConnection: false, // Use replica set for better reliability
      retryWrites: true,
      retryReads: true
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Connection health check for serverless environments
export async function checkConnectionHealth() {
  try {
    const conn = await connectDB();
    if (conn.connection.readyState === 1) {
      return { healthy: true, state: 'connected' };
    } else {
      return { healthy: false, state: conn.connection.readyState };
    }
  } catch (error) {
    return { healthy: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Graceful shutdown
if (process.env.NODE_ENV !== 'development') {
  process.on('SIGINT', async () => {
    try {
      if (cached.conn) {
        await cached.conn.connection.close();
        console.log('MongoDB connection closed through app termination');
      }
      process.exit(0);
    } catch (err) {
      console.error('Error during MongoDB disconnection:', err);
      process.exit(1);
    }
  });
}

// For backward compatibility
export const connectToDatabase = connectDB;
export default connectDB;