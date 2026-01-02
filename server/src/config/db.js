import mongoose from "mongoose";

export async function connectDB(uri) {
  if (!uri) {
    console.warn("MONGO_URI not provided, skipping database connection");
    return { connected: false };
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log("MongoDB connected");
    return { connected: true };
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    return { connected: false, error: err.message };
  }
}

export function dbState() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return mongoose.connection.readyState;
}
