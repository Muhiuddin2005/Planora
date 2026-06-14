"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Calendar, User, Menu, X, PlusCircle, LayoutDashboard, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [token, setToken] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("accessToken"));
    }
  }, []);

  const { data: user } = useQuery({
    queryKey: ["navbarProfile", token],
    queryFn: async () => {
      if (!token) return null;
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data?.data;
      } catch (err) {
        console.error("Failed to fetch profile in navbar", err);
        return null;
      }
    },
    enabled: !!token,
  });

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      // Clear cookie
      document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
            <Calendar className="h-5 w-5" />
          </div>
          <span>Planora<span className="text-indigo-600">.</span></span>
        </Link>

        {/* Desktop Nav links - 4+ static/dynamic routes */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="transition-colors hover:text-indigo-600">Home</Link>
          <Link href="/events" className="transition-colors hover:text-indigo-600">Explore</Link>
          <Link href="/about" className="transition-colors hover:text-indigo-600">About</Link>
          <Link href="/contact" className="transition-colors hover:text-indigo-600">Contact</Link>
        </nav>

        {/* Action Buttons / Dropdown */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 outline-none group hover:opacity-95 transition-opacity px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold overflow-hidden border border-indigo-200">
                  {user?.profilePic ? (
                    <img src={user.profilePic} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : <User className="h-4 w-4" />
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 select-none">
                  {user?.name || "My Account"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 rounded-xl p-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-100">
                <div className="px-2.5 py-2 text-xs font-semibold text-slate-500">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-900 text-sm leading-none">{user?.name || "Loading..."}</span>
                    <span className="text-xs text-slate-400 font-normal truncate leading-none mt-1">{user?.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator className="-mx-1.5 my-1.5 border-t border-slate-100" />
                
                <DropdownMenuItem className="cursor-pointer focus:bg-slate-50 rounded-md">
                  <Link href="/dashboard" className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-slate-700 font-medium hover:text-slate-900">
                    <LayoutDashboard className="h-4 w-4 text-slate-500" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer focus:bg-slate-50 rounded-md">
                  <Link href="/events/add" className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-slate-700 font-medium hover:text-slate-900">
                    <PlusCircle className="h-4 w-4 text-slate-500" />
                    Add Event
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer focus:bg-slate-50 rounded-md">
                  <Link href="/events/manage" className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-slate-700 font-medium hover:text-slate-900">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    Manage Events
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="-mx-1.5 my-1.5 border-t border-slate-100" />
                
                <DropdownMenuItem className="cursor-pointer focus:bg-red-50/50 rounded-md" onClick={handleLogout}>
                  <button className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-red-600 font-semibold text-left">
                    <LogOut className="h-4 w-4 text-red-500" />
                    Log Out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" passHref>
                <Button variant="ghost" size="sm" className="font-semibold text-slate-600 hover:text-slate-900">Sign In</Button>
              </Link>
              <Link href="/register" passHref>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 font-semibold">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 md:hidden hover:bg-slate-50"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav links */}
      {mobileOpen && (
        <div className="border-b border-slate-200 bg-white/95 px-4 py-4 md:hidden flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link href="/events" className="text-sm font-medium text-slate-600 hover:text-indigo-600" onClick={() => setMobileOpen(false)}>Explore</Link>
          <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-indigo-600" onClick={() => setMobileOpen(false)}>About</Link>
          <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-indigo-600" onClick={() => setMobileOpen(false)}>Contact</Link>
          
          <hr className="border-slate-100" />
          
          <div className="flex flex-col gap-2">
            {token ? (
              <div className="space-y-3">
                {/* Logged in User info in Mobile */}
                <div className="flex items-center gap-2.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold overflow-hidden">
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      user?.name ? user.name[0].toUpperCase() : <User className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-sm font-bold text-slate-800">{user?.name || "Loading..."}</span>
                    <span className="text-xs text-slate-400 mt-1">{user?.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-2 text-slate-700">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/events/add" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-2 text-slate-700">
                      <PlusCircle className="h-4 w-4" />
                      Add Event
                    </Button>
                  </Link>
                  <Link href="/events/manage" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-2 text-slate-700">
                      <Calendar className="h-4 w-4" />
                      Manage Events
                    </Button>
                  </Link>
                  <Button variant="destructive" className="w-full justify-start gap-2 mt-2" onClick={() => { setMobileOpen(false); handleLogout(); }}>
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" passHref className="w-full" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/register" passHref className="w-full" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
