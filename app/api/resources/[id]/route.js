import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import LearningResource from "@/lib/models/LearningResource";
import Rating from "@/lib/models/Rating";
import { getSessionUserId } from "@/lib/session";

// DELETE /api/resources/:id → only the person who added it can remove it
export async function DELETE(_req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid resource." }, { status: 400 });

  try {
    await connectDB();
    const deleted = await LearningResource.findOneAndDelete({ _id: params.id, user: userId });
    if (!deleted) return NextResponse.json({ error: "Resource not found, or it isn't yours." }, { status: 404 });
    await Rating.deleteMany({ resource: params.id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[delete resource]", err);
    return NextResponse.json({ error: "Could not delete the resource." }, { status: 500 });
  }
}
