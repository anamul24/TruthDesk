"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import userAvatar from "@/assets/user.png";
import { authClient } from "@/lib/auth-client";

const AuthButtons = () => {
  const { data: session, isPending, error } = authClient.useSession();
  const user = !error ? session?.user : null;

  if (isPending) {
    return <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />;
  }

  if (user) {
    const dashboardLink = user.role === "editor" ? "/editor" : user.role === "admin" ? "/admin" : "/journalist";
    
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src={user.image || userAvatar}
              alt="User avatar"
              fill
              className="rounded-full object-cover"
              sizes="32px"
              unoptimized
            />
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user.name}
          </span>
        </div>
        <Link 
          href={dashboardLink}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          Dashboard
        </Link>
        <button
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
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
      className="text-sm font-semibold px-4 py-1.5 rounded-lg text-white transition-colors"
      style={{ background: "linear-gradient(135deg, #0f172a, #334155)" }}
    >
      Sign In
    </Link>
  );
};

export default AuthButtons;
