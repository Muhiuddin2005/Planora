"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Ban, Trash2, CheckCircle, ShieldCheck, UserX } from "lucide-react";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";

export default function UserManagementTable() {
  const queryClient = useQueryClient();
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode<{ role: string }>(token);
        setCurrentUserRole(decoded.role);
      } catch {}
    }
  }, []);

  const isAdmin = currentUserRole === "ADMIN";

  const { data, isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => (await axiosInstance.get("/users")).data,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      await axiosInstance.patch(`/users/${id}/status`, { status }),
    onSuccess: () => {
      toast.success("User status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update user status.");
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) =>
      await axiosInstance.patch(`/users/${id}/role`, { role }),
    onSuccess: () => {
      toast.success("User role updated!");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update role.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await axiosInstance.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete user.");
    },
  });

  const handleDeleteUser = (id: string) => {
    Swal.fire({
      title: "Delete User Account?",
      text: "This will permanently delete the user, all their events and reviews!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete user!",
      iconColor: "#f59e0b",
      customClass: { popup: "rounded-2xl border border-slate-200 shadow-xl bg-white" },
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(id);
    });
  };

  const handleToggleStatus = (user: any) => {
    const isBan = user.status === "ACTIVE" || !user.status;
    Swal.fire({
      title: isBan ? "Ban User?" : "Unban User?",
      text: isBan
        ? `Ban ${user.name}? They won't be able to access the platform.`
        : `Restore access for ${user.name}?`,
      icon: isBan ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: isBan ? "#ef4444" : "#10b981",
      cancelButtonColor: "#64748b",
      confirmButtonText: isBan ? "Yes, ban!" : "Yes, unban!",
      iconColor: isBan ? "#ef4444" : "#10b981",
      customClass: { popup: "rounded-2xl border border-slate-200 shadow-xl bg-white" },
    }).then((result) => {
      if (result.isConfirmed) {
        statusMutation.mutate({ id: user.id, status: isBan ? "BANNED" : "ACTIVE" });
      }
    });
  };

  const handlePromoteRole = (user: any) => {
    const isPromoting = user.role === "USER";
    Swal.fire({
      title: isPromoting ? "Promote to Moderator?" : "Revoke Moderator Role?",
      text: isPromoting
        ? `${user.name} will gain Moderator privileges — event moderation, user management, and message access.`
        : `${user.name} will be demoted back to a regular User.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: isPromoting ? "#f59e0b" : "#64748b",
      cancelButtonColor: "#475569",
      confirmButtonText: isPromoting ? "Yes, promote!" : "Yes, revoke!",
      iconColor: "#f59e0b",
      customClass: { popup: "rounded-2xl border border-slate-200 shadow-xl bg-white" },
    }).then((result) => {
      if (result.isConfirmed) {
        roleMutation.mutate({ id: user.id, role: isPromoting ? "MODERATOR" : "USER" });
      }
    });
  };

  if (isLoading) return <div className="p-4 text-indigo-600 animate-pulse font-semibold text-sm">Loading users...</div>;

  const users = data?.data || [];

  const roleStyle = (role: string) => {
    if (role === "ADMIN") return "bg-red-100 text-red-700";
    if (role === "MODERATOR") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-indigo-600" />
        <div>
          <h2 className="text-base font-bold text-slate-900">User Management</h2>
          <p className="text-xs text-slate-500">
            {isAdmin ? "Promote, ban, or delete users." : "View and ban/unban users."}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-xs">Name</th>
              <th className="px-4 py-3 text-xs hidden sm:table-cell">Email</th>
              <th className="px-4 py-3 text-xs">Role</th>
              <th className="px-4 py-3 text-xs">Status</th>
              <th className="px-4 py-3 text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-900 text-sm">{user.name}</td>
                <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell truncate max-w-[180px]">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${roleStyle(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {user.status || "ACTIVE"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1.5 justify-end flex-wrap">
                    {/* Ban / Unban — ADMIN can ban all (except ADMIN), MODERATOR can only ban USERs */}
                    {user.role !== "ADMIN" && (isAdmin || user.role === "USER") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => handleToggleStatus(user)}
                        disabled={statusMutation.isPending}
                      >
                        {user.status === "ACTIVE"
                          ? <><Ban className="h-3.5 w-3.5 mr-1 text-red-500" />Ban</>
                          : <><CheckCircle className="h-3.5 w-3.5 mr-1 text-green-600" />Unban</>}
                      </Button>
                    )}

                    {/* Promote / Demote — ADMIN only */}
                    {isAdmin && user.role !== "ADMIN" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs h-7 px-2 ${user.role === "USER" ? "text-amber-600 border-amber-200 hover:bg-amber-50" : "text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                        onClick={() => handlePromoteRole(user)}
                        disabled={roleMutation.isPending}
                      >
                        {user.role === "USER"
                          ? <><ShieldCheck className="h-3.5 w-3.5 mr-1" />Make Mod</>
                          : <><UserX className="h-3.5 w-3.5 mr-1" />Revoke</>}
                      </Button>
                    )}

                    {/* Delete — ADMIN only */}
                    {isAdmin && user.role !== "ADMIN" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm font-semibold">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
