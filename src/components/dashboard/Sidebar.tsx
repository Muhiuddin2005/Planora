"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Home, LogOut, ShieldAlert, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jwtDecode } from "jwt-decode";
import { AnimatePresence, motion } from "framer-motion";

export default function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const decoded = jwtDecode<{ role: string }>(token);
          if (decoded.role === "ADMIN") setIsAdmin(true);
          if (decoded.role === "MODERATOR") setIsModerator(true);
        } catch (e) {
          console.error("Token decode failed in Sidebar", e);
        }
      }
    }
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="space-y-6">
        <Link href="/" className="flex items-center gap-2 px-2 text-xl font-bold tracking-tight text-slate-900 hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 text-white shadow-sm">
            <Calendar className="h-4 w-4" />
          </div>
          <span>Planora<span className="text-indigo-600">.</span></span>
        </Link>

        <nav className="space-y-1">
          <Link href="/dashboard" className={getLinkClass("/dashboard")}>
            <LayoutDashboard className="h-4 w-4 text-indigo-600" />
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/profile" className={getLinkClass("/dashboard/profile")}>
            <User className="h-4 w-4 text-indigo-600" />
            <span>Profile Settings</span>
          </Link>
          {isAdmin && (
            <Link href="/dashboard/admin" className={getLinkClass("/dashboard/admin")}>
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <span>Admin Portal</span>
            </Link>
          )}
          {isModerator && (
            <Link href="/dashboard/admin" className={getLinkClass("/dashboard/admin")}>
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <span>Moderator Portal</span>
            </Link>
          )}
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent">
            <Home className="h-4 w-4" />
            <span>View Homepage</span>
          </Link>
        </nav>
      </div>

      <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 gap-3" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        <span>Log Out</span>
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-slate-200 bg-white h-screen flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-600 text-white">
            <Calendar className="h-3.5 w-3.5" />
          </div>
          <span>Planora<span className="text-indigo-600">.</span></span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-white shadow-xl md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
