// import { NextResponse } from "next/server";
// import { connectDB } from "@/app/api/lib/db";
// import Orders from "@/app/api/models/Orders";
// import Customers from "@/app/api/models/Customer"
// import Staff from "@/app/api/models/Staff";

// export async function GET() {
// 		await connectDB();
// 	try {
	
// 		// Fetch all orders, populate customer and staff details
// 		const orders = await Orders.find({})
// 			 .populate("customer", "customerName mobileNumber")
// 			 .populate("staffAssigned", "name role availability")
// 			 .sort({ createdAt: -1 })
// 		return NextResponse.json({ orders });
// 	} catch (err) {
// 		return NextResponse.json({ error: err.message }, { status: 500 });
// 	}
// }





import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/lib/db";
import Orders from "@/app/api/models/Orders";
import Customers from "@/app/api/models/Customer";
import Staff from "@/app/api/models/Staff";

// 🔥 Force dynamic rendering and disable ISR caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  await connectDB();

  try {
    // Fetch all orders with customer and staff info
    const orders = await Orders.find({})
      .populate("customer", "customerName mobileNumber")
      .populate("staffAssigned", "name role availability")
      .sort({ createdAt: -1 });

    // ✅ Disable all kinds of caching (Vercel + browser + PWA)
    return NextResponse.json(
      { orders },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}
