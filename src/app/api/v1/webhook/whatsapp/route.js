import { connectDB } from "@/app/api/lib/db";
import Orders from "@/app/api/models/Orders";
import EditSession from "@/app/api/models/EditSession";
import Customer from "@/app/api/models/Customer";

export async function GET(req) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}


export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const message = data?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return new Response("No messages", { status: 200 });

    const phone = message.from;
    const type = message.type;
    const text = message?.button?.text || message?.text?.body?.trim() || "";

    // BUTTON HANDLER
    if (type === "button") {
      const upper = text.toUpperCase();

      // 1️⃣ Confirm from main message
      if (upper === "CONFIRM" || upper === "CONFIRM ORDER") {
        const order = await Orders.findOne().sort({ createdAt: -1 }).populate("customer");
        if (!order) return new Response("No order found", { status: 200 });
        order.status = "confirmed";
        await order.save();

        await sendText(phone, `🎉 Perfect, ${order.customerName || ""}! Your order has been confirmed with the updated measurements.`);
        return new Response("OK", { status: 200 });
      }

      // 2️⃣ Edit from main message
      if (upper === "EDIT" || upper === "EDIT ANOTHER") {
        const order = await Orders.findOne().sort({ createdAt: -1 }).populate("customer");
        if (!order) return new Response("No order found", { status: 200 });
        order.status = "awaiting_edit";
        await order.save();

        await sendTemplate(phone, "edit_measurement_selection_1");
        return new Response("OK", { status: 200 });
      }

      // 3️⃣ More / Back navigation
      if (text === "More") {
        await sendTemplate(phone, "edit_measurement_selection_2");
        return new Response("OK", { status: 200 });
      }
      if (text === "BACK") {
        await sendTemplate(phone, "edit_measurement_selection_1");
        return new Response("OK", { status: 200 });
      }

      if (text === "CANCEL") {
        await sendText(phone, "❌ Edit cancelled. No changes made.");
        await EditSession.deleteOne({ phone });
        return new Response("OK", { status: 200 });
      }

      const measurementLabels = [
        "Body Length","Shoulder","Chest","Bust","Waist","Dot","Armhole",
        "Sleeve Length","Sleeve Loose","Front Neck","Back Neck","Hip Round","Slits"
      ];
      if (measurementLabels.includes(text)) {
        const order = await Orders.findOne().sort({ createdAt: -1 });
        if (!order) return new Response("No order found", { status: 200 });

        await EditSession.findOneAndUpdate(
          { phone },
          { phone, orderId: order._id, measurementLabel: text },
          { upsert: true }
        );
        await sendText(phone, `✏️ Please enter your new *${text}* measurement in cm.`);
        return new Response("OK", { status: 200 });
      }
    }

    // TEXT HANDLER (user enters new value)
    if (type === "text") {
      const userText = message.text.body.trim();
      const session = await EditSession.findOne({ phone });
      if (!session) return new Response("No active session", { status: 200 });

      const order = await Orders.findById(session.orderId);
      if (!order) return new Response("No order found", { status: 200 });

      const label = session.measurementLabel;
      const newValue = userText;

      const m = order.measurements.find((x) => x.label === label);
      if (m) m.value = newValue;
      else order.measurements.push({ label, value: newValue });

      await order.save();
      await EditSession.deleteOne({ phone });

      await sendText(phone, `✅ ${label} updated to ${newValue} cm successfully!`);
      await sendTemplate(phone, "edit_next_action"); // ask what next
      return new Response("OK", { status: 200 });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(err.message, { status: 500 });
  }
}

// 🔹 Helper functions
async function sendText(to, body) {
  await fetch(process.env.WHATSAPP_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });
}

async function sendTemplate(to, name, lang = "en") {
  const res = await fetch(process.env.WHATSAPP_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name,
        language: { code: lang },
        components: [],
      },
    }),
  });

  const txt = await res.text();
  console.log(`Template ${name} →`, res.status, txt);
}
