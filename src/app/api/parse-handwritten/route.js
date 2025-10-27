import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file -> base64 (so we can send to OpenAI Vision)
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Send to GPT-4o for OCR + parsing
   const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  response_format: { type: "json_object" }, // 🔑 Forces valid JSON
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `
You are a data extractor for tailoring orders. 
Look at the handwritten image and return ONLY valid JSON matching this schema:

{
  "customerName": string | null,
  "phone": string | null,
  "garment": string | null,
  "deliveryDate": string | null,
  "measurements": [ { "label": string, "value": string } ],
  "instructions": string | null,
  "totalPayment": number | null,
  "advancePayment": number | null,
  "staffName": string | null
}
          `,
        },
        { type: "image_url", image_url: { url: dataUrl } },
      ],
    },
  ],
});


    let parsed = null;
    try {
      parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
    } catch {
      parsed = null;
    }

    return NextResponse.json({ success: true, parsed });
  } catch (err) {
    console.error("parse-handwritten error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
