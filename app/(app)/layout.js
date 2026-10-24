import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic"; // always reads the session + database

// Shared shell for all logged-in pages
export default async function AppLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
