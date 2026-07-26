"use client";

import React from "react";
import { useRole } from "@/context/RoleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Bell, Info, ShieldCheck, Mail, ClipboardCheck, Trash2 } from "lucide-react";

export default function AdminNotificationsPage() {
  const { notifications, markNotificationRead, clearNotifications } = useRole();

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      clearNotifications();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600 shrink-0" />
            System Notifications
          </h1>
          <p className="text-xs text-slate-500 font-medium">Logs and audit system alerts for piggery operations, lechon bookings, and collection ledger payments.</p>
        </div>
        {notifications.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClear}
            className="flex items-center gap-1 font-bold text-rose-600 border-rose-100 hover:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </Button>
        )}
      </div>

      <Card className="p-6 bg-white border border-slate-200/60 rounded-3xl shadow-sm space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold leading-relaxed">
            <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            No new system alerts or logs.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const isEmail = notif.title.includes("Email");
              const isPayment = notif.title.includes("Payment") || notif.title.includes("Collection");

              return (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-4 border rounded-2xl flex items-start gap-3 transition-colors cursor-pointer ${
                    notif.read
                      ? "bg-slate-50/50 border-slate-100/60 text-slate-500"
                      : "bg-emerald-50/20 border-emerald-100 text-slate-700 font-semibold"
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${
                    isEmail ? "bg-blue-50 text-blue-600" :
                    isPayment ? "bg-amber-50 text-amber-600" :
                    "bg-emerald-50 text-emerald-600"
                  }`}>
                    {isEmail ? <Mail className="w-4 h-4" /> :
                     isPayment ? <ClipboardCheck className="w-4 h-4" /> :
                     <Info className="w-4 h-4" />}
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-xs font-extrabold text-slate-800 truncate">{notif.title}</h4>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0 font-bold">{notif.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-550 leading-relaxed font-medium break-words">
                      {notif.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
