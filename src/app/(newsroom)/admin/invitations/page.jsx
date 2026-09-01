"use client";

import React, { useState, useEffect } from "react";
import { MailCheck, Plus, Copy, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("journalist");
  const [generatedLink, setGeneratedLink] = useState(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  async function fetchInvitations() {
    try {
      const res = await fetch("/api/invitations");
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      toast.error("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setIsCreating(true);

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Invitation created successfully!");
        setEmail("");
        fetchInvitations();
        
        // In a real app we'd email this, but for now we'll show it
        const link = data.inviteLink;
        setGeneratedLink(link);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(link);
          toast.success("Invite link copied to clipboard!");
        }
      } else {
        toast.error(data.error || "Failed to create invitation");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 size={12} /> Accepted
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} /> Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Loader2 size={12} className="animate-spin" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Invitations</h1>
        <p className="text-slate-500 mt-1">
          Invite journalists and editors to join the newsroom.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <MailCheck size={20} />
              </div>
              <h2 className="font-semibold text-slate-900">New Invitation</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@truthdesk.com"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-300 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-300 focus:outline-none transition-all appearance-none"
                >
                  <option value="journalist">Journalist</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isCreating || !email}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors mt-2"
              >
                {isCreating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={18} />
                    Send Invite
                  </>
                )}
              </button>
            </form>

            {generatedLink && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <h3 className="text-sm font-semibold text-green-800 mb-2">Invitation Created!</h3>
                <p className="text-xs text-green-700 mb-2">Share this link with the user (it expires in 7 days):</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={generatedLink} 
                    className="flex-1 px-3 py-2 bg-white border border-green-200 rounded-lg text-sm text-gray-700 focus:outline-none"
                  />
                  <button 
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(generatedLink);
                        toast.success("Link copied!");
                      }
                    }}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    title="Copy Link"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invitations List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Recent Invitations</h2>
            </div>
            
            {loading ? (
              <div className="py-20 flex justify-center">
                <Loader2 size={24} className="animate-spin text-slate-300" />
              </div>
            ) : invitations.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {invitations.map((inv) => (
                  <div key={inv._id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-slate-900">{inv.email}</h3>
                        {getStatusBadge(inv.status)}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="capitalize">{inv.role}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>Sent {formatDistanceToNow(new Date(inv.createdAt))} ago</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {inv.status === "pending" && (
                        <button
                          onClick={() => {
                            const link = `${window.location.origin}/invite?token=${inv.tokenHash}`;
                            // Ideally the original token isn't just the hash, but for this demo this is what we have since we hashed it in the API. 
                            // Wait, we returned the raw token in the POST response. If they lose it, they can't get it back because it's hashed.
                            // We should probably just let them generate a new one. Let's just show a copy action for the email or an action to revoke.
                            toast.error("Can only copy link immediately after creation for security.");
                          }}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Copy Link (Disabled for security after creation)"
                        >
                          <Copy size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <MailCheck size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No invitations sent yet</p>
                <p className="text-sm text-slate-400 mt-1">Create one using the form.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
