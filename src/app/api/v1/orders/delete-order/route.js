// src/app/api/v1/orders/delete-order/route.js
import { NextResponse } from "next/server";
import Order from "@/app/api/models/Orders";
import { connectDB } from "@/app/api/lib/db";


export async function DELETE(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id } = body || {};

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing order id" }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    await Order.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Order deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("delete-order error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
