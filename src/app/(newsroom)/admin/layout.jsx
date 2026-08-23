import React from "react";
import Sidebar from "@/components/newsroom/Sidebar";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";

export default async function AdminLayout({ children }) {
  const session = await requireRole([USER_ROLES.ADMIN]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar user={session?.user} role="admin" />
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
}
