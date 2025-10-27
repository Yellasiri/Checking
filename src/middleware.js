// // src/middleware.js
// import { NextResponse } from "next/server";
// import { jwtVerify } from "jose";

// const PROTECTED_PREFIXES = [
//   "/dashboard",
//   "/orders",
//   "/inventory",
//   "/offer-management",
//   "/customers",
//   "/profile",
//   "/staff",
//   "/gallery",
// ];

// const AUTH_PAGES = ["/login"];
// const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// export default async function middleware(req) {
//   const { pathname } = req.nextUrl;

//   // Skip static & API
//   if (
//     pathname.startsWith("/_next") ||
//     pathname === "/favicon.ico" ||
//     pathname.startsWith("/api") ||
//     /\.[\w]+$/.test(pathname)
//   ) return NextResponse.next();

//   const token = req.cookies.get("token")?.value || "";

//   // Keep logged-in users away from /login
//   if (AUTH_PAGES.includes(pathname)) {
//     if (token) {
//       try {
//         await jwtVerify(token, secret);
//         return NextResponse.redirect(new URL("/dashboard", req.url));
//       } catch {}
//     }
//     return NextResponse.next();
//   }

//   // Protect app pages
//   const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
//   if (!isProtected) return NextResponse.next();

//   if (!token) {
//     const to = new URL("/login", req.url);
//     to.searchParams.set("from", pathname);
//     return NextResponse.redirect(to);
//   }

//   try {
//     await jwtVerify(token, secret); // valid token -> allow
//     return NextResponse.next();
//   } catch {
//     const res = NextResponse.redirect(new URL("/login", req.url));
//     res.cookies.delete("token");
//     return res;
//   }
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
// };

















import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Skip static & API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    /\.[\w]+$/.test(pathname)
  ) return NextResponse.next();

  // Public routes (allow without auth)
  const PUBLIC = ["/login"];
  const isPublic = PUBLIC.some(p => pathname === p || pathname.startsWith(p + "/"));
  if (isPublic) return NextResponse.next();

  // Everything else requires auth
  const token = req.cookies.get("token")?.value || "";
  if (!token) {
    const to = new URL("/login", req.url);
    to.searchParams.set("from", pathname);
    return NextResponse.redirect(to);
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
