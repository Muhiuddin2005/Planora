"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Calendar, User, Menu, X, PlusCircle, LayoutDashboard, LogOut, Bell, Check, Trash2, CheckCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/services/notification.service";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

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
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
          setToken(null);
        }
        return null;
      }
    },
    enabled: !!token,
  });

  // Notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", token],
    queryFn: getNotifications,
    enabled: !!token,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", token] }),
    onError: () => toast.error("Failed to mark notification as read"),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", token] });
      toast.success("All notifications marked as read!");
    },
    onError: () => toast.error("Failed to mark all as read"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", token] }),
    onError: () => toast.error("Failed to delete notification"),
  });

  // Socket connection for real-time notifications
  useEffect(() => {
    if (!token || !user?.id) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ||
      "http://localhost:5000";

    const socket = io(socketUrl, {
      transports: ["websocket"],
      auth: { token },
    });

    socket.on("connect", () => {
      socket.emit("join", user.id);
    });

    socket.on("new_notification", (newNotification: any) => {
      toast.info(newNotification.title, {
        description: newNotification.message,
        action: {
          label: "Mark Read",
          onClick: () => markReadMutation.mutate(newNotification.id),
        },
      });

      queryClient.setQueryData(["notifications", token], (old: any[] | undefined) => {
        const list = old || [];
        if (list.some((n) => n.id === newNotification.id)) return list;
        return [newNotification, ...list];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user?.id, queryClient]);

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes navbar-bell-shake {
          0%, 100% { transform: rotate(0); }
          15% { transform: rotate(10deg); }
          30% { transform: rotate(-10deg); }
          45% { transform: rotate(8deg); }
          60% { transform: rotate(-8deg); }
          75% { transform: rotate(4deg); }
          85% { transform: rotate(-4deg); }
        }
        .navbar-bell-shake {
          animation: navbar-bell-shake 1.8s ease-in-out infinite;
          transform-origin: top center;
        }
      `}} />
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
            <>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 font-semibold shadow-sm transition-all duration-200"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              {/* Notification Bell */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="text-slate-500 hover:text-slate-900 relative cursor-pointer h-9 w-9"
                >
                  <Bell className={`h-5 w-5 ${unreadCount > 0 ? "navbar-bell-shake text-indigo-600" : ""}`} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-600 items-center justify-center text-[9px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    </span>
                  )}
                </Button>

                {notifOpen && (
                  <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                )}

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100/90 z-50 overflow-hidden flex flex-col max-h-[500px]"
                    >
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {unreadCount} unread messages
                          </p>
                        </div>
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAllReadMutation.mutate()}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold p-1 hover:bg-transparent"
                          >
                            <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark all read
                          </Button>
                        )}
                      </div>

                      <div className="overflow-y-auto flex-1 divide-y divide-slate-100 max-h-[350px]">
                        {notifications.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
                            <Bell className="h-8 w-8 text-slate-200" />
                            <p className="text-xs font-semibold text-slate-500">All caught up!</p>
                            <p className="text-[10px] text-slate-400">No notifications to display</p>
                          </div>
                        ) : (
                          notifications.map((notification: any) => (
                            <div
                              key={notification.id}
                              className={`p-4 flex gap-3 transition-colors relative group ${
                                !notification.isRead ? "bg-indigo-50/30" : "hover:bg-slate-50/50"
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1">
                                  <span className={`font-bold text-xs text-slate-800 break-words ${!notification.isRead ? "text-indigo-900" : ""}`}>
                                    {notification.title}
                                  </span>
                                  <span className="text-[9px] text-slate-400 shrink-0 font-medium whitespace-nowrap">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1 leading-normal break-words">
                                  {notification.message}
                                </p>
                              </div>

                              <div className="flex flex-col gap-2 justify-center shrink-0">
                                {!notification.isRead && (
                                  <button
                                    onClick={() => markReadMutation.mutate(notification.id)}
                                    className="h-6 w-6 rounded-full border border-indigo-100 bg-white hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center text-slate-400 shadow-sm transition-colors cursor-pointer"
                                    title="Mark as read"
                                  >
                                    <Check className="h-3 w-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteMutation.mutate(notification.id)}
                                  className="h-6 w-6 rounded-full border border-slate-100 bg-white hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-slate-400 shadow-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                  title="Delete notification"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
            </>
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
