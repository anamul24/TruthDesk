"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardShell({ children, user, role }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        user={user} 
        role={role} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <main className="flex-1 overflow-y-auto flex flex-col relative">
        <TopBar 
          user={user} 
          role={role} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        <div className="flex-1 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
