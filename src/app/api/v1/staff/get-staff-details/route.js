import { connectDB } from "@/app/api/lib/db";
import Staff from "@/app/api/models/Staff";
import Order from "@/app/api/models/Orders";
import Customer from "@/app/api/models/Customer";



export async function GET(req) {
    await connectDB();
    try {
        const staffDetails=await Staff.find({})
            .populate({
        path: "orders",               
        model: "Order",             
        populate: {
          path: "customer",
          model: "Customer",
          select: "customerName"
        },
      })
        if(!staffDetails || staffDetails.length === 0){
            return new Response(JSON.stringify({ message: "No staff found" }), { status: 404 });
        }
        return new Response(JSON.stringify({staff:staffDetails}), { status: 200 });
    } catch (error) {
        console.error("Error fetching staff details:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch staff details" }), { status: 500 });
    }
}
