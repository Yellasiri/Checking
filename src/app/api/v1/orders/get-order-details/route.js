import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/lib/db";
import Orders from "@/app/api/models/Orders";
import Customers from "@/app/api/models/Customer"
import Staff from "@/app/api/models/Staff";

export async function GET() {
		await connectDB();
	try {
	
		// Fetch all orders, populate customer and staff details
		const orders = await Orders.find({})
			 .populate("customer", "customerName mobileNumber")
			 .populate("staffAssigned", "name role availability")
			 .sort({ createdAt: -1 })
		return NextResponse.json({ orders });
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
