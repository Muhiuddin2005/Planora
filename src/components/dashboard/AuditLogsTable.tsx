"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import { format } from "date-fns";
import { Clock, Shield, AlertTriangle, CheckCircle, XCircle, Trash2, UserMinus, UserCheck, ShieldAlert, Search } from "lucide-react";
import { useState } from "react";

export default function AuditLogsTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: async () => (await axiosInstance.get("/audit-logs")).data,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center mt-6">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-48 bg-slate-200 rounded mb-4"></div>
          <div className="h-64 w-full bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  const logs = data?.data || [];

  // Filter logs based on search term
  const filteredLogs = logs.filter((log: any) => {
    const searchString = `${log.action} ${log.details || ""} ${log.user?.name || ""} ${log.user?.email || ""} ${log.targetName || ""}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "BAN_USER":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            <UserMinus className="h-3.5 w-3.5" />
            BAN USER
          </span>
        );
      case "UNBAN_USER":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <UserCheck className="h-3.5 w-3.5" />
            UNBAN USER
          </span>
        );
      case "PROMOTE_MODERATOR":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
            <Shield className="h-3.5 w-3.5" />
            PROMOTE MOD
          </span>
        );
      case "DEMOTE_MODERATOR":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
            <ShieldAlert className="h-3.5 w-3.5" />
            DEMOTE MOD
          </span>
        );
      case "APPROVE_EVENT":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
            <CheckCircle className="h-3.5 w-3.5" />
            APPROVE EVENT
          </span>
        );
      case "REJECT_EVENT":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
            <XCircle className="h-3.5 w-3.5" />
            REJECT EVENT
          </span>
        );
      case "DELETE_EVENT":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            <Trash2 className="h-3.5 w-3.5" />
            DELETE EVENT
          </span>
        );
      case "DELETE_USER":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
            <Trash2 className="h-3.5 w-3.5" />
            DELETE USER
          </span>
        );
      case "DELETE_MESSAGE":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Trash2 className="h-3.5 w-3.5" />
            DELETE MESSAGE
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            {action}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      {/* Header & Search */}
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">System Activity Logs</h2>
            <p className="text-xs text-slate-500">Track and monitor moderation and administrative actions.</p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Performer</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4">Target Name</th>
              <th className="px-6 py-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                  {searchTerm ? "No matching activity logs found." : "No activity logs recorded yet."}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {log.user?.name || "System"}
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                          log.user?.role === "ADMIN" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {log.user?.role || "SYSTEM"}
                        </span>
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">{log.user?.email || ""}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium max-w-xs break-words">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                    {log.targetName || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-medium whitespace-nowrap">
                    {log.createdAt ? format(new Date(log.createdAt), "PPP p") : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
