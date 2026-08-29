"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2, MailCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function InviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("No invitation token provided in URL.");
    }
  }, [token]);

  const acceptInvitation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Welcome to the newsroom! You are now a ${data.role}`);
        // Redirect to appropriate dashboard
        router.push(`/${data.role}`);
        // Force refresh session
        window.location.href = `/${data.role}`;
      } else {
        setError(data.error || "Failed to accept invitation.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <MailCheck size={32} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Newsroom Invitation</h1>
          <p className="text-slate-500 mt-2">
            You've been invited to join the TruthDesk editorial team.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 text-left">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!session ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
              Please log in or sign up first to accept this invitation. 
              Make sure to use the email address the invitation was sent to.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/login?callbackUrl=/invite?token=${token}`}
                className="btn btn-outline border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                Log In
              </Link>
              <Link
                href={`/register?callbackUrl=/invite?token=${token}`}
                className="btn bg-slate-900 text-white hover:bg-slate-800"
              >
                Sign Up
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
              Logged in as <strong className="text-slate-900">{session.user.email}</strong>
            </p>
            
            <button
              onClick={acceptInvitation}
              disabled={loading || !!error || !token}
              className="w-full py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Accept Invitation"
              )}
            </button>
            
            <div className="pt-2">
              <button
                onClick={() => authClient.signOut()}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Log out and use a different account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    }>
      <InviteContent />
    </Suspense>
  );
}
