import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import LearningResource from "@/lib/models/LearningResource";
import Rating from "@/lib/models/Rating";
import { getSessionUserId } from "@/lib/session";

// POST /api/resources/:id/rate  { value: 1-5 }  → create or change your rating, returns the new average
export async function POST(req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid resource." }, { status: 400 });

  try {
    const { value } = await req.json();
    const stars = Number(value);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return NextResponse.json({ error: "Rating must be 1 to 5 stars." }, { status: 400 });
    }

    await connectDB();
    if (!(await LearningResource.exists({ _id: params.id }))) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 });
    }

    // Upsert; returns the previous rating (or null if this is the first time)
    const previous = await Rating.findOneAndUpdate(
      { resource: params.id, user: userId },
      { value: stars },
      { upsert: true, new: false }
    );

    const resource = await LearningResource.findByIdAndUpdate(
      params.id,
      { $inc: { ratingSum: stars - (previous?.value ?? 0), ratingCount: previous ? 0 : 1 } },
      { new: true }
    ).select("ratingSum ratingCount");

    return NextResponse.json({
      myRating: stars,
      ratingCount: resource.ratingCount,
      avg: resource.ratingCount ? Math.round((resource.ratingSum / resource.ratingCount) * 10) / 10 : null,
    });
  } catch (err) {
    console.error("[rate resource]", err);
    return NextResponse.json({ error: "Could not save your rating." }, { status: 500 });
  }
}
