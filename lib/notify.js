import { connectDB } from "@/lib/db";
import Notification from "@/lib/models/Notification";

// Tells `recipient` that `actor` did something to their post. Never notifies you about your own actions.
// If the same person already has an UNREAD notification of the same kind for that post, it is refreshed
// instead of piling up (so 5 quick comments from one person show as one notification).
export async function notify({ recipient, actor, type, post, text = "" }) {
  if (!recipient || String(recipient) === String(actor)) return;
  try {
    await connectDB();
    await Notification.findOneAndUpdate(
      { user: recipient, actor, type, post, read: false },
      { $set: { text: text.slice(0, 200) } },
      { upsert: true }
    );
  } catch (err) {
    console.error("[notify]", err); // a failed notification must never break the comment/like itself
  }
}
