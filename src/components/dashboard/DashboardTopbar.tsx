"use client";

import { useEffect, useState } from "react";
import { User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardTopbar() {
  const [userName] = useState<string>("User Account");

  useEffect(() => {
    // Optional: Parse user from token
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Workspace Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-indigo-600">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-900">{userName}</p>
            <p className="text-[10px] text-slate-500">Planora Member</p>
          </div>
        </div>
      </div>
    </header>
  );
}
