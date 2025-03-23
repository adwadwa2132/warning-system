import mongoose from 'mongoose';

// Check if we're in a build environment
const isBuildTime = process.env.NODE_ENV === 'development' && process.env.NETLIFY === 'true';

const MONGODB_URI = process.env.MONGODB_URI || '';

// Only throw error if not in build environment and MONGODB_URI is missing
if (!MONGODB_URI && !isBuildTime) {
  throw new Error(
    'Please define the MONGODB_URI environment variable'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // If we're in build environment and no URI, return mock connection
  if (isBuildTime && !MONGODB_URI) {
    console.log('Build environment detected, skipping DB connection');
    return { connection: { readyState: 1 } };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect; 