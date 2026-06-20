"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Ticket, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { initiatePayment } from "@/services/participation.service";
import Swal from "sweetalert2";

interface ParticipationItem {
  id: string;
  status: string;
  paymentStatus: string;
  eventId: string;
  ticketCode?: string | null;
  event?: {
    title: string;
    date: string;
    time: string;
    venue: string;
    isPublic: boolean;
    isPaid: boolean;
    fee: number;
    description: string;
  };
}

export default function JoinedEventsList({ initialData }: { initialData: ParticipationItem[] }) {
  const paymentMutation = useMutation({
    mutationFn: (eventId: string) => initiatePayment(eventId),
    onSuccess: (res) => {
      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    },
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

  if (!initialData || initialData.length === 0) {
    return <p className="text-slate-500 text-sm">You haven&apos;t requested to join any events yet.</p>;
  }

  return (
    <div className="space-y-4">
      {initialData.map((p) => (
        <Card key={p.id} className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Ticket className="h-4.5 w-4.5 text-indigo-600" />
                  {p.event?.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {p.event?.date ? format(new Date(p.event.date), "PPP") : ""} at {p.event?.time}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  📍 {p.event?.venue}
                </p>
                {p.status === 'APPROVED' && p.ticketCode && (
                  <p className="text-xs text-slate-600 font-semibold mt-1">
                    🎟️ Ticket Code: <span className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono text-[11px]">{p.ticketCode}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2 items-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    p.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                    p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {p.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    p.paymentStatus === 'PAID' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {p.paymentStatus}
                  </span>
                  <Button 
                    size="icon-xs" 
                    variant="outline" 
                    className="text-slate-600 border-slate-200 hover:bg-slate-50 h-6 w-6 p-0 cursor-pointer"
                    title="View Event Details"
                    onClick={() => handleShowEventDetails(p.event)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                {/* --- NEW ADDITION: Pay Now Button for Approved & Unpaid Private Events --- */}
                {p.status === 'APPROVED' && p.paymentStatus === 'UNPAID' && p.event?.isPaid && (
                  <Button 
                    size="sm" 
                    className="bg-indigo-600 hover:bg-indigo-700 mt-1 h-7 text-xs"
                    onClick={() => paymentMutation.mutate(p.eventId)}
                    disabled={paymentMutation.isPending}
                  >
                    {paymentMutation.isPending ? "Processing..." : `Pay $${p.event.fee} Now`}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
