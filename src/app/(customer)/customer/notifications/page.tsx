"use client";

import React from "react";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Bell, BellOff, CheckCheck, Trash2 } from "lucide-react";

export default function CustomerNotificationsPage() {
  const { notifications, markNotificationRead, clearNotifications } = useRole();

  return (
    <div className="space-y-6 font-sans max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800">Alerts & Notifications</h1>
          <p className="text-xs text-slate-500 font-medium">Verify historical system log status updates.</p>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<CheckCheck className="w-3.5 h-3.5" />}
              onClick={() => {
                notifications.forEach((n) => markNotificationRead(n.id));
              }}
            >
              Mark Read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              className="text-red-650 hover:bg-red-50"
              onClick={clearNotifications}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 text-xs font-medium space-y-3 bg-white">
          <BellOff className="w-10 h-10 text-slate-300 mx-auto" />
          <div>No active notifications. You're all caught up!</div>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-4.5 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start ${
                n.read
                  ? "bg-white border-slate-100 opacity-70"
                  : "bg-primary-50/20 border-primary-500/10 shadow-sm"
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${
                n.type === "order" ? "bg-indigo-50 text-indigo-650" :
                n.type === "reservation" ? "bg-amber-50 text-amber-600" :
                "bg-slate-100 text-slate-500"
              }`}>
                <Bell className="w-4 h-4" />
              </div>
              
              <div className="flex-1 space-y-1 overflow-hidden">
                <div className="flex justify-between items-center gap-4">
                  <h4 className="text-xs font-bold text-slate-800">{n.title}</h4>
                  <span className="text-[9px] text-slate-400 font-bold shrink-0">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-550 leading-relaxed font-medium">{n.message}</p>
              </div>

              {!n.read && (
                <span className="w-2 h-2 bg-primary-600 rounded-full shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
