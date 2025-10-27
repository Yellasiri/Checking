// import { NextResponse } from "next/server";
// import { connectDB } from "@/app/api/lib/db";
// import OtpModel from "@/app/api/models/OtpModel";
// import UserModel from "@/app/api/models/DashboardUsers";
// import { cookies } from "next/headers";
// import jwt from "jsonwebtoken"

// const SECRET = process.env.JWT_SECRET;
// export async function POST(req) {
//   await connectDB();

//   try {
//     const { phone_number, otp } = await req.json();
//     if (!phone_number || !otp)
//       return NextResponse.json({ message: "Phone number and OTP are required" }, { status: 400 });

//     const otpEntry = await OtpModel.findOne({ phone_number }).lean();
//     if (!otpEntry || otpEntry.otp !== Number(otp))
//       return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });

//     let user = await UserModel.findOne({ phone_number });
//     if (!user) {
//       user = await UserModel.create({ name: otpEntry.name, phone_number, last_login: new Date() });
//     } else {
//       user.last_login = new Date();
//       await user.save();
//     }

//     await OtpModel.deleteMany({ phone_number });
// const token = jwt.sign(
//   {
//     phone: phone_number,
//     name: user.name,
//   },
//   SECRET,
//   { expiresIn: "7d" }
// )
// const cookieStore = await cookies();
// cookieStore.set("token", token, {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: "lax",
//   maxAge: 60 * 60 * 24 * 7,
//   path: "/",
// });

// cookieStore.set("user_name", user.name, {
//   httpOnly: false,
//   sameSite: "lax",
//   maxAge: 60 * 60 * 24 * 365,
//   path: "/",
// });
//     cookieStore.set("authenticated", "true", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 60 * 60 * 24 * 7,
//       path: "/",
//     });

//     cookieStore.set("user_phone", phone_number, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 60 * 60 * 24 * 365,
//       path: "/",
//     });

   

//     return NextResponse.json({ message: "OTP verified successfully", verified: true, user });
//   } catch (error) {
//     return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
//   }
// }












import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/lib/db";
import OtpModel from "@/app/api/models/OtpModel";
import { signJwt, setAuthCookie } from "@/app/api/lib/auth";

export async function POST(req) {
  await connectDB();

  try {
    const { phone_number, otp } = await req.json();
    const cleanPhone = String(phone_number || "").replace(/\D/g, "");
    const cleanOtp = String(otp || "").trim();

    if (!/^\d{10}$/.test(cleanPhone) || !/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });
    }

    // Find valid (not used, not expired) OTP
    const now = new Date();
    const entry = await OtpModel.findOne({
      phone_number: cleanPhone,
      used: false,
      expiresAt: { $gt: now },
    });

    // TEMP debug (remove after testing)
    // console.log("DBG entry:", entry);

    if (!entry) {
      return NextResponse.json(
        { ok: false, message: "OTP expired or not found. Please request a new one." },
        { status: 401 }
      );
    }

    if (entry.otp !== cleanOtp) {
      return NextResponse.json({ ok: false, message: "Invalid OTP" }, { status: 401 });
    }

    // Mark used (prevent replay)
    entry.used = true;
    await entry.save();

    // Issue long-lived admin token (30 days) and set httpOnly cookie
    const token = await signJwt({
      sub: `user:${cleanPhone}`,
      phone: cleanPhone,
      name: entry.name,
      role: "admin",
    });

    await setAuthCookie(token);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("VerifyOtp error:", err);
    return NextResponse.json({ ok: false, message: "Internal error" }, { status: 500 });
  }
}
