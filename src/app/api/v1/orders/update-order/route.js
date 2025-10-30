import { NextResponse } from "next/server";
import Order from "@/app/api/models/Orders";
import { connectDB } from "@/app/api/lib/db";

export async function PATCH(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing order id" },
        { status: 400 }
      );
    }

    // Prevent updating MongoDB internal fields
    const forbidden = ["_id", "__v", "createdAt", "updatedAt"];
    forbidden.forEach((f) => delete updates[f]);

    // Convert deliveryDate to a Date object if it's a string
    if (updates.deliveryDate && typeof updates.deliveryDate === "string") {
      const parsed = new Date(updates.deliveryDate);
      if (!isNaN(parsed)) {
        updates.deliveryDate = parsed;
      }
    }

    // Perform the update
    const updatedOrder = await Order.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("customer")
      .populate("staffAssigned")
      .lean();

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, order: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error("update-order error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
