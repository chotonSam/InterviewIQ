import mongoose from "mongoose";

const InterviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
    score: { type: Number, default: null }, // average of all answer scores, set when completed
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Interview || mongoose.model("Interview", InterviewSchema);
