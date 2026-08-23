"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  FileText,
  BarChart3,
  Bell,
  User,
  Menu,
  X,
  ChevronDown,
  Newspaper,
  ClipboardCheck,
  Archive,
  Settings,
} from "lucide-react";
import userAvatar from "@/assets/user.png";

const JOURNALIST_NAV = [
  { label: "Dashboard", href: "/journalist", icon: LayoutDashboard },
  { label: "Write Story", href: "/journalist/write", icon: PenSquare },
  {
    label: "My Stories",
    icon: FileText,
    children: [
      { label: "All", href: "/journalist/articles" },
      { label: "Drafts", href: "/journalist/articles?status=DRAFT" },
      { label: "In Review", href: "/journalist/articles?status=SUBMITTED" },
      {
        label: "Revision Required",
        href: "/journalist/articles?status=REVISION_REQUESTED",
      },
      { label: "Published", href: "/journalist/articles?status=PUBLISHED" },
    ],
  },
  { label: "Performance", href: "/journalist/performance", icon: BarChart3 },
  { label: "Notifications", href: "/journalist/notifications", icon: Bell },
  { label: "Profile", href: "/journalist/profile", icon: User },
];

const EDITOR_NAV = [
  { label: "Dashboard", href: "/editor", icon: LayoutDashboard },
  { label: "Review Queue", href: "/editor/review", icon: ClipboardCheck },
  { label: "Published", href: "/editor/published", icon: Newspaper },
  { label: "Notifications", href: "/editor/notifications", icon: Bell },
  { label: "Profile", href: "/editor/profile", icon: User },
];

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: User },
  { label: "Articles", href: "/admin/articles", icon: FileText },
  { label: "Categories", href: "/admin/categories", icon: Archive },
  { label: "Profile", href: "/admin/profile", icon: Settings },
];

function getNavItems(role) {
  switch (role) {
    case "editor":
      return EDITOR_NAV;
    case "admin":
      return ADMIN_NAV;
    default:
      return JOURNALIST_NAV;
  }
}

export default function Sidebar({ user, role }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(["My Stories"]);
  const navItems = getNavItems(role);

  const toggleExpand = (label) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const isActive = (href) => {
    if (href.includes("?")) {
      return pathname + (typeof window !== "undefined" ? window.location.search : "") === href;
    }
    return pathname === href;
  };

  const roleLabel =
    role === "editor" ? "Editor" : role === "admin" ? "Admin" : "Journalist";

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950 text-white z-40 flex items-center justify-between px-4 shadow-md">
        <Link href="/" className="block">
          <h1 className="text-lg font-black tracking-tight text-white">
            TRUTH DESK
          </h1>
          <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 mt-0.5">
            {roleLabel} Panel
          </p>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-950 text-white z-40 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b border-slate-800">
          <Link href="/" className="block">
            <h1 className="text-xl font-black tracking-tight text-white">
              TRUTH DESK
            </h1>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mt-0.5">
              {roleLabel} Panel
            </p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              if (item.children) {
                const isExpanded = expandedItems.includes(item.label);
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={18} />
                        {item.label}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isExpanded && (
                      <ul className="ml-6 mt-1 space-y-0.5 border-l border-slate-800 pl-3">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setIsOpen(false)}
                              className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                                isActive(child.href)
                                  ? "text-white bg-slate-800 font-medium"
                                  : "text-slate-500 hover:text-white hover:bg-slate-800/40"
                              }`}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "text-white bg-gradient-to-r from-slate-800 to-slate-800/60 shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon size={18} className={active ? "text-blue-400" : ""} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex-shrink-0">
              <Image
                src={user?.image || userAvatar}
                alt={user?.name || "User"}
                fill
                className="rounded-full object-cover"
                sizes="36px"
                unoptimized
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate capitalize">
                {roleLabel}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
