import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    answer: { type: mongoose.Schema.Types.ObjectId, ref: "Answer", required: true, unique: true },
    interview: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true, index: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    strengths: [String],
    improvements: [String],
    suggested: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
