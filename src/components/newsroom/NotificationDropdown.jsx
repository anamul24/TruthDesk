"use client";

import React, { useState } from "react";
import { Bell, CheckCircle, Info, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Placeholder data for foundation
const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "New Assignment: Election Coverage",
    message: "You have been assigned to cover the upcoming local elections. Brief is attached.",
    type: "assignment",
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    read: false,
  },
  {
    id: "2",
    title: "Revision Requested",
    message: "Editor requested changes on 'Economy Q3 Report'. Please review.",
    type: "revision",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
  },
  {
    id: "3",
    title: "Article Published",
    message: "Your article 'Tech Innovations 2024' is now live.",
    type: "success",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  }
];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case "assignment": return <Info size={16} className="text-blue-500" />;
      case "revision": return <AlertTriangle size={16} className="text-orange-500" />;
      case "success": return <CheckCircle size={16} className="text-green-500" />;
      default: return <Bell size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-slate-800">Notifications</h3>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
                Mark all as read
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div>
                    <p className={`text-sm ${!notif.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {notif.title}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {formatDistanceToNow(notif.createdAt)} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
              <Link 
                href="/journalist/notifications" 
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 block py-1"
              >
                View All Notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
