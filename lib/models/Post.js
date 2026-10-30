import mongoose from "mongoose";

export const POST_TAGS = ["Experience", "Question", "Frontend", "Backend", "System Design", "HR / Behavioral", "Resources"];

const PostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    tag: { type: String, enum: POST_TAGS, default: "Experience" },
    // Counters kept in sync with the Like / Comment collections (cheap to list + paginate)
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
PostSchema.index({ createdAt: -1 });

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
