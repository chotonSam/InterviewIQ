import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    resource: { type: mongoose.Schema.Types.ObjectId, ref: "LearningResource", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);
// One rating per user per resource (changing it updates the same document)
RatingSchema.index({ resource: 1, user: 1 }, { unique: true });

export default mongoose.models.Rating || mongoose.model("Rating", RatingSchema);
