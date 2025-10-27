import { connectDB } from "@/app/api/lib/db";
import InventoryItem from "@/app/api/models/InventoryItem";

export async function POST(req) {
  await connectDB();
  try {
    const body = await req.json();
    const { name, category, qty, units, reorder, isActive = true } = body;
    console.log("Adding inventory item:", body);
    if (!name || !category) {
      return new Response(
        JSON.stringify({ error: "Name and category required" }),
        { status: 400 }
      );
    }
    // Map frontend fields to schema fields
    const item = await InventoryItem.create({
      name,
      category,
      quantity: Number(qty),
      units,
      reOrderLevel: Number(reorder),
      isActive,
    });
    return new Response(JSON.stringify({ id: item._id, item }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
