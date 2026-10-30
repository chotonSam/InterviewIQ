import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getSessionUserId } from "@/lib/session";
import { isValidAvatarUrl } from "@/lib/avatar";

// PATCH /api/profile  — any of { name, phone, image }. Only the fields you send are changed.
export async function PATCH(req) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const body = await req.json();
    const update = {};

    if ("name" in body) {
      const name = String(body.name ?? "").trim();
      if (!name || name.length > 80) return NextResponse.json({ error: "Name is required (max 80 characters)." }, { status: 400 });
      update.name = name;
    }

    if ("phone" in body) {
      const phone = String(body.phone ?? "").trim();
      if (phone.length > 30 || !/^[0-9+\-\s()]*$/.test(phone)) {
        return NextResponse.json({ error: "Phone can only contain digits, spaces, + - ( )." }, { status: 400 });
      }
      update.phone = phone;
    }

    if ("image" in body) {
      // "" removes the picture; otherwise it must be an image in our own Cloudinary account
      if (body.image !== "" && !isValidAvatarUrl(body.image)) {
        return NextResponse.json({ error: "Invalid image." }, { status: 400 });
      }
      update.image = body.image;
    }

    if (Object.keys(update).length === 0) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

    await connectDB();
    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select("name phone image");
    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

    return NextResponse.json({ name: user.name, phone: user.phone, image: user.image });
  } catch (err) {
    console.error("[update profile]", err);
    return NextResponse.json({ error: "Could not save your profile." }, { status: 500 });
  }
}
