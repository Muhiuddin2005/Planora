"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Ban, Trash2, CheckCircle } from "lucide-react";

export default function UserManagementTable() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => (await axiosInstance.get("/users")).data,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => 
      await axiosInstance.patch(`/users/${id}/status`, { status }),
    onSuccess: () => {
      toast.success("User status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: () => {
      toast.error("Failed to update user status.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => 
      await axiosInstance.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete user.");
    }
  });

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user? All their events and reviews will be permanently deleted!")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-4 text-indigo-600 animate-pulse font-semibold">Loading users...</div>;

  const users = data?.data || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-900">User Management</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                <td className="px-6 py-4 text-slate-500">{user.email}</td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">{user.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.status || 'ACTIVE'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  {user.role !== "ADMIN" && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: user.id, status: user.status === "ACTIVE" ? "BANNED" : "ACTIVE" })}
                        disabled={statusMutation.isPending}
                      >
                        {user.status === "ACTIVE" ? <><Ban className="h-4 w-4 mr-1 text-red-500"/> Ban</> : <><CheckCircle className="h-4 w-4 mr-1 text-green-600"/> Unban</>}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
