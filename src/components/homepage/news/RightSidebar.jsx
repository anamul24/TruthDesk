"use client";

import { authClient } from "@/lib/auth-client";
import React from "react";
import { FaGoogle } from "react-icons/fa";

const RightSidebar = () => {
  const { data: session, error } = authClient.useSession();
  const user = !error ? session?.user : null;

  const handleGoogleSignin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)" }}>
          <h2 className="font-bold text-sm text-white uppercase tracking-wider">
            {user ? "My Account" : "Sign In"}
          </h2>
        </div>

        <div className="p-4">
          {user ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xl font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
              </div>
              <button
                className="w-full mt-1 py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                onClick={async () => await authClient.signOut()}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 py-1">
              <p className="text-xs text-gray-500 mb-1">
                Sign in to save articles and access premium features.
              </p>
              <button
                className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-all shadow-sm hover:shadow"
                onClick={handleGoogleSignin}
              >
                <FaGoogle className="text-red-500" />
                Continue with Google
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)" }}>
          <h2 className="font-bold text-sm text-white uppercase tracking-wider">
            Trending Topics
          </h2>
        </div>
        <div className="p-4">
          <ul className="space-y-2.5">
            {["Climate Summit", "AI Governance", "World Cricket", "Streaming Wars", "Ancient Manuscripts"].map((topic, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-red-600 cursor-pointer transition-colors">
                <span className="text-xs font-bold text-gray-300 w-4 text-right">#{i + 1}</span>
                <span className="font-medium">{topic}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)" }}>
          <h2 className="font-bold text-sm text-white uppercase tracking-wider">
            Follow Us
          </h2>
        </div>
        <div className="p-4 grid grid-cols-2 gap-2">
          {[
            { name: "Facebook", color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
            { name: "Twitter", color: "text-sky-500 bg-sky-50 hover:bg-sky-100" },
            { name: "Instagram", color: "text-pink-500 bg-pink-50 hover:bg-pink-100" },
            { name: "YouTube", color: "text-red-600 bg-red-50 hover:bg-red-100" },
          ].map((s) => (
            <button key={s.name} className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${s.color}`}>
              {s.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
