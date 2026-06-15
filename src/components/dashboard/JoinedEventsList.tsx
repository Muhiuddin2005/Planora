"use client";

import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button"; // Added Button
import { useMutation } from "@tanstack/react-query"; // Added useMutation
import { initiatePayment } from "@/services/participation.service"; // Added payment service

interface ParticipationItem {
  id: string;
  status: string;
  paymentStatus: string;
  eventId: string; // Added eventId
  event?: {
    title: string;
    date: string;
    time: string;
    venue: string;
    isPaid: boolean; // Added isPaid
    fee: number; // Added fee
  };
}

export default function JoinedEventsList({ initialData }: { initialData: ParticipationItem[] }) {
  // --- NEW ADDITION: Payment Mutation ---
  const paymentMutation = useMutation({
    mutationFn: (eventId: string) => initiatePayment(eventId),
    onSuccess: (res) => {
      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    },
  });

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
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
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
