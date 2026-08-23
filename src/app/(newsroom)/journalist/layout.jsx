import React from "react";
import Sidebar from "@/components/newsroom/Sidebar";
import { getSession } from "@/lib/authorize";

export default async function JournalistLayout({ children }) {
  const session = await getSession();
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar user={session?.user} role={session?.user?.role || "journalist"} />
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
