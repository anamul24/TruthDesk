import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { Briefcase, Check, Minus } from "lucide-react";

export default async function RoleMatrix() {
  await requireRole([USER_ROLES.ADMIN]);

  const permissions = [
    { name: "Create Article", journalist: true, editor: true, admin: true },
    { name: "Edit Own Article", journalist: true, editor: true, admin: true },
    { name: "Review Articles", journalist: false, editor: true, admin: true },
    { name: "Approve Articles", journalist: false, editor: true, admin: true },
    { name: "Publish Articles", journalist: false, editor: true, admin: true },
    { name: "Manage Users", journalist: false, editor: false, admin: true },
    { name: "Manage Roles", journalist: false, editor: false, admin: true },
    { name: "Homepage Curation", journalist: false, editor: true, admin: true },
    { name: "Breaking News", journalist: false, editor: true, admin: true },
    { name: "View Analytics", journalist: "Own", editor: "Team", admin: "Global" },
    { name: "Audit Logs", journalist: false, editor: false, admin: true },
    { name: "Security", journalist: false, editor: false, admin: true },
  ];

  const renderValue = (value) => {
    if (value === true) return <Check className="text-green-500 mx-auto" size={20} />;
    if (value === false) return <Minus className="text-slate-300 mx-auto" size={20} />;
    return <span className="text-sm font-semibold text-slate-700">{value}</span>;
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto space-y-8 font-sans">
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
          <Briefcase className="text-purple-600" size={32} />
          Roles & Permissions
        </h1>
        <p className="text-slate-500 mt-2">Matrix of system capabilities across different user roles.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 font-bold text-slate-900 w-1/3">Capability</th>
              <th className="px-6 py-4 text-center font-bold text-slate-900 bg-blue-50/50">Journalist</th>
              <th className="px-6 py-4 text-center font-bold text-slate-900 bg-indigo-50/50">Editor</th>
              <th className="px-6 py-4 text-center font-bold text-slate-900 bg-purple-50/50">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {permissions.map((perm, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-700 border-r border-slate-100">{perm.name}</td>
                <td className="px-6 py-4 text-center bg-blue-50/10 border-r border-slate-100">{renderValue(perm.journalist)}</td>
                <td className="px-6 py-4 text-center bg-indigo-50/10 border-r border-slate-100">{renderValue(perm.editor)}</td>
                <td className="px-6 py-4 text-center bg-purple-50/10">{renderValue(perm.admin)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
