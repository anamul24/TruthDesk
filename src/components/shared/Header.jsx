import React from "react";
import { format } from "date-fns";
import { playfair } from "@/app/layout";

const Header = () => {
  return (
    <header className="w-full shadow-sm" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1a1f3a 100%)" }}>
      <div className="container mx-auto flex flex-col items-center justify-center pt-10 pb-4 px-4 relative">
        <h1
          className={`${playfair.className} text-6xl md:text-8xl font-black tracking-tight text-white`}
          style={{ letterSpacing: "-2px" }}
        >
          TruthDesk
        </h1>
        
        <div className="w-full flex justify-between items-center mt-6 border-b border-t border-slate-700 py-2 text-xs font-medium text-slate-300 uppercase tracking-wide">
          <div className="flex items-center gap-4">
            <span>{format(new Date(), "EEEE, MMMM dd, yyyy")}</span>
            <span className="text-slate-500">|</span>
            <span>☀️ 28°C Dhaka</span>
          </div>
          <div className="hidden sm:block">
            <span className="hover:text-white cursor-pointer transition-colors">Today's Paper</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
