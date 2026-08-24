import Link from "next/link";
import { ShieldX } from "lucide-react";

export const metadata = {
  title: "Access Denied — TruthDesk",
};

export default function AccessDeniedPage() {
  return (
    <div
      className="min-h-[80vh] flex justify-center items-center px-4"
      style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}
    >
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <ShieldX size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-6">
          You don&apos;t have permission to access this area. This section is only available to authorized staff members.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
            style={{ background: "linear-gradient(135deg, #0f172a, #334155)" }}
          >
            Go to Home
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl text-slate-700 text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Sign In with Different Account
          </Link>
        </div>
      </div>
    </div>
  );
}
