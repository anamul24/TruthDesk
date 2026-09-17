"use client";

import React, { useState } from "react";
import { Users, UserPlus, Search, Filter, MoreVertical, Shield, Mail, Edit2, XCircle } from "lucide-react";

export default function UserManagement() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Mock users
  const users = [
    { id: "1", name: "Anamul", email: "anamul@truthdesk.com", role: "admin", status: "Active", joined: "Jan 12, 2024" },
    { id: "2", name: "Jane Smith", email: "jane@truthdesk.com", role: "editor", status: "Active", joined: "Feb 03, 2024" },
    { id: "3", name: "Rafiq Ahmed", email: "rafiq@truthdesk.com", role: "journalist", status: "Inactive", joined: "Mar 15, 2024" },
    { id: "4", name: "Sarah Khan", email: "sarah@truthdesk.com", role: "fact_checker", status: "Active", joined: "Apr 22, 2024" },
  ];

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
            <Users className="text-blue-600" size={32} />
            User Management
          </h1>
          <p className="text-slate-500 mt-2">Manage newsroom staff, roles, and access.</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <UserPlus size={18} />
          Invite Staff
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              autoComplete="off"
              placeholder="Search users..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider font-semibold text-slate-500">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Mail size={12}/> {user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded flex items-center w-fit gap-1.5 ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'editor' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {user.role === 'admin' && <Shield size={12}/>}
                    {user.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {user.joined}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <XCircle size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Invite New Staff</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input type="email" autoComplete="off" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="staff@truthdesk.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="journalist">Journalist</option>
                  <option value="editor">Editor</option>
                  <option value="fact_checker">Fact Checker</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2">
                <Mail size={16}/> Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
