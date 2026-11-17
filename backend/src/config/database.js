import mongoose from "mongoose";
import { logger } from "./logger.js";

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    logger.error(
      "MONGODB_URI is missing from the environment configuration"
    );

    throw new Error("Database configuration is missing");
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error(
      {
        errorName: error.name,
        errorCode: error.code || "UNKNOWN",
      },
      "MongoDB connection failed"
    );

    throw error;
  }
}
