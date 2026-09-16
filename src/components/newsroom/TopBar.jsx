"use client";

import React from "react";
import { Search, Globe, Menu } from "lucide-react";
import Image from "next/image";
import userAvatar from "@/assets/user.png";
import NotificationDropdown from "./NotificationDropdown";

export default function TopBar({ user, role, onMenuClick }) {
  const roleLabel = role === "editor" ? "Editor" : role === "admin" ? "Admin" : "Journalist";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between glass-panel px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        {/* Global Search / Command Palette Trigger */}
        <button
          className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors min-w-[240px] border border-transparent hover:border-slate-300"
          onClick={() => {
            // Trigger command palette event
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
          }}
        >
          <Search size={16} />
          <span className="text-sm font-medium">Search...</span>
          <div className="ml-auto flex items-center gap-1 text-xs font-semibold text-slate-400 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">
            <span className="text-[10px]">⌘</span> K
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Language Toggle */}
        <button className="flex items-center gap-1.5 p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium">
          <Globe size={18} />
          <span className="hidden sm:inline">EN / BN</span>
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-1">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name || "User"}</p>
            <p className="text-xs text-slate-500 mt-1 capitalize">{roleLabel}</p>
          </div>
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200">
            <Image
              src={user?.image || userAvatar}
              alt={user?.name || "User"}
              fill
              className="object-cover"
              sizes="32px"
              unoptimized
            />
          </div>
        </div>
      </div>
    </header>
  );
}
