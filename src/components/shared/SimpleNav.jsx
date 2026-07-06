import Link from "next/link";
import React from "react";
import AuthButtons from "./AuthButtons";

const SimpleNav = () => {
  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        <Link href="/" className="font-bold text-xl text-gray-900 tracking-tight">
          TruthDesk
        </Link>
        <div>
          <AuthButtons />
        </div>
      </div>
    </nav>
  );
};

export default SimpleNav;
