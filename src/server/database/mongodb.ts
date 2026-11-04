
import "server-only";

import dns from "node:dns";
import mongoose from "mongoose";

// Fix DNS resolution for MongoDB Atlas SRV records.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Read MongoDB connection string.
const MONGODB_URI: string = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

// Cache MongoDB connection during development.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache =
  global.mongooseCache ?? {
    conn: null,
    promise: null,
  };

if (process.env.NODE_ENV !== "production") {
  global.mongooseCache = cached;
}

// Connect to MongoDB.
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}
