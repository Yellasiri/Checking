import { connectDB } from "@/app/api/lib/db"
import InventoryItem from "@/app/api/models/InventoryItem"
import mongoose from "mongoose"


export async function DELETE(req) {
  await connectDB();
  try {


   
    const{id}= await req.json()

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "Valid id is required" }), { status: 400 });
    }

    

    const deleted = await InventoryItem.findByIdAndDelete(id);
    if (!deleted) return new Response(JSON.stringify({ error: "Item not found" }), { status: 404 });
    return new Response(JSON.stringify({ id: deleted._id }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
