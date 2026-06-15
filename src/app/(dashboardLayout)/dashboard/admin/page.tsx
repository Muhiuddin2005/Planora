"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPublicEvents, deleteEvent } from "@/services/event.service";
import { axiosInstance } from "@/lib/axiosInstance";
import { ShieldAlert, Trash2, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import UserManagementTable from "@/components/dashboard/UserManagementTable";
import { jwtDecode } from "jwt-decode";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode<{ role: string; userId: string }>(token);
        
        if (decoded.role !== "ADMIN") {
          setIsUnauthorized(true);
          
          // Report the violation to the backend
          axiosInstance.post("/users/report-violation").then((res) => {
            const userStatus = res.data.data.status;
            if (userStatus === "BANNED") {
              setIsBanned(true);
            }
            
            // Start countdown to logout
            let timer = 5;
            const interval = setInterval(() => {
              timer -= 1;
              setCountdown(timer);
              if (timer <= 0) {
                clearInterval(interval);
                localStorage.removeItem("accessToken");
                document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
                window.location.href = "/login";
              }
            }, 1000);
          }).catch((error: any) => {
            console.error("Backend Error - Failed to log violation:", error.response?.data || error.message);
            
            // Fallback logout if the request fails
            setTimeout(() => {
              localStorage.removeItem("accessToken");
              document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
              window.location.href = "/login";
            }, 3000);
          });
        }
      } catch (e) {
        console.error("Token decoding failed", e);
      }
    } else {
      window.location.href = "/login";
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["adminEvents"],
    queryFn: getPublicEvents,
    enabled: !isUnauthorized, // Don't fetch events if unauthorized
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      toast.success("Event deleted globally by Admin.");
      queryClient.invalidateQueries({ queryKey: ["adminEvents"] });
    },
    onError: () => toast.error("Failed to delete event."),
  });

  // --- FORBIDDEN UI ---
  if (isUnauthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl shadow-xl overflow-hidden p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6">
            <AlertOctagon className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            {isBanned ? "Account Banned" : "Access Forbidden"}
          </h1>
          <div className="space-y-3 mb-8">
            <p className="text-slate-600 font-medium">
              You have attempted to access a restricted administrative zone.
            </p>
            {isBanned ? (
              <p className="text-red-600 text-sm font-bold bg-red-50 py-2 px-4 rounded-lg">
                Due to repeated unauthorized access attempts, your account has been permanently banned from Planora.
              </p>
            ) : (
              <p className="text-amber-600 text-sm font-bold bg-amber-50 py-2 px-4 rounded-lg">
                FINAL WARNING: A second attempt to breach this area will result in an automatic and permanent account ban.
              </p>
            )}
          </div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-widest">
            Forcing logout in <span className="text-red-500 font-bold text-base ml-1">{countdown}s</span>
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN UI ---
  if (isLoading) return <div className="p-8 animate-pulse text-indigo-600 font-semibold">Loading Admin Portal...</div>;

  const events = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-200">
        <ShieldAlert className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Control Center</h1>
          <p className="text-sm text-slate-500">Monitor and moderate all platform events.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Moderate Events</h2>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Event Title</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {events.map((event: any) => (
              <tr key={event.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">{event.title}</td>
                <td className="px-6 py-4 text-slate-500">
                  {event.date ? format(new Date(event.date), "PPP") : "N/A"}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${event.isPublic ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'}`}>
                    {event.isPublic ? 'PUBLIC' : 'PRIVATE'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      if (confirm("ADMIN OVERRIDE: Delete this event globally?")) {
                        deleteMutation.mutate(event.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Force Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserManagementTable />
    </div>
  );
}
