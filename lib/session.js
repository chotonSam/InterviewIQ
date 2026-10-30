import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

export const COOKIE_NAME = "iq_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secretKey() {
  if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET is not set. Add it to .env.local");
  return new TextEncoder().encode(process.env.AUTH_SECRET);
}

export async function createSession(userId) {
  const token = await new SignJWT({ uid: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export async function getSessionUserId() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.uid ?? null;
  } catch {
    return null;
  }
}

// Returns { id, name, username, email } or null
export async function getCurrentUser() {
  const id = await getSessionUserId();
  if (!id) return null;
  await connectDB();
  const u = await User.findById(id).select("name username email image").lean();
  if (!u) return null;
  return { id: String(u._id), name: u.name, username: u.username, email: u.email, image: u.image ?? "" };
}
