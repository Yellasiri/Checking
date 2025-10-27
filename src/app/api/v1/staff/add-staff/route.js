import { connectDB } from "@/app/api/lib/db";
import Staff from "@/app/api/models/Staff";



export async function POST(req) {
  await connectDB();
  try {
    const { name, role, availability, phone } = await req.json();
    if (!name || !role) {
      return new Response(JSON.stringify({ error: "Name and role required" }), { status: 400 });
    }

    console.log("Adding staff:", { name, role, availability, phone });

    const staff = await Staff.create({ name, role, availability, phone  });
    return new Response(JSON.stringify({ staff }), { status: 201 });
  } catch (error) {
    console.error("Error adding staff:", error);
    return new Response(JSON.stringify({ error: "Failed to add staff" }), { status: 500 });
  }
}

export async function PUT(req) {
  await connectDB();
  try {
    const { id, name, role, availability,phone } = await req.json();
    if (!id || !name || !role) {
      return new Response(JSON.stringify({ error: "ID, name, and role required" }), { status: 400 });
    }
    const staff = await Staff.findByIdAndUpdate(
      id,
      { name, role, availability, phone },
      { new: true }
    );
    if (!staff) {
      return new Response(JSON.stringify({ error: "Staff not found" }), { status: 404 });
    }
    return new Response(JSON.stringify({ staff }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update staff" }), { status: 500 });
  }
}