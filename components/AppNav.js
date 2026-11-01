"use client";

import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import useUnread from "@/components/useUnread";

// Desktop sidebar + mobile bottom bar, sharing one live "unread notifications" count
export default function AppNav({ user, unread: initial }) {
  const unread = useUnread(initial);
  return (
    <>
      <Sidebar user={user} unread={unread} />
      <MobileNav user={user} unread={unread} />
    </>
  );
}
