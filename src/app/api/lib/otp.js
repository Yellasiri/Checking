// import { cookies } from "next/headers";
// import { SignJWT, jwtVerify } from "jose";

// const secret = new TextEncoder().encode(process.env.JWT_SECRET);
// const OTP_COOKIE = "otp_session";

// export function generateOtp() {
//   return String(Math.floor(100000 + Math.random() * 900000));
// }

// export async function setOtpSession({ phone, name, otp, ttlSeconds = 300 }) {
//   const token = await new SignJWT({ t: "otp", phone, name, otp })
//     .setProtectedHeader({ alg: "HS256" })
//     .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
//     .sign(secret);

//   cookies().set(OTP_COOKIE, token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     path: "/",
//     maxAge: ttlSeconds,
//   });
// }

// export async function getOtpSession() {
//   const token = cookies().get(OTP_COOKIE)?.value;
//   if (!token) return null;
//   try {
//     const { payload } = await jwtVerify(token, secret);
//     if (payload.t !== "otp") return null;
//     return payload; // { phone, name, otp }
//   } catch {
//     return null;
//   }
// }

// export function clearOtpSession() {
//   cookies().delete(OTP_COOKIE);
// }








// src/app/api/lib/otp.js
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const OTP_COOKIE = "otp_session";

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function setOtpSession({ phone, name, otp, ttlSeconds = 300 }) {
  const token = await new SignJWT({ t: "otp", phone, name, otp })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
    .sign(secret);

  const store = await cookies();
  store.set(OTP_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ttlSeconds,
  });
}

export async function getOtpSession() {
  const store = await cookies();
  const token = store.get(OTP_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.t !== "otp") return null;
    return payload; // { phone, name, otp }
  } catch {
    return null;
  }
}

export async function clearOtpSession() {
  const store = await cookies();
  store.delete(OTP_COOKIE);
}
