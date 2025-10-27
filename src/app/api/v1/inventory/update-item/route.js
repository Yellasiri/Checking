import { connectDB } from "@/app/api/lib/db";
import InventoryItem from "@/app/api/models/InventoryItem";
import mongoose from "mongoose";


export async function PUT(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { id } = body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "Valid id is required" }), { status: 400 });
    }

    const update = {};
    if (typeof body.name !== "undefined") update.name = body.name;
    if (typeof body.category !== "undefined") update.category = body.category;
    if (typeof body.qty !== "undefined") update.quantity = Number(body.qty);
    if (typeof body.reorder !== "undefined") update.reOrderLevel = Number(body.reorder);
    if (typeof body.units !== "undefined") update.units = body.units;
    if (typeof body.isActive !== "undefined") update.isActive = Boolean(body.isActive);

    const updated = await InventoryItem.findByIdAndUpdate(id, update, { new: true });
    if (!updated) {
      return new Response(JSON.stringify({ error: "Item not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ item: updated }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
