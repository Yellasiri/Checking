import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/lib/db";
import Orders from "@/app/api/models/Orders";
import Customer from "@/app/api/models/Customer";

export async function PATCH(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    const order = await Orders.findByIdAndUpdate(id, { status }, { new: true }).populate("customer");
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (status === "Completed") {
      const phone = order.customer?.mobileNumber?.replace(/\D/g, "");
      const formattedPhone = phone?.startsWith("91") ? phone : `91${phone}`;

      const customerName = order.customer?.customerName || "Valued Customer";
      const orderId = order._id.toString().slice(-6).toUpperCase(); // short ref
      const pendingAmount = Math.max(order.totalPayment - order.advancePayment, 0);
      const boutiqueName = process.env.BOUTIQUE_NAME || "Our Boutique";

      const payload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: "order_ready",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: customerName },
                { type: "text", text: orderId },
                { type: "text", text: pendingAmount.toString() },
                { type: "text", text: boutiqueName },
              ],
            },
            {
              type: "order_status",
              parameters: [
                {
                  type: "order_status",
                  order_status: {
                    reference_id: orderId,
                    order: {
                      status: "completed",
                      description: "Order is ready for pickup 🎉",
                    },
                  },
                },
              ],
            },
          ],
        },
      };

      console.log("Sending order_ready template:", JSON.stringify(payload, null, 2));

      const res = await fetch(process.env.WHATSAPP_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resultText = await res.text();
      console.log("WhatsApp API status:", res.status);
      console.log("WhatsApp API response:", resultText);
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("PATCH order error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
