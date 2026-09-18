import React from "react";
import { requireRole } from "@/lib/authorize";
import { USER_ROLES } from "@/lib/validations";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { Shield, Key, AlertTriangle, Monitor, Smartphone, Clock, Info } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default async function SecurityCenter() {
  await requireRole([USER_ROLES.ADMIN]);

  // Real session data from DB
  const sessionsDb = await getCollection(COLLECTIONS.SESSIONS);
  const auditDb = await getCollection(COLLECTIONS.AUDIT_LOGS);

  // Get active sessions (sort by most recent)
  const activeSessions = await sessionsDb
    .find({ expiresAt: { $gt: new Date() } })
    .sort({ updatedAt: -1 })
    .limit(10)
    .toArray();

  // Get recent security-related audit events
  const securityEvents = await auditDb
    .find({ targetType: { $in: ["USER", "SYSTEM", "SECURITY", "AUTH"] } })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  const getSeverityIcon = (event) => {
    const action = (event.action || "").toLowerCase();
    if (action.includes("fail") || action.includes("block") || action.includes("denied")) {
      return <AlertTriangle className="text-orange-500 shrink-0" size={18} />;
    }
    if (action.includes("role") || action.includes("admin") || action.includes("delete")) {
      return <Shield className="text-purple-500 shrink-0" size={18} />;
    }
    return <Info className="text-blue-500 shrink-0" size={18} />;
  };

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
            <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">{activeSessions.length}</span>
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {activeSessions.length > 0 ? activeSessions.map(session => (
              <div key={session._id.toString()} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-slate-100 text-slate-500 rounded-lg shrink-0">
                    {(session.userAgent || "").includes("Mobile") || (session.userAgent || "").includes("iPhone") 
                      ? <Smartphone size={20} /> 
                      : <Monitor size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {session.userId?.toString()?.substring(0, 8) || "Unknown User"}...
                    </h3>
                    <div className="text-xs text-slate-500 mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      {session.ipAddress && <span>IP: {session.ipAddress}</span>}
                      {session.ipAddress && <span className="hidden sm:inline">•</span>}
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Expires {format(new Date(session.expiresAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="self-start sm:self-center px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors shrink-0">
                  Revoke
                </button>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500">
                <Monitor size={28} className="mx-auto mb-2 text-slate-200" />
                <p className="text-sm font-medium">No active sessions found.</p>
              </div>
            )}
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
              {securityEvents.length > 0 ? securityEvents.map(event => (
                <div key={event._id.toString()} className="p-4 flex items-start gap-4 hover:bg-slate-50">
                  <div className="mt-1">{getSeverityIcon(event)}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm">{event.action || "Security Event"}</h3>
                    <div className="text-xs text-slate-500 mt-1">
                      {event.userName || event.userId || "Unknown User"}
                      {event.ip && ` • IP: ${event.ip}`}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-400 shrink-0 whitespace-nowrap">
                    {formatDistanceToNow(new Date(event.createdAt || new Date()))} ago
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-500">
                  <Shield size={28} className="mx-auto mb-2 text-slate-200" />
                  <p className="text-sm font-medium">No security events recorded.</p>
                  <p className="text-xs text-slate-400 mt-1">Events will appear as user and system actions are logged.</p>
                </div>
              )}
            </div>
          </div>

        </section>

      </div>

    </div>
  );
}
