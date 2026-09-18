import React from "react";
import DashboardShell from "@/components/newsroom/DashboardShell";
import { getSession } from "@/lib/authorize";

export default async function EditorLayout({ children }) {
  const session = await getSession();

  return (
    <DashboardShell user={session?.user} role={session?.user?.role || "editor"}>
      {children}
    </DashboardShell>
  );
}
