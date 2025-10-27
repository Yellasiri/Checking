import { connectDB } from "@/app/api/lib/db";
import Customer from "@/app/api/models/Customer";
import Orders from "@/app/api/models/Orders";
import Staff from "@/app/api/models/Staff";

export async function GET(req) {
  await connectDB();
  try {
    const customers = await Customer.find({})
      .populate({
        path: "orders",               
        model: "Order",             
        populate: {
          path: "staffAssigned",
          model: "Staff",
          select: "name _id"
        },
      })
      .lean();

    return new Response(JSON.stringify({ customers }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
