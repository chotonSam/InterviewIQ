import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "ai"], required: true },
    kind: { type: String, enum: ["text", "question", "feedback", "message"], default: "text" },
    text: { type: String, default: "", maxlength: 2000 },
    code: { type: String, default: "", maxlength: 800 },
    verdict: { type: String, default: "" }, // feedback only: correct | partial | incorrect
    ideal: { type: String, default: "", maxlength: 800 }, // feedback only: the ideal short answer
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ChatSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topic: { type: String, required: true, maxlength: 60 },
    level: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export default mongoose.models.ChatSession || mongoose.model("ChatSession", ChatSessionSchema);
