import mongoose from "mongoose";
import { RESOURCE_TAGS } from "@/lib/resources";

const LearningResourceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 300, default: "" },
    url: { type: String, required: true, maxlength: 500 },
    type: { type: String, enum: ["video", "article"], required: true },
    youtubeId: { type: String, default: "" },
    thumbnail: { type: String, default: "" },  // custom upload (Cloudinary) or the article's own preview image
    thumbTried: { type: Boolean, default: false }, // article preview already looked up (so we don't keep retrying)
    tag: { type: String, enum: RESOURCE_TAGS, default: "General" },
    // Kept in sync with the Rating collection
    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
LearningResourceSchema.index({ createdAt: -1 });

export default mongoose.models.LearningResource || mongoose.model("LearningResource", LearningResourceSchema);
