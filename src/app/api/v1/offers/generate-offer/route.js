import { connectDB } from "@/app/api/lib/db";
import Offers from "@/app/api/models/Offers";
import Customer from "@/app/api/models/Customer";

export async function POST(req) {
  await connectDB();

  try {
    const { offerText, offerEndDate, selectedCustomers } = await req.json();

    if (
      !offerText ||
      !offerEndDate ||
      !selectedCustomers ||
      !Array.isArray(selectedCustomers) ||
      selectedCustomers.length === 0
    ) {
      return new Response(
        JSON.stringify({
          error: "Offer text, end date, and customers are required",
        }),
        { status: 400 }
      );
    }

    const {
      WHATSAPP_API_URL,
      WHATSAPP_ACCESS_TOKEN,
      WHATSAPP_PHONE_NUMBER_ID,
      BOUTIQUE_NAME,
    } = process.env;

    if (
      !WHATSAPP_API_URL ||
      !WHATSAPP_ACCESS_TOKEN ||
      !WHATSAPP_PHONE_NUMBER_ID
    ) {
      return new Response(
        JSON.stringify({
          error: "WhatsApp API environment variables missing",
        }),
        { status: 500 }
      );
    }

    // Fetch all selected customers
    const customers = await Customer.find({
      _id: { $in: selectedCustomers },
    }).lean();

    if (!customers || customers.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid customers found" }),
        { status: 404 }
      );
    }

    // Deduplicate by mobile number
    const uniqueMap = new Map();
    for (const c of customers) {
      const normalized = c.mobileNumber?.replace(/\D/g, "");
      if (normalized && !uniqueMap.has(normalized)) {
        uniqueMap.set(normalized, c);
      }
    }
    const uniqueCustomers = Array.from(uniqueMap.values());

    // Save offer in DB
    const offer = await Offers.create({
      body: offerText,
      sentCount: uniqueCustomers.length,
      sentTo: uniqueCustomers.map((c) => c._id),
      offerEndDate,
    });

    // WhatsApp sending function
    const sendWhatsAppMessage = async (customer) => {
      try {
        const name = customer.customerName || "Customer";
        const phone = customer.mobileNumber?.replace(/\D/g, "");
        if (!phone) return;

        const payload = {
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: "special_offer",
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: name },
                  { type: "text", text: offerText },
                  { type: "text", text: offerEndDate },
                  { type: "text", text: BOUTIQUE_NAME },
                ],
              },
            ],
          },
        };

        await fetch(`${WHATSAPP_API_URL}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error(`Failed to send to ${customer.mobileNumber}:`, err);
      }
    };

    // Send all messages concurrently
    await Promise.all(uniqueCustomers.map((c) => sendWhatsAppMessage(c)));

    return new Response(
      JSON.stringify({
        success: true,
        message: `Offer sent to ${uniqueCustomers.length} unique customer(s)`,
        id: offer._id,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Offer generation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
