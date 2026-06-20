"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateParticipantStatus } from "@/services/participation.service";
import { deleteEvent, updateEvent } from "@/services/event.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, X, UserPlus } from "lucide-react";
import { sendInvitation } from "@/services/invitation.service";
import Swal from "sweetalert2";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HostedParticipant {
  id: string;
  status: string;
  paymentStatus: string;
  user?: {
    name: string;
    profilePic: string | null;
  };
}

interface HostedEventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  isPublic: boolean;
  isPaid: boolean;
  fee: number;
  participations?: HostedParticipant[];
}

export default function HostedEventsTable({ initialData: events }: { initialData: HostedEventItem[] }) {
  const queryClient = useQueryClient();
  const [editingEvent, setEditingEvent] = useState<HostedEventItem | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEventId, setInviteEventId] = useState<string>("");
  const [inviteEmailInput, setInviteEmailInput] = useState("");

  // Form states for editing
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editIsPaid, setEditIsPaid] = useState(false);
  const [editFee, setEditFee] = useState(0);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => updateParticipantStatus(id, status),
    onSuccess: () => {
      toast.success("Participant status updated!");
      queryClient.invalidateQueries({ queryKey: ["hostedEvents"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      toast.success("Event deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["hostedEvents"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete event");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateEvent(id, payload),
    onSuccess: () => {
      toast.success("Event updated successfully!");
      setEditingEvent(null);
      queryClient.invalidateQueries({ queryKey: ["hostedEvents"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update event");
    }
  });

  const inviteMutation = useMutation({
    mutationFn: (data: { eventId: string; email: string }) => sendInvitation(data),
    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      setInviteModalOpen(false);
      setInviteEmailInput("");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send invitation");
    }
  });

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmailInput.trim()) return toast.error("Please enter a valid email address");
    inviteMutation.mutate({ eventId: inviteEventId, email: inviteEmailInput });
  };

  const handleStatusChange = (participationId: string, newStatus: string) => {
    if (newStatus === "BANNED") {
      Swal.fire({
        title: "Ban Participant?",
        text: "Are you sure you want to ban this participant from the event?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, ban!",
        background: "#0f172a",
        color: "#f8fafc",
        iconColor: "#ef4444",
        customClass: {
          popup: "rounded-2xl border border-slate-800"
        }
      }).then((result) => {
        if (result.isConfirmed) {
          statusMutation.mutate({ id: participationId, status: newStatus });
        }
      });
    } else {
      statusMutation.mutate({ id: participationId, status: newStatus });
    }
  };

  const handleDelete = (eventId: string) => {
    Swal.fire({
      title: "Delete Event?",
      text: "Are you sure you want to delete this event? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete event!",
      background: "#0f172a",
      color: "#f8fafc",
      iconColor: "#f59e0b",
      customClass: {
        popup: "rounded-2xl border border-slate-800"
      }
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(eventId);
      }
    });
  };

  const handleOpenEdit = (event: HostedEventItem) => {
    setEditingEvent(event);
    setEditTitle(event.title || "");
    setEditDescription(event.description || "");
    setEditDate(event.date ? new Date(event.date).toISOString().split('T')[0] : "");
    setEditTime(event.time || "");
    setEditVenue(event.venue || "");
    setEditIsPublic(event.isPublic !== undefined ? event.isPublic : true);
    setEditIsPaid(event.isPaid !== undefined ? event.isPaid : false);
    setEditFee(event.fee || 0);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    const payload = {
      title: editTitle,
      description: editDescription,
      date: new Date(editDate).toISOString(),
      time: editTime,
      venue: editVenue,
      isPublic: editIsPublic,
      isPaid: editIsPaid,
      fee: editIsPaid ? Number(editFee) : 0,
    };

    updateMutation.mutate({ id: editingEvent.id, payload });
  };

  if (!events || events.length === 0) {
    return <p className="text-slate-500 text-sm">You are not hosting any events yet.</p>;
  }

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <div key={event.id} className="border border-slate-200 rounded-lg p-4 relative group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg text-slate-900">{event.title}</h3>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                size="icon-sm" 
                variant="outline" 
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={() => {
                  setInviteEventId(event.id);
                  setInviteModalOpen(true);
                }}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button 
                size="icon-sm" 
                variant="outline" 
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => handleOpenEdit(event)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                size="icon-sm" 
                variant="outline" 
                className={
                  (event.isPaid && Date.now() < new Date(event.date).getTime() + (48 * 60 * 60 * 1000))
                    ? "text-slate-400 border-slate-200 cursor-not-allowed bg-slate-50"
                    : "text-red-600 border-red-200 hover:bg-red-50"
                }
                onClick={() => {
                  const isLocked = event.isPaid && Date.now() < new Date(event.date).getTime() + (48 * 60 * 60 * 1000);
                  if (isLocked) {
                    toast.error("Paid events cannot be deleted until 48 hours after the event date.");
                    return;
                  }
                  handleDelete(event.id);
                }}
                disabled={deleteMutation.isPending}
                title={(event.isPaid && Date.now() < new Date(event.date).getTime() + (48 * 60 * 60 * 1000)) ? "Locked for 48 hours post-event" : "Delete Event"}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {event.participations?.length === 0 ? (
            <p className="text-xs text-slate-500">No participants yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {event.participations?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-slate-900">{p.user?.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                        p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-semibold">{p.paymentStatus}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {/* Rule A: Public Paid Events - NO ACTIONS ALLOWED */}
                      {event.isPublic && event.isPaid ? (
                        <span className="text-xs text-slate-400 italic font-medium">No actions permitted</span>
                      ) : (
                        <>
                          {/* Rule B: Private Events - Approve/Reject for PENDING users */}
                          {!event.isPublic && p.status === 'PENDING' && (
                            <>
                              <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleStatusChange(p.id, "APPROVED")}
                                disabled={statusMutation.isPending}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleStatusChange(p.id, "REJECTED")}
                                disabled={statusMutation.isPending}>
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {/* Rule C: Public Free OR Private Events - Ban for APPROVED users */}
                          {p.status === 'APPROVED' && (!event.isPublic || (event.isPublic && !event.isPaid)) && (
                            <Button size="sm" variant="destructive" 
                              onClick={() => handleStatusChange(p.id, "BANNED")}
                              disabled={statusMutation.isPending}>
                              Ban
                            </Button>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      ))}

      {/* Elegant Glassmorphic Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Edit className="h-5 w-5 text-indigo-600" />
                Edit Event Details
              </h3>
              <button 
                onClick={() => setEditingEvent(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Event Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 bg-white placeholder-slate-400"
                  placeholder="E.g., Web3 Developer Bootcamp"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Description</label>
                <textarea
                  required
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 bg-white placeholder-slate-400"
                  placeholder="Provide an overview of the event sessions..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Date</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Time</label>
                  <input
                    type="text"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 bg-white"
                    placeholder="E.g. 10:00 AM"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Venue / Location</label>
                <input
                  type="text"
                  required
                  value={editVenue}
                  onChange={(e) => setEditVenue(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 bg-white"
                  placeholder="E.g. Grand Ballroom, Dhaka"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-slate-900">Public Access</span>
                  <p className="text-xs text-slate-400">If disabled, the event is private and invite-only.</p>
                </div>
                <input
                  type="checkbox"
                  checked={editIsPublic}
                  onChange={(e) => setEditIsPublic(e.target.checked)}
                  className="h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                />
              </div>

              <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-slate-900">Paid Event</span>
                    <p className="text-xs text-slate-400">If enabled, attendees must pay a registration fee.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsPaid}
                    onChange={(e) => setEditIsPaid(e.target.checked)}
                    disabled={editingEvent?.isPaid} // Locks the checkbox if it is already paid
                    className="h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                {/* Visual indicator for the host */}
                {editingEvent?.isPaid && (
                  <p className="text-[10px] text-amber-600 font-medium bg-amber-50 p-1.5 rounded border border-amber-100">
                    🔒 You cannot change a paid event back to free.
                  </p>
                )}
              </div>

              {editIsPaid && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-150">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Registration Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editFee}
                    onChange={(e) => setEditFee(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 bg-white"
                  />
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingEvent(null)}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NEW ADDITION: Invite Modal --- */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden transform transition-all duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                Invite User to Event
              </h3>
              <button 
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSendInvite} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Invitee Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmailInput}
                  onChange={(e) => setInviteEmailInput(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-white"
                  placeholder="e.g., user@example.com"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  *The user must have a registered Planora account with this email.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setInviteModalOpen(false)}
                  disabled={inviteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={inviteMutation.isPending}
                >
                  {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
