"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyInvitations, respondToInvitation } from "@/services/invitation.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

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
              <div className="flex gap-2">
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
