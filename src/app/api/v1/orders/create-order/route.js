import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/lib/db";
import Orders from "@/app/api/models/Orders";
import Customer from "@/app/api/models/Customer";
import Staff from "@/app/api/models/Staff";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    console.log("Create order body:", body);

    const required = [
      "sampleDesignImageUrl",
      "customerName",
      "phoneNumber",
      "garment",
      "deliveryDate",
      "staffAssigned",
      "totalPayment",
    ];
    for (const r of required) {
      if (!body[r]) {
        return NextResponse.json(
          { error: `${r} is required` },
          { status: 400 }
        );
      }
    }

    let customer = await Customer.findOne({
      customerName: body.customerName,
      mobileNumber: body.phoneNumber,
    });
    if (!customer) {
      customer = await Customer.create({
        customerName: body.customerName,
        mobileNumber: body.phoneNumber,
      });
    }

    const orderData = {
      customer: customer._id,
      garment: body.garment,
      deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
      specialInstructions: body.specialInstructions || "",
      measurements: Array.isArray(body.measurements) ? body.measurements : [],
      sampleImages: body.sampleDesignImageUrl || "",
      handwrittenImageUrl: body.handwrittenImageUrl || "",
      staffAssigned: body.staffAssigned,
      advancePayment: Number(body.advancePayment) || 0,
      totalPayment: Number(body.totalPayment) || 0,
      sendOrderSummaryWhatsapp: !!body.sendWhatsAppSummary,
      status: "pending",
    };

    const order = await Orders.create(orderData);

    customer.orders.push(order._id);
    await customer.save();

    if (order.staffAssigned) {
      const staff = await Staff.findById(order.staffAssigned);
      if (staff) {
        staff.orders.push(order._id);
        await staff.save();
      }
    }

    if (body.sendWhatsAppSummary) {
      const m = (label) =>
        body.measurements.find(
          (x) => x.label?.toLowerCase() === label.toLowerCase()
        )?.value || "-";

      const measurements = {
        bodyLength: m("Body Length"),
        shoulder: m("Shoulder"),
        chest: m("Chest"),
        bust: m("Bust"),
        waist: m("Waist"),
        dot: m("Dot"),
        armhole: m("Armhole"),
        sleeveLength: m("Sleeve Length"),
        sleeveLoose: m("Sleeve Loose"),
        frontNeck: m("Front Neck"),
        backNeck: m("Back Neck"),
        hipRound: m("Hip Round"),
        slits: m("Slits"),
      };

      const phone = body.phoneNumber.replace(/\D/g, "");
      const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;

      const payload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: "measurements_confirmation",
          language: { code: "en" },
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "image",
                  image: {
                    link: body.sampleDesignImageUrl,
                  },
                },
              ],
            },

            {
              type: "body",
              parameters: [
                { type: "text", text: body.customerName || "" },
                { type: "text", text: body.garment || "" },
                { type: "text", text: measurements.bodyLength || "" },
                { type: "text", text: measurements.shoulder || "" },
                { type: "text", text: measurements.chest || "" },
                { type: "text", text: measurements.bust || "" },
                { type: "text", text: measurements.waist || "" },
                { type: "text", text: measurements.dot || "" },
                { type: "text", text: measurements.armhole || "" },
                { type: "text", text: measurements.sleeveLength || "" },
                { type: "text", text: measurements.sleeveLoose || "" },
                { type: "text", text: measurements.frontNeck || "" },
                { type: "text", text: measurements.backNeck || "" },
                { type: "text", text: measurements.hipRound || "" },
                { type: "text", text: measurements.slits || "" },
              ],
            },
          ],
        },
      };

      console.log("Sending WhatsApp message to:", formattedPhone);
      console.log("Payload:", JSON.stringify(payload, null, 2));

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
    console.error("create order error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
