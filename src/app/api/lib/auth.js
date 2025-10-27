// import { cookies } from "next/headers";
// import { SignJWT, jwtVerify } from "jose";

// const TOKEN_NAME = "token";
// const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// export async function signJwt(payload, opts = {}) {
//   const expSeconds = typeof opts.expiresIn === "number"
//     ? Math.floor(Date.now() / 1000) + opts.expiresIn
//     : Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days

//   return await new SignJWT(payload)
//     .setProtectedHeader({ alg: "HS256" })
//     .setExpirationTime(expSeconds)
//     .sign(secret);
// }

// export async function verifyJwt(token) {
//   const { payload } = await jwtVerify(token, secret);
//   return payload;
// }

// export function setAuthCookie(token, maxAgeSeconds = 60 * 60 * 24 * 7) {
//   cookies().set(TOKEN_NAME, token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     path: "/",
//     maxAge: maxAgeSeconds,
//   });
// }

// export function clearAuthCookie() {
//   cookies().delete(TOKEN_NAME);
// }

// export function getTokenFromCookies() {
//   return cookies().get(TOKEN_NAME)?.value || null;
// }







import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const TOKEN_NAME = "token";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// 30 days by default
export async function signJwt(payload, { expiresInSeconds = 60 * 60 * 24 * 30 } = {}) {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(exp)
    .sign(secret);
}

export async function verifyJwt(token) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export async function setAuthCookie(token, maxAgeSeconds = 60 * 60 * 24 * 30) {
  const store = await cookies();
  store.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(TOKEN_NAME);
}

export async function getTokenFromCookies() {
  const store = await cookies();
  return store.get(TOKEN_NAME)?.value || null;
}
