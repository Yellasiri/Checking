// src/app/api/lib/db.js
import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "traditions-designer-boutique",
    });
    isConnected = true;
    console.log("MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
