import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema(
  {
    interview: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true, index: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 2000 },
    timeSpent: { type: Number, default: 0 },       // active seconds spent on this question
    timedOut: { type: Boolean, default: false },   // submitted automatically because time ran out
  },
  { timestamps: true }
);

export default mongoose.models.Answer || mongoose.model("Answer", AnswerSchema);
