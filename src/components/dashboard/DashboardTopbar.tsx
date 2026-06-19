"use client";

import { useEffect, useState } from "react";
import { User, Bell, Check, Trash2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function DashboardTopbar() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("accessToken"));
    }
  }, []);

  const { data: user } = useQuery({
    queryKey: ["dashboardTopbarProfile", token],
    queryFn: async () => {
      if (!token) return null;
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data?.data;
      } catch (err) {
        console.error("Failed to fetch profile in dashboard topbar", err);
        return null;
      }
    },
    enabled: !!token,
  });

  // Notifications Query
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", token],
    queryFn: getNotifications,
    enabled: !!token,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", token] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", token] });
    },
    onError: () => toast.error("Failed to delete notification"),
  });

  // Socket connection
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
      console.log("Connected to notification socket server");
      socket.emit("join", user.id);
    });

    socket.on("new_notification", (newNotification: any) => {
      console.log("New real-time notification:", newNotification);

      // Trigger audio tone or notification toast
      toast.info(newNotification.title, {
        description: newNotification.message,
        action: {
          label: "Mark Read",
          onClick: () => markReadMutation.mutate(newNotification.id),
        },
      });

      // Update query cache optimistically
      queryClient.setQueryData(["notifications", token], (old: any[] | undefined) => {
        const list = old || [];
        // Prevent duplicate real-time adds
        if (list.some((n) => n.id === newNotification.id)) return list;
        return [newNotification, ...list];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user?.id, queryClient]);

  const userName = user?.name || "User Account";
  const userRole =
    user?.role === "ADMIN" ? "Planora Admin" :
    user?.role === "MODERATOR" ? "Planora Moderator" :
    "Planora Member";

  const unreadNotifications = notifications.filter((n: any) => !n.isRead);
  const unreadCount = unreadNotifications.length;

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-40 relative">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bell-shake {
          0%, 100% { transform: rotate(0); }
          15% { transform: rotate(10deg); }
          30% { transform: rotate(-10deg); }
          45% { transform: rotate(8deg); }
          60% { transform: rotate(-8deg); }
          75% { transform: rotate(4deg); }
          85% { transform: rotate(-4deg); }
        }
        .bell-shake-animation {
          animation: bell-shake 1.8s ease-in-out infinite;
          transform-origin: top center;
        }
      `}} />

      <div>
        <h1 className="text-lg font-semibold text-slate-900">Workspace Dashboard</h1>
      </div>
      <div className="flex items-center gap-4 relative">
        {/* Notification Button */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-500 hover:text-slate-900 relative cursor-pointer"
          >
            <Bell className={`h-5 w-5 ${unreadCount > 0 ? "bell-shake-animation text-indigo-600" : ""}`} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
              </span>
            )}
          </Button>

          {/* Overlay to close on clicking outside */}
          {isOpen && (
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          )}

          {/* Premium Notification Dropdown */}
          <AnimatePresence>
            {isOpen && (
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

                <div className="overflow-y-auto flex-1 divide-y divide-slate-100 max-h-[350px] custom-scrollbar">
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
                          {/* Mark Read Action Button */}
                          {!notification.isRead && (
                            <button
                              onClick={() => markReadMutation.mutate(notification.id)}
                              className="h-6 w-6 rounded-full border border-indigo-100 bg-white hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center text-slate-400 shadow-sm transition-colors cursor-pointer"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          {/* Delete Notification Button */}
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

        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-indigo-600 border border-indigo-100 overflow-hidden">
            {user?.profilePic ? (
              <img src={user.profilePic} alt={userName} className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-none">{userName}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">{userRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
