import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  interview: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true, index: true },
  order: { type: Number, required: true },
  text: { type: String, required: true },
  code: { type: String, default: "" }, // optional short code snippet shown with the question
  kind: { type: String, default: "quick" }, // concept | output | bug | change | scenario | quick
  timeSpent: { type: Number, default: 0 },  // seconds actively spent so far (saved while you work, so the timer survives a refresh)
});

export default mongoose.models.Question || mongoose.model("Question", QuestionSchema);
