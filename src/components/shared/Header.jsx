import React from "react";
import { format } from "date-fns";
import { playfair } from "@/app/layout";
import WeatherWidget from "./WeatherWidget";

const Header = () => {
  return (
    <header
      className="w-full shadow-sm"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1a1f3a 100%)" }}
    >
      <div className="container mx-auto flex flex-col items-center justify-center pt-6 pb-3 px-4 relative">
        <h1
          className={`${playfair.className} text-5xl md:text-6xl font-black tracking-tight text-white`}
          style={{ letterSpacing: "-2px" }}
        >
          TruthDesk
        </h1>

        <div className="w-full flex justify-between items-center mt-4 border-b border-t border-slate-700 py-2 text-xs font-medium text-slate-300 uppercase tracking-wide">
          <div className="flex items-center gap-3">
            <span>
              {new Intl.DateTimeFormat("en-US", {
                timeZone: "Asia/Dhaka",
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }).format(new Date())}
            </span>
            <span className="text-slate-500">|</span>
            <WeatherWidget />
          </div>
          <div className="hidden sm:block">
            <span className="hover:text-white cursor-pointer transition-colors">
              Today&apos;s Paper
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
