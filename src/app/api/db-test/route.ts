import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Check if the environment variable is loaded
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrlSnippet = process.env.DATABASE_URL 
      ? `${process.env.DATABASE_URL.substring(0, 15)}... (len: ${process.env.DATABASE_URL.length})` 
      : "MISSING";

    // 2. Try to query the database
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: "connected",
      message: "Successfully connected to Supabase!",
      hasDbUrl,
      dbUrlSnippet,
      userCount,
    });
  } catch (error: any) {
    console.error("Database connection test failed:", error);
    return NextResponse.json({
      status: "error",
      message: "Failed to connect to Supabase",
      errorName: error?.name || "UnknownError",
      errorMessage: error?.message || "No message available",
      errorStack: error?.stack || "No stack trace available",
      hasDbUrl: !!process.env.DATABASE_URL,
    }, { status: 500 });
  }
}
