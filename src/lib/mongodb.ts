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
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
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
      bufferCommands: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
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