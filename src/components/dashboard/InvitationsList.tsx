"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyInvitations, respondToInvitation } from "@/services/invitation.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { Mail, ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function InvitationsList() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["myInvitations"],
    queryFn: getMyInvitations,
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: "ACCEPTED" | "DECLINED" }) => 
      respondToInvitation(id, status),
    onSuccess: (data, variables) => {
      toast.success(`Invitation ${variables.status.toLowerCase()}!`);
      queryClient.invalidateQueries({ queryKey: ["myInvitations"] });
    },
    onError: () => toast.error("Failed to respond to invitation."),
  });

  const handleShowEventDetails = (event: any) => {
    if (!event) return;
    let finalDesc = event.description;
    let finalImg = "";
    try {
      const parsed = JSON.parse(event.description);
      finalDesc = parsed.fullDescription || parsed.shortDescription || event.description;
      finalImg = parsed.imageUrl || "";
    } catch (e) {}

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
      confirmButtonText: "Close",
      confirmButtonColor: "#64748b",
      customClass: {
        popup: "rounded-2xl border border-slate-200 shadow-xl bg-white",
      }
    });
  };

  if (isLoading) return <div className="animate-pulse h-20 bg-slate-100 rounded-xl" />;

  const invitations = data?.data || [];

  if (invitations.length === 0) {
    return <p className="text-sm text-slate-500">You have no pending invitations.</p>;
  }

  return (
    <div className="space-y-4">
      {invitations.map((invite: any) => (
        <Card key={invite.id} className="border-indigo-100 bg-indigo-50/30">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-600" />
                You were invited to {invite.event.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Invited by {invite.inviter?.name || "a Host"} • Event Date: {format(new Date(invite.event.date), "PPP")}
              </p>
            </div>
            
            {invite.status === "PENDING" ? (
              <div className="flex gap-2 items-center">
                <Button 
                  size="icon-sm" 
                  variant="outline" 
                  className="text-slate-600 border-slate-200 hover:bg-slate-50 h-7 w-7 p-0 cursor-pointer"
                  title="View Event Details"
                  onClick={() => handleShowEventDetails(invite.event)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => respondMutation.mutate({ id: invite.id, status: "ACCEPTED" })}
                  disabled={respondMutation.isPending}
                >
                  Accept
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => respondMutation.mutate({ id: invite.id, status: "DECLINED" })}
                  disabled={respondMutation.isPending}
                >
                  Decline
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${
                  invite.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'
                }`}>
                  {invite.status}
                </span>
                {invite.status === "ACCEPTED" && (
                  <Link href={`/events/${invite.eventId}`} passHref>
                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800 flex items-center gap-1">
                      View Event <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
