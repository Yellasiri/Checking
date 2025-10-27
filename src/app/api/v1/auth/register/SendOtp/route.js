// import { NextResponse } from "next/server";
// import { connectDB } from "@/app/api/lib/db";
// import OtpModel from "@/app/api/models/OtpModel";

// const WHATSAPP_API_URL = `https://graph.facebook.com/v24.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
// const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
// const LOGIN_NUMBER = process.env.LOGIN_NUMBER;

// function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000);
// }

// export async function POST(req) {
//   await connectDB();

//   try {
//     const { phone_number, name } = await req.json();

//     if (!phone_number || phone_number.length !== 10)
//       return NextResponse.json({ message: "Invalid phone number" }, { status: 400 });

//     if (phone_number !== LOGIN_NUMBER)
//       return NextResponse.json({ message: "Unauthorized number" }, { status: 403 });

//     const otp = generateOTP().toString();

//     const payload = {
//       messaging_product: "whatsapp",
//       recipient_type: "individual",
//       to: `91${phone_number}`,
//       type: "template",
//       template: {
//         name: "boutique_auth",
//         language: { code: "en" },
//         components: [
//           {
//             type: "body",
//             parameters: [{ type: "text", text: otp }]
//           },
//           {
//             type: "button",
//             sub_type: "url",
//             index: "0",
//             parameters: [{ type: "text", text: otp }]
//           }
//         ]
//       }
//     };

//     const response = await fetch(WHATSAPP_API_URL, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(payload)
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("WhatsApp API Error:", data);
//       return NextResponse.json({ message: "Failed to send OTP", error: data }, { status: 500 });
//     }

//     const otpEntry = new OtpModel({ phone_number, otp, name });
//     await otpEntry.save();

//     return NextResponse.json({ message: "OTP sent successfully", otp });
//   } catch (error) {
//     console.error("Internal Error:", error);
//     return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
//   }
// }







import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/lib/db";
import OtpModel from "@/app/api/models/OtpModel";

const WHATSAPP_API_URL = `https://graph.facebook.com/v24.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const LOGIN_NUMBER = (process.env.LOGIN_NUMBER || "").replace(/\D/g, ""); // digits only

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
  await connectDB();

  try {
    const { phone_number, name } = await req.json();
    const cleanPhone = String(phone_number || "").replace(/\D/g, ""); // keep digits
    const cleanName = String(name || "").trim();

    if (!/^\d{10}$/.test(cleanPhone))
      return NextResponse.json({ message: "Invalid phone number" }, { status: 400 });

    if (!cleanName)
      return NextResponse.json({ message: "Name required" }, { status: 400 });

    if (cleanPhone !== LOGIN_NUMBER)
      return NextResponse.json({ message: "Unauthorized number" }, { status: 403 });

    const otp = generateOTP();

    // Send via WhatsApp template
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: `91${cleanPhone}`,
      type: "template",
      template: {
        name: "boutique_auth",
        language: { code: "en" },
        components: [
          { type: "body", parameters: [{ type: "text", text: otp }] },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: otp }],
          },
        ],
      },
    };

    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("WhatsApp API Error:", data);
      return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
    }

    // Upsert the OTP for this phone — expires in 5 mins
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await OtpModel.findOneAndUpdate(
      { phone_number: cleanPhone, used: false },
      { phone_number: cleanPhone, name: cleanName, otp, used: false, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
