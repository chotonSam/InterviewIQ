import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema(
  {
    interview: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true, index: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 4000 },
  },
  { timestamps: true }
);

export default mongoose.models.Answer || mongoose.model("Answer", AnswerSchema);
