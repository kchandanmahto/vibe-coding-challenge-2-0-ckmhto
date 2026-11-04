
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/server/database/mongodb";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: "Academy Desk database connected successfully",
      database: {
        status: "connected",
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "MongoDB connection error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error:
          process.env.NODE_ENV === "development" &&
            error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 503 },
    );
  }
}
