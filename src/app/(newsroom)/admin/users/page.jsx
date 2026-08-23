"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Loader2,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Mail,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const ROLES = ["journalist", "editor", "admin"];

const ROLE_COLORS = {
  admin: "bg-red-100 text-red-700 border-red-200",
  editor: "bg-indigo-100 text-indigo-700 border-indigo-200",
  journalist: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [filterRole, setFilterRole] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users?limit=200");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        toast.error("Failed to load users");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleRoleChange(userId, newRole) {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setRole", role: newRole }),
      });

      if (res.ok) {
        toast.success(`Role updated to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update role");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleBanToggle(user) {
    const action = user.banned ? "unbanUser" : "banUser";
    setUpdatingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        toast.success(user.banned ? "User unbanned" : "User banned");
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, banned: !u.banned } : u
          )
        );
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update user");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {users.length} registered users
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
        >
          <option value="">All Roles</option>
          <option value="journalist">Journalists</option>
          <option value="editor">Editors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-slate-400" />
            <span className="ml-3 text-slate-500 text-sm">Loading users...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden sm:table-cell">
                    Joined
                  </th>
                  <th className="text-left px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => {
                  const initials = u.name
                    ? u.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "U";
                  const isUpdating = updatingId === u.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              {u.name || "—"}
                            </p>
                            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                              <Mail size={11} />
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${
                            ROLE_COLORS[u.role] || ROLE_COLORS.journalist
                          }`}
                        >
                          {u.role || "journalist"}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <Calendar size={11} />
                          {u.createdAt
                            ? formatDistanceToNow(new Date(u.createdAt)) + " ago"
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            u.banned
                              ? "bg-red-50 text-red-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {u.banned ? (
                            <ShieldAlert size={11} />
                          ) : (
                            <ShieldCheck size={11} />
                          )}
                          {u.banned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Role Dropdown */}
                          <div className="relative">
                            <select
                              value={u.role || "journalist"}
                              onChange={(e) =>
                                handleRoleChange(u.id, e.target.value)
                              }
                              disabled={isUpdating}
                              className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {r.charAt(0).toUpperCase() + r.slice(1)}
                                </option>
                              ))}
                            </select>
                            {isUpdating ? (
                              <Loader2
                                size={11}
                                className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
                              />
                            ) : (
                              <ChevronDown
                                size={11}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                              />
                            )}
                          </div>

                          {/* Ban Toggle */}
                          <button
                            onClick={() => handleBanToggle(u)}
                            disabled={isUpdating}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                              u.banned
                                ? "text-emerald-600 hover:bg-emerald-50"
                                : "text-red-500 hover:bg-red-50"
                            }`}
                            title={u.banned ? "Unban user" : "Ban user"}
                          >
                            {u.banned ? (
                              <UserCheck size={15} />
                            ) : (
                              <ShieldAlert size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
