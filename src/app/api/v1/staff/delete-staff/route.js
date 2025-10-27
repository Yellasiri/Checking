import { connectDB } from "@/app/api/lib/db";
import Staff from "@/app/api/models/Staff";


export async function DELETE(req) {
  await connectDB();
  try {
    const { id} = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "ID, required" }), { status: 400 });
    }
    const staff = await Staff.findByIdAndDelete(id);
    if (!staff) {
      return new Response(JSON.stringify({ error: "Staff not found" }), { status: 404 });
    }
    return new Response(JSON.stringify({ staff }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to delete staff" }), { status: 500 });
  }
}
      
    
  