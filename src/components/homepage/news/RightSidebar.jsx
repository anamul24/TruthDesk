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
