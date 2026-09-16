import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { Shield, Key, AlertTriangle, Monitor, XCircle, Clock, Smartphone } from "lucide-react";
import { format } from "date-fns";

export default async function SecurityCenter() {
  await requireRole([USER_ROLES.ADMIN]);

  const activeSessions = [
    { id: "s1", user: "Admin User", device: "MacBook Pro - Chrome", ip: "192.168.1.1", lastActive: new Date(), current: true },
    { id: "s2", user: "Admin User", device: "iPhone 13 - Safari", ip: "10.0.0.45", lastActive: new Date(Date.now() - 3600000), current: false }
  ];

  const securityEvents = [
    { id: "e1", type: "WARNING", message: "Failed login attempt (3x)", user: "jane@truthdesk.com", ip: "103.11.22.33", time: new Date(Date.now() - 86400000) },
    { id: "e2", type: "INFO", message: "Password changed", user: "rafiq@truthdesk.com", ip: "192.168.1.100", time: new Date(Date.now() - 172800000) },
    { id: "e3", type: "CRITICAL", message: "Role upgraded to Admin", user: "sarah@truthdesk.com", ip: "192.168.1.1", time: new Date(Date.now() - 259200000) },
  ];

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
          <Shield className="text-purple-600" size={32} />
          Security Center
        </h1>
        <p className="text-slate-500 mt-2">Monitor access, manage sessions, and review security events.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Sessions */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Monitor size={20} className="text-slate-400" />
            Active Sessions
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {activeSessions.map(session => (
              <div key={session.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-slate-100 text-slate-500 rounded-lg shrink-0">
                    {session.device.includes("iPhone") ? <Smartphone size={20} /> : <Monitor size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      {session.device}
                      {session.current && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] uppercase tracking-wider font-bold">Current</span>}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span>IP: {session.ip}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Last active: {format(session.lastActive, "MMM d, h:mm a")}</span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <button className="self-start sm:self-center px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors shrink-0">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Security Settings & Events */}
        <section className="space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Key size={20} className="text-slate-400" />
              Authentication Policies
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Two-Factor Authentication (2FA)</h3>
                  <p className="text-xs text-slate-500 mt-1">Require 2FA for all Admin and Editor accounts.</p>
                </div>
                <button className="w-11 h-6 bg-green-500 rounded-full relative transition-colors">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </button>
              </div>
              <hr className="border-slate-100" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Session Timeout</h3>
                  <p className="text-xs text-slate-500 mt-1">Force logout after inactivity.</p>
                </div>
                <select className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 outline-none">
                  <option>1 Hour</option>
                  <option>4 Hours</option>
                  <option>24 Hours</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={20} className="text-slate-400" />
              Recent Security Events
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {securityEvents.map(event => (
                <div key={event.id} className="p-4 flex items-start gap-4 hover:bg-slate-50">
                  <div className="mt-1">
                    {event.type === "CRITICAL" && <Shield className="text-purple-500" size={18} />}
                    {event.type === "WARNING" && <AlertTriangle className="text-orange-500" size={18} />}
                    {event.type === "INFO" && <Shield className="text-blue-500" size={18} />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm">{event.message}</h3>
                    <div className="text-xs text-slate-500 mt-1">
                      User: {event.user} • IP: {event.ip}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-400 shrink-0 whitespace-nowrap">
                    {format(event.time, "MMM d, h:mm a")}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

      </div>

    </div>
  );
}
