import { redirect } from "next/navigation";
import AppNav from "@/components/AppNav";
import { getCurrentUser } from "@/lib/session";
import Notification from "@/lib/models/Notification";

export const dynamic = "force-dynamic"; // always reads the session + database

// Shared shell for all logged-in pages: sidebar on desktop, bottom tab bar on phones
export default async function AppLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  let unread = 0;
  try {
    unread = await Notification.countDocuments({ user: user.id, read: false });
  } catch {
    /* the badge is optional */
  }

  return (
    <div className="flex min-h-screen">
      <AppNav user={user} unread={unread} />
      {/* bottom padding on phones so the tab bar never covers content */}
      <div className="min-w-0 flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</div>
    </div>
  );
}
