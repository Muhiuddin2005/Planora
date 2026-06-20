"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "sonner";
import { Mail, Calendar, User, MessageSquare, Trash2, Reply } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

export default function AdminMessagesTable() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["adminMessages"],
    queryFn: async () => (await axiosInstance.get("/messages")).data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => 
      await axiosInstance.delete(`/messages/${id}`),
    onSuccess: () => {
      toast.success("Message deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminMessages"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete message.");
    }
  });

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Delete Message?",
      text: "Are you sure you want to delete this contact message?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
      iconColor: "#f59e0b",
      customClass: {
        popup: "rounded-2xl border border-slate-200 shadow-xl bg-white"
      }
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const handleReply = (email: string) => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
    window.open(gmailUrl, "_blank");
  };

  if (isLoading) return <div className="p-4 text-indigo-600 animate-pulse font-semibold">Loading messages...</div>;

  const messages = data?.data || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <Mail className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-900">Contact Messages</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Sender</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Message</th>
              <th className="px-6 py-4">Received At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {messages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium">
                  No messages received yet.
                </td>
              </tr>
            ) : (
              messages.map((msg: any) => (
                <tr key={msg.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-slate-400" />
                      {msg.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{msg.email}</td>
                  <td className="px-6 py-4 text-slate-700 max-w-xs md:max-w-md break-words">
                    <span className="flex items-start gap-1.5">
                      <MessageSquare className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      {msg.message}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-300" />
                      {msg.createdAt ? format(new Date(msg.createdAt), "PPP p") : "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReply(msg.email)}
                    >
                      <Reply className="h-4 w-4 mr-1 text-indigo-600" /> Reply
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(msg.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
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
