import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/app/api/lib/auth";

export async function POST() {
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}

export async function GET(req) {
  await clearAuthCookie();
  return NextResponse.redirect(new URL("/login", req.url));
}
