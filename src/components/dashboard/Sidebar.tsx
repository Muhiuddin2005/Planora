"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Home, LogOut, ShieldAlert, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jwtDecode } from "jwt-decode";

export default function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const decoded = jwtDecode<{ role: string }>(token);
          if (decoded.role === "ADMIN") {
            setIsAdmin(true);
          }
        } catch (e) {
          console.error("Token decode failed in Sidebar", e);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      window.location.href = "/";
    }
  };

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors border ${
      isActive
        ? "text-slate-900 bg-slate-50 border-slate-100 shadow-sm"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"
    }`;
  };

  return (
    <aside className="w-64 border-r border-slate-200 bg-white h-screen flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        <Link href="/" className="flex items-center gap-2 px-2 text-xl font-bold tracking-tight text-slate-900 hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 text-white shadow-sm">
            <Calendar className="h-4.5 w-4.5" />
          </div>
          <span>Planora<span className="text-indigo-600">.</span></span>
        </Link>

        <nav className="space-y-1">
          <Link href="/dashboard" className={getLinkClass("/dashboard")}>
            <LayoutDashboard className="h-4.5 w-4.5 text-indigo-600" />
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/profile" className={getLinkClass("/dashboard/profile")}>
            <User className="h-4.5 w-4.5 text-indigo-600" />
            <span>Profile Settings</span>
          </Link>
          {isAdmin && (
            <Link href="/dashboard/admin" className={getLinkClass("/dashboard/admin")}>
              <ShieldAlert className="h-4.5 w-4.5 text-red-600" />
              <span>Admin Portal</span>
            </Link>
          )}
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent">
            <Home className="h-4.5 w-4.5" />
            <span>View Homepage</span>
          </Link>
        </nav>
      </div>

      <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 gap-3" onClick={handleLogout}>
        <LogOut className="h-4.5 w-4.5" />
        <span>Log Out</span>
      </Button>
    </aside>
  );
}
