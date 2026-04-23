import mongoose from "mongoose";

let connectionPromise = null;

mongoose.set("bufferCommands", false);

export const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
  }

  try {
    await connectionPromise;
    return mongoose.connection;
  } catch (err) {
    connectionPromise = null;
    throw err;
  }
};

export const requireDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(503).json({
      message: "Database connection failed. Check MONGO_URI and MongoDB Atlas network access."
    });
  }
};
