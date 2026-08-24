"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import userAvatar from "@/assets/user.png";
import { authClient } from "@/lib/auth-client";
import { LayoutDashboard, User } from "lucide-react";

const NEWSROOM_ROLES = ["journalist", "editor", "admin"];

const AuthButtons = () => {
  const { data: session, isPending, error } = authClient.useSession();
  const user = !error ? session?.user : null;

  if (isPending) {
    return (
      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
    );
  }

  if (user) {
    const isNewsroomUser = NEWSROOM_ROLES.includes(user.role);
    const dashboardLink =
      user.role === "editor"
        ? "/editor"
        : user.role === "admin"
        ? "/admin"
        : "/journalist";

    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
            <Image
              src={user.image || userAvatar}
              alt="User avatar"
              fill
              className="rounded-full object-cover"
              sizes="32px"
              unoptimized
            />
          </div>
          <span className="text-xs sm:text-sm font-medium text-gray-700 hidden md:block max-w-[80px] truncate">
            {user.name}
          </span>
        </div>

        {isNewsroomUser ? (
          <Link
            href={dashboardLink}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white bg-slate-800 hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <LayoutDashboard size={13} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        ) : (
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white bg-slate-800 hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <User size={13} />
            <span className="hidden sm:inline">Profile</span>
          </Link>
        )}

        <button
          className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors whitespace-nowrap"
          onClick={async () => {
            await authClient.signOut();
            window.location.href = "/";
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <Link
      href={"/login"}
      className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 rounded-lg text-white transition-colors whitespace-nowrap"
      style={{ background: "linear-gradient(135deg, #0f172a, #334155)" }}
    >
      Sign In
    </Link>
  );
};

export default AuthButtons;
