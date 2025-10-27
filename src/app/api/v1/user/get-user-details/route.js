
import { connectDB } from "@/app/api/lib/db";
import Users from "@/app/api/models/Users";

export async function GET(req) {
  await connectDB();

  try {
    
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    console.log("GET /api/user/get-user-details id:", id);

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing id query parameter" }), {
        status: 400,
      });
    }

    // findById - use .lean() for a plain JS object
    const userDetails = await Users.findById(id).lean();

    if (!userDetails) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    

    return new Response(JSON.stringify({ user: userDetails }), { status: 200 });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch user details", details: error.message }),
      { status: 500 }
    );
  }
}
