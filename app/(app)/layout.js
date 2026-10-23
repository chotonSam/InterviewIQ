import Sidebar from "@/components/Sidebar";

// Shared shell for all logged-in pages (dashboard, interview, and later: history, community, resources, profile)
export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
