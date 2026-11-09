import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { sendVerificationEmail } from "@/lib/verification";

// POST /api/auth/resend-verification — sends a fresh link to YOUR OWN account email (login required)
export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const r = await sendVerificationEmail(userId);
    if (r.already) return NextResponse.json({ ok: true, already: true });
    if (r.ok) return NextResponse.json({ ok: true, sent: r.sent, devLink: process.env.NODE_ENV !== "production" ? r.devLink : undefined, devCode: process.env.NODE_ENV !== "production" ? r.devCode : undefined });

    const errors = {
      cooldown: [429, `Please wait ${r.retryIn ?? 60} seconds before asking for another email.`],
      limit: [429, "Too many emails requested today. Please try again tomorrow."],
      not_configured: [503, "Email sending isn't set up on this server yet."],
      send_failed: [502, "We couldn't send the email right now. Please try again in a moment."],
      not_found: [404, "Account not found."],
    };
    const [status, error] = errors[r.code] ?? [500, "Something went wrong."];
    return NextResponse.json({ error }, { status });
  } catch (err) {
    console.error("[resend-verification]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
