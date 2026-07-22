"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPublicEvents, deleteEvent, updateEventStatus, getAdminStats } from "@/services/event.service";
import { axiosInstance } from "@/lib/axiosInstance";
import {
  ShieldAlert, Trash2, AlertOctagon, Users, Calendar,
  DollarSign, TrendingUp, CheckCircle2, XCircle, Clock,
  BarChart2, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import UserManagementTable from "@/components/dashboard/UserManagementTable";
import AdminMessagesTable from "@/components/dashboard/AdminMessagesTable";
import AuditLogsTable from "@/components/dashboard/AuditLogsTable";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (!percent || percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
      className="pointer-events-none drop-shadow-sm"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "users" | "messages" | "logs">("overview");
  const [userRole, setUserRole] = useState<string | null>(null);

  // QueryBuilder Controls State for Events Tab
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState("ALL");
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [eventSortBy, setEventSortBy] = useState("createdAt");
  const [eventSortOrder, setEventSortOrder] = useState<"asc" | "desc">("desc");
  const [eventPage, setEventPage] = useState(1);
  const eventLimit = 10;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode<{ role: string; userId: string }>(token);
        setUserRole(decoded.role);
        if (decoded.role !== "ADMIN" && decoded.role !== "MODERATOR") {
          setIsUnauthorized(true);
          axiosInstance.post("/users/report-violation").then((res) => {
            if (res.data.data.status === "BANNED") setIsBanned(true);
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
          }).catch(() => {
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

  const adminEventQueryParams: Record<string, any> = {
    page: eventPage,
    limit: eventLimit,
    sortBy: eventSortBy,
    sortOrder: eventSortOrder,
  };
  if (eventSearch.trim()) adminEventQueryParams.searchTerm = eventSearch.trim();
  if (eventStatusFilter !== "ALL") adminEventQueryParams.status = eventStatusFilter;
  if (eventTypeFilter === "PUBLIC") adminEventQueryParams.isPublic = true;
  if (eventTypeFilter === "PRIVATE") adminEventQueryParams.isPublic = false;
  if (eventTypeFilter === "PAID") adminEventQueryParams.isPaid = true;
  if (eventTypeFilter === "FREE") adminEventQueryParams.isPaid = false;

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["adminEvents", adminEventQueryParams],
    queryFn: () => getPublicEvents(adminEventQueryParams),
    enabled: !isUnauthorized,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: getAdminStats,
    enabled: !isUnauthorized && (userRole === "ADMIN" || userRole === "MODERATOR"),
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      toast.success("Event deleted globally by Admin.");
      queryClient.invalidateQueries({ queryKey: ["adminEvents"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: () => toast.error("Failed to delete event."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ eventId, status, rejectionReason }: { eventId: string; status: "APPROVED" | "REJECTED"; rejectionReason?: string }) =>
      updateEventStatus(eventId, status, rejectionReason),
    onSuccess: () => {
      toast.success("Event status updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["adminEvents"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update event status.");
    },
  });

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

  const events = eventsData?.data || [];
  const eventMeta = eventsData?.meta || { page: 1, totalPages: 1, total: 0 };

  const tabs: { key: "overview" | "events" | "users" | "messages" | "logs"; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: BarChart2 },
    { key: "events", label: "Events", icon: Calendar },
    { key: "users", label: "Users", icon: Users },
    { key: "messages", label: "Messages", icon: ShieldAlert },
    ...(userRole === "ADMIN" ? [{ key: "logs" as const, label: "Audit Logs", icon: Clock }] : []),
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Admin Control Center</h1>
            <p className="text-xs text-slate-500">Monitor and moderate all platform activity using QueryBuilder.</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-full overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center cursor-pointer ${
              activeTab === key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(7).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-24 animate-pulse" />
              ))}
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Members" value={stats.totalMembers} sub="Registered users" color="bg-indigo-100 text-indigo-600" />
                <StatCard icon={Calendar} label="Total Events" value={stats.totalEvents} sub="All time" color="bg-purple-100 text-purple-600" />
                <StatCard icon={CheckCircle2} label="Approved" value={stats.approvedCount} sub="Live events" color="bg-emerald-100 text-emerald-600" />
                <StatCard icon={XCircle} label="Rejected" value={stats.rejectedCount} sub="Rejected by admin" color="bg-red-100 text-red-600" />
                <StatCard icon={Clock} label="Pending" value={stats.pendingCount} sub="Awaiting review" color="bg-amber-100 text-amber-600" />
                <StatCard
                  icon={DollarSign}
                  label="Total Revenue"
                  value={`$${stats.totalRevenue.toLocaleString()}`}
                  sub="From paid tickets"
                  color="bg-green-100 text-green-600"
                />
                <StatCard icon={TrendingUp} label="Categories" value={stats.categoryData?.length || 0} sub="Event types" color="bg-cyan-100 text-cyan-600" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Events Created (Last 12 Months)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={stats.monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="eventsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, color: "#f8fafc", fontSize: 12 }}
                        labelStyle={{ color: "#94a3b8" }}
                      />
                      <Area type="monotone" dataKey="count" name="Events" stroke="#6366f1" strokeWidth={2} fill="url(#eventsGrad)" dot={{ r: 3, fill: "#6366f1" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Event Moderation Status</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={[
                        { name: "Approved", count: stats.approvedCount, fill: "#10b981" },
                        { name: "Pending", count: stats.pendingCount, fill: "#f59e0b" },
                        { name: "Rejected", count: stats.rejectedCount, fill: "#ef4444" },
                      ]}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, color: "#f8fafc", fontSize: 12 }}
                        cursor={{ fill: "#f8fafc10" }}
                      />
                      <Bar dataKey="count" name="Events" radius={[6, 6, 0, 0]}>
                        {[
                          { name: "Approved", fill: "#10b981" },
                          { name: "Pending", fill: "#f59e0b" },
                          { name: "Rejected", fill: "#ef4444" },
                        ].map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {stats.categoryData?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Events by Category</h3>
                  <div className="w-full">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <Pie
                          data={stats.categoryData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="42%"
                          outerRadius={80}
                          innerRadius={45}
                          paddingAngle={3}
                          label={renderPieLabel}
                          labelLine={false}
                        >
                          {stats.categoryData.map((_: any, i: number) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, color: "#f8fafc", fontSize: 12 }}
                          formatter={(value: any, name: any) => [`${value} events`, name]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          iconType="circle"
                          iconSize={8}
                          formatter={(value: string) => {
                            const item = stats.categoryData?.find((c: any) => c.name === value);
                            return (
                              <span className="text-xs font-medium text-slate-700 mx-1">
                                {value} {item ? <span className="text-slate-400 font-normal">({item.count})</span> : null}
                              </span>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* EVENTS TAB WITH QUERY BUILDER FILTERS */}
      {activeTab === "events" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Moderate Events</h2>
                <p className="text-xs text-slate-500 mt-0.5">Approve, reject, or manage event submissions.</p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full">
                Total Events: {eventMeta.total}
              </span>
            </div>

            {/* QueryBuilder Controls Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 pt-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events by title, venue, host..."
                  value={eventSearch}
                  onChange={(e) => {
                    setEventSearch(e.target.value);
                    setEventPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                  <Filter className="h-3.5 w-3.5" />
                  Status:
                </div>
                <select
                  value={eventStatusFilter}
                  onChange={(e) => {
                    setEventStatusFilter(e.target.value);
                    setEventPage(1);
                  }}
                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0 ml-1">
                  Type:
                </div>
                <select
                  value={eventTypeFilter}
                  onChange={(e) => {
                    setEventTypeFilter(e.target.value);
                    setEventPage(1);
                  }}
                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All Types</option>
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                  <option value="PAID">Paid</option>
                  <option value="FREE">Free</option>
                </select>

                <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0 ml-1">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Sort:
                </div>
                <select
                  value={eventSortBy}
                  onChange={(e) => {
                    setEventSortBy(e.target.value);
                    setEventPage(1);
                  }}
                  className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="title">Title</option>
                  <option value="date">Event Date</option>
                  <option value="fee">Fee</option>
                </select>

                <button
                  onClick={() => setEventSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
                  className="px-2 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 cursor-pointer"
                  title="Toggle order"
                >
                  {eventSortOrder.toUpperCase()}
                </button>
              </div>
            </div>
          </div>

          {eventsLoading ? (
            <div className="p-8 animate-pulse text-indigo-600 font-semibold text-sm">Loading events with QueryBuilder...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-xs">Event Title</th>
                    <th className="px-4 py-3 text-xs hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3 text-xs">Type &amp; Fee</th>
                    <th className="px-4 py-3 text-xs">Status</th>
                    <th className="px-4 py-3 text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((event: any) => (
                    <tr key={event.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px]">
                        <p className="truncate text-sm font-semibold">{event.title}</p>
                        {event.owner?.name && (
                          <p className="text-[10px] text-slate-400 truncate">Host: {event.owner.name}</p>
                        )}
                        {event.rejectionReason && (
                          <p className="text-[10px] text-red-500 italic mt-0.5 truncate">Reason: {event.rejectionReason}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                        {event.date ? format(new Date(event.date), "PP") : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold w-fit ${event.isPublic ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-700"}`}>
                            {event.isPublic ? "PUBLIC" : "PRIVATE"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {event.isPaid ? `$${event.fee}` : "Free"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          event.status === "APPROVED" ? "bg-green-100 text-green-700" :
                          event.status === "REJECTED" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {event.status || "PENDING"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1.5 justify-end flex-wrap">
                          <Button
                            variant="outline" size="sm"
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs h-7 px-2"
                            onClick={() => {
                              let finalDesc = event.description;
                              let finalImg = "";
                              try {
                                const parsed = JSON.parse(event.description);
                                finalDesc = parsed.fullDescription || parsed.shortDescription || event.description;
                                finalImg = parsed.imageUrl || "";
                              } catch (e) {}

                              const isPending = event.status !== "APPROVED" && event.status !== "REJECTED";

                              Swal.fire({
                                title: event.title,
                                html: `
                                  <div class="text-left space-y-4 text-slate-700">
                                    ${finalImg ? `<div class="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><img src="${finalImg}" class="w-full h-48 object-cover" /></div>` : ""}
                                    <div class="grid grid-cols-2 gap-4 text-xs">
                                      <div>
                                        <span class="font-bold text-slate-500 block uppercase tracking-wider">Date & Time</span>
                                        <span class="text-slate-800">${event.date ? format(new Date(event.date), "PPP") : "N/A"} at ${event.time || "N/A"}</span>
                                      </div>
                                      <div>
                                        <span class="font-bold text-slate-500 block uppercase tracking-wider">Venue</span>
                                        <span class="text-slate-800">${event.venue || "N/A"}</span>
                                      </div>
                                      <div>
                                        <span class="font-bold text-slate-500 block uppercase tracking-wider">Price</span>
                                        <span class="text-slate-800">${event.isPaid ? `$${event.fee}` : "Free"}</span>
                                      </div>
                                      <div>
                                        <span class="font-bold text-slate-500 block uppercase tracking-wider">Type</span>
                                        <span class="text-slate-800">${event.isPublic ? "Public" : "Private"}</span>
                                      </div>
                                    </div>
                                    <hr class="border-slate-200 my-3" />
                                    <div class="text-xs">
                                      <span class="font-bold text-slate-500 block uppercase tracking-wider mb-1">Description</span>
                                      <p class="whitespace-pre-line leading-relaxed text-slate-600">${finalDesc}</p>
                                    </div>
                                  </div>
                                `,
                                showConfirmButton: true,
                                showCancelButton: isPending,
                                showDenyButton: isPending,
                                confirmButtonText: "Close",
                                confirmButtonColor: "#64748b",
                                cancelButtonText: "Approve",
                                cancelButtonColor: "#10b981",
                                denyButtonText: "Reject",
                                denyButtonColor: "#ef4444",
                                customClass: {
                                  popup: "rounded-2xl border border-slate-200 shadow-xl bg-white",
                                  confirmButton: "order-3 px-4 py-2 text-sm font-semibold rounded-lg mx-1",
                                  denyButton: "order-2 px-4 py-2 text-sm font-semibold rounded-lg mx-1",
                                  cancelButton: "order-1 px-4 py-2 text-sm font-semibold rounded-lg mx-1",
                                }
                              }).then((result) => {
                                if (result.isDenied) {
                                  Swal.fire({
                                    title: "Reject Event?",
                                    text: "Please provide a reason to inform the event creator:",
                                    input: "text",
                                    inputPlaceholder: "Reason for rejection...",
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#ef4444",
                                    cancelButtonColor: "#64748b",
                                    confirmButtonText: "Reject Event",
                                    iconColor: "#ef4444",
                                    customClass: { popup: "rounded-2xl border border-slate-200 shadow-xl bg-white" },
                                    inputValidator: (value) => { if (!value) return "You must write a reason!"; },
                                  }).then((rejectResult) => {
                                    if (rejectResult.isConfirmed && rejectResult.value) {
                                      statusMutation.mutate({ eventId: event.id, status: "REJECTED", rejectionReason: rejectResult.value });
                                    }
                                  });
                                } else if (result.dismiss === Swal.DismissReason.cancel) {
                                  Swal.fire({
                                    title: "Approve Event?",
                                    text: `Make "${event.title}" live for participants?`,
                                    icon: "question",
                                    showCancelButton: true,
                                    confirmButtonColor: "#10b981",
                                    cancelButtonColor: "#64748b",
                                    confirmButtonText: "Approve Event",
                                    iconColor: "#10b981",
                                    customClass: { popup: "rounded-2xl border border-slate-200 shadow-xl bg-white" },
                                  }).then((approveResult) => {
                                    if (approveResult.isConfirmed) {
                                      statusMutation.mutate({ eventId: event.id, status: "APPROVED" });
                                    }
                                  });
                                }
                              });
                            }}
                          >
                            Details
                          </Button>

                          {userRole === "ADMIN" && (
                            <Button
                              variant="destructive" size="sm"
                              className="text-xs h-7 px-2"
                              onClick={() => {
                                Swal.fire({
                                  title: "Delete Event Globally?",
                                  text: `Permanently delete "${event.title}"?`,
                                  icon: "warning",
                                  showCancelButton: true,
                                  confirmButtonColor: "#ef4444",
                                  cancelButtonColor: "#64748b",
                                  confirmButtonText: "Yes, delete!",
                                  customClass: { popup: "rounded-2xl border border-slate-200 shadow-xl bg-white" },
                                }).then((res) => {
                                  if (res.isConfirmed) deleteMutation.mutate(event.id);
                                });
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {events.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm font-semibold">No events found matching query criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination Footer */}
          {eventMeta.totalPages > 1 && (
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
              <span>Page {eventMeta.page} of {eventMeta.totalPages}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={eventPage <= 1}
                  onClick={() => setEventPage((p) => Math.max(1, p - 1))}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={eventPage >= eventMeta.totalPages}
                  onClick={() => setEventPage((p) => Math.min(eventMeta.totalPages, p + 1))}
                  className="h-7 px-2"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && <UserManagementTable />}

      {/* MESSAGES TAB */}
      {activeTab === "messages" && <AdminMessagesTable />}

      {/* LOGS TAB */}
      {activeTab === "logs" && userRole === "ADMIN" && <AuditLogsTable />}
    </div>
  );
}
