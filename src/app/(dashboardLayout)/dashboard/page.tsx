"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import HostedEventsTable from "@/components/dashboard/HostedEventsTable";
import JoinedEventsList from "@/components/dashboard/JoinedEventsList";
import InvitationsList from "@/components/dashboard/InvitationsList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
    } else {
      const timer = setTimeout(() => {
        setMounted(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [router]);

  const { data: hostedData, isLoading: hostedLoading } = useQuery({
    queryKey: ["hostedEvents"],
    queryFn: async () => (await axiosInstance.get("/events/hosted")).data,
    enabled: mounted,
  });

  const { data: joinedData, isLoading: joinedLoading } = useQuery({
    queryKey: ["myRequests"],
    queryFn: async () => (await axiosInstance.get("/participations/my-requests")).data,
    enabled: mounted,
  });

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7 text-indigo-600" />
            Your Dashboard
          </h1>
          <p className="text-slate-500 text-sm">Manage your hosted events and track your tickets.</p>
        </div>
        <Link href="/dashboard/create-event" passHref>
          <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
            <PlusCircle className="h-4 w-4" />
            Host New Event
          </Button>
        </Link>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-xl border shadow-sm border-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Events You Are Hosting</h2>
          {hostedLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-lg" />)}
            </div>
          ) : (
            <HostedEventsTable initialData={hostedData?.data || []} />
          )}
        </section>

        <div className="space-y-8">
          <section className="bg-white p-6 rounded-xl border shadow-sm border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Pending Invitations</h2>
            <InvitationsList />
          </section>

          <section className="bg-white p-6 rounded-xl border shadow-sm border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Your Tickets &amp; Requests</h2>
            {joinedLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-lg" />)}
              </div>
            ) : (
              <JoinedEventsList initialData={joinedData?.data || []} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

