"use client";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import userAvatar from "@/assets/user.png";
import { User, Mail, Calendar, LogOut, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

export default function ProfilePage() {
  const { data: session, isPending, error } = authClient.useSession();
  const user = !error ? session?.user : null;

  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await authClient.signOut();
    window.location.href = "/";
  };

  if (isPending) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center gap-4">
        <ShieldCheck size={40} className="text-slate-300" />
        <h1 className="text-xl font-bold text-gray-800">Sign in to view your profile</h1>
        <p className="text-sm text-gray-500">You need to be signed in to access this page.</p>
        <Link
          href="/login"
          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #0f172a, #334155)" }}
        >
          Sign In
        </Link>
      </div>
    );
  }

  const joinedDate = user.createdAt
    ? format(new Date(user.createdAt), "MMMM dd, yyyy")
    : "—";

  return (
    <div
      className="min-h-[80vh] flex justify-center items-start px-4 py-12"
      style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div
            className="px-8 py-8 text-center"
            style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)" }}
          >
            <div className="relative w-20 h-20 mx-auto mb-4">
              <Image
                src={user.image || userAvatar}
                alt="Profile avatar"
                fill
                className="rounded-full object-cover ring-4 ring-white/20"
                sizes="80px"
                unoptimized
              />
            </div>
            <h1 className="text-xl font-black text-white">{user.name || "User"}</h1>
            <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-300 capitalize">
              {user.role || "member"}
            </span>
          </div>

          {/* Details */}
          <div className="px-8 py-6 space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <User size={15} className="text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Full Name</p>
                <p className="font-semibold">{user.name || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Mail size={15} className="text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Email</p>
                <p className="font-semibold">{user.email || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Calendar size={15} className="text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Member Since</p>
                <p className="font-semibold">{joinedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={15} className="text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Account Status</p>
                <p className="font-semibold text-emerald-600">Active</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-all disabled:opacity-60"
              >
                <LogOut size={15} />
                {signingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          <Link href="/" className="hover:text-slate-600 transition-colors">← Back to TruthDesk</Link>
        </p>
      </div>
    </div>
  );
}
