import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Protects logged-in pages. API routes check the session themselves.
export async function middleware(req) {
  const token = req.cookies.get("iq_session")?.value;
  let ok = false;

  if (token && process.env.AUTH_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      ok = true;
    } catch {}
  }

  if (!ok) return NextResponse.redirect(new URL("/auth", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/interview/:path*", "/community/:path*", "/resources/:path*", "/profile/:path*", "/chat/:path*", "/history/:path*"],
};
