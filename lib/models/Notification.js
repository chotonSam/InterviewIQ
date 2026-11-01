import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who receives it
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who did it
    type: { type: String, enum: ["comment", "like"], required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    text: { type: String, default: "", maxlength: 200 }, // comment snippet
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);
NotificationSchema.index({ user: 1, read: 1, updatedAt: -1 });
NotificationSchema.index({ post: 1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
