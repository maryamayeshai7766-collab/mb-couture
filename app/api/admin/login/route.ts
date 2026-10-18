import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createSignedToken,
} from "../../../../lib/security";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    if (typeof body.password === "string") password = body.password;
  } catch {
    return NextResponse.json({ error: "Enter your owner password." }, { status: 400 });
  }

  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword || !password) {
    return NextResponse.json({ error: "Invalid owner credentials." }, { status: 401 });
  }

  const providedHash = createHash("sha256").update(password).digest();
  const expectedHash = createHash("sha256").update(expectedPassword).digest();
  if (!timingSafeEqual(providedHash, expectedHash)) {
    return NextResponse.json({ error: "Invalid owner credentials." }, { status: 401 });
  }

  let token: string;
  try {
    token = createSignedToken("admin", "store-owner", 60 * 60 * 8);
  } catch {
    return NextResponse.json(
      { error: "Owner access is not configured." },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: 60 * 60 * 8,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
