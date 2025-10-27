import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/lib/db";
import UserModel from "@/app/api/models/DashboardUsers";

export async function GET(req) {
  try {
    await connectDB();
  
    const user = await UserModel.find({}).lean();

    if (!user)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ success: false, message: "Error fetching user", error: error.message }, { status: 500 });
  }
}
