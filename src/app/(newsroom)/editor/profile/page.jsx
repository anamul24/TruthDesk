"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Briefcase,
  Building2,
  FileText,
  Edit2,
  Check,
  X,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

export default function EditorProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    designation: "",
    department: "",
    bio: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        setProfile(u);
        setForm({
          name: u.name || "",
          designation: u.designation || "",
          department: u.department || "",
          bio: u.bio || "",
        });
      }
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        setProfile((prev) => ({ ...prev, ...form }));
        setEditing(false);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch {
      toast.error("Connection error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm({
      name: profile?.name || "",
      designation: profile?.designation || "",
      department: profile?.department || "",
      bio: profile?.bio || "",
    });
    setEditing(false);
  }

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "E";

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your personal information
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <Edit2 size={15} />
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
            >
              <X size={15} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Avatar Banner — Purple accent for editor */}
        <div className="bg-gradient-to-r from-indigo-950 to-slate-800 px-8 py-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-4 border-white/20 shadow-lg">
            {initials}
          </div>
          {editing ? (
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-4 block mx-auto text-center text-xl font-bold bg-transparent text-white border-b-2 border-white/40 focus:border-white outline-none w-full max-w-xs placeholder:text-slate-400"
              placeholder="Your full name"
            />
          ) : (
            <h2 className="text-xl font-bold text-white mt-4">
              {profile?.name || "Editor"}
            </h2>
          )}
          <p className="text-indigo-300 text-sm mt-1 capitalize">
            {profile?.role || "editor"}
          </p>
        </div>

        {/* Profile Fields */}
        <div className="p-6 md:p-8 space-y-1">
          <ProfileField
            icon={Mail}
            label="Email"
            value={profile?.email || "—"}
          />
          <EditableField
            icon={Briefcase}
            label="Designation"
            value={form.designation}
            displayValue={profile?.designation || "—"}
            editing={editing}
            placeholder="e.g. Senior Editor"
            onChange={(v) => setForm((f) => ({ ...f, designation: v }))}
          />
          <EditableField
            icon={Building2}
            label="Department"
            value={form.department}
            displayValue={profile?.department || "—"}
            editing={editing}
            placeholder="e.g. Editorial, Investigations"
            onChange={(v) => setForm((f) => ({ ...f, department: v }))}
          />

          {/* Bio */}
          <div className="py-3 border-b border-slate-50 last:border-0">
            <div className="flex items-start gap-3">
              <FileText size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">Bio</p>
                {editing ? (
                  <textarea
                    value={form.bio}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bio: e.target.value }))
                    }
                    rows={3}
                    placeholder="Write a short bio about yourself..."
                    className="w-full text-sm text-slate-900 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900">
                    {profile?.bio || (
                      <span className="text-slate-400 italic">No bio yet</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          Account Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-0.5">
            <p className="text-xs text-slate-500">Account Role</p>
            <p className="font-medium text-slate-900 capitalize">
              {profile?.role || "editor"}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-500">Email Verified</p>
            <p className="font-medium text-slate-900">
              {profile?.emailVerified ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <Check size={14} /> Verified
                </span>
              ) : (
                <span className="text-amber-600">Pending</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
      <Icon size={16} className="text-slate-400 flex-shrink-0" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function EditableField({ icon: Icon, label, value, displayValue, editing, placeholder, onChange }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
      <Icon size={16} className="text-slate-400 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        {editing ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full mt-0.5 text-sm text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        ) : (
          <p className="text-sm font-medium text-slate-900">
            {displayValue || <span className="text-slate-400 italic">Not set</span>}
          </p>
        )}
      </div>
    </div>
  );
}
