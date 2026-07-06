"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const NavLink = ({ href, className, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-slate-100 text-slate-900"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      } ${className || ""}`}
    >
      {children}
    </Link>
  );
};

export default NavLink;
