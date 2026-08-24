"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButtons from "./AuthButtons";
import { Menu, X } from "lucide-react";

// Client component that receives categories as prop
export default function CategoryNavClient({ categories }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      {/* Main Row */}
      <div className="container mx-auto px-4 flex items-center justify-between py-2 gap-2 min-h-[48px]">
        {/* Left nav links */}
        <ul className="flex items-center gap-3 sm:gap-4 text-sm font-semibold text-gray-700 shrink-0">
          <li>
            <Link href="/" className="hover:text-red-600 transition-colors">
              Home
            </Link>
          </li>
          <li className="hidden sm:block">
            <Link href="/about-us" className="hover:text-red-600 transition-colors">
              About
            </Link>
          </li>
          <li className="hidden sm:block">
            <Link href="/career" className="hover:text-red-600 transition-colors">
              Career
            </Link>
          </li>
        </ul>

        {/* Category links — scrollable on desktop, hidden on mobile */}
        <ul className="hidden md:flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap text-[10px] sm:text-xs font-bold text-gray-700 uppercase tracking-wide scrollbar-none flex-1 justify-center px-2">
          {categories.map((category) => (
            <li key={category.category_id} className="shrink-0">
              <Link
                href={`/category/${category.category_id}`}
                className="hover:text-red-600 transition-colors"
              >
                {category.category_name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: Auth + hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="shrink-0">
            <AuthButtons />
          </div>
          {/* Hamburger — shows on mobile */}
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 pt-2 shadow-lg">
          {/* Quick links */}
          <div className="flex gap-4 text-sm font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-3">
            <Link href="/about-us" className="hover:text-red-600 transition-colors">
              About
            </Link>
            <Link href="/career" className="hover:text-red-600 transition-colors">
              Career
            </Link>
          </div>
          {/* Categories grid */}
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <Link
                key={category.category_id}
                href={`/category/${category.category_id}`}
                className="text-xs font-bold text-gray-600 uppercase tracking-wide hover:text-red-600 transition-colors py-1.5 px-2 rounded hover:bg-gray-50"
              >
                {category.category_name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
