"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { joinEventRequest, initiatePayment } from "@/services/participation.service";
import { getPublicEvents } from "@/services/event.service";
import { format } from "date-fns";
import { Calendar, MapPin, AlertCircle, ShieldAlert, ArrowLeft, Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import ReviewSection from "@/components/events/ReviewSection";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";

export default function EventDetailsClient({ event: initialEvent }: { event: any }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const eventId = params.id as string;
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    
    if (!token) {
      toast.error("Please log in to view event details.");
      setTimeout(() => {
        router.push(`/login?redirect=${pathname}`);
      }, 0);
      return;
    }

    try {
      const decoded = jwtDecode<{ userId: string; role: string }>(token);
      setCurrentUserId(decoded.userId);
      setCurrentUserRole(decoded.role);
    } catch (error) {
      console.error("Failed to decode token", error);
      setTimeout(() => {
        router.push(`/login?redirect=${pathname}`);
      }, 0);
    }
  }, [pathname, router]);

  const { data: eventData, isLoading, isError } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => (await axiosInstance.get(`/events/${eventId}`)).data,
    initialData: initialEvent ? { data: initialEvent } : undefined,
  });

  const { data: participationsData } = useQuery({
    queryKey: ["myParticipations", currentUserId],
    queryFn: async () => (await axiosInstance.get("/participations/my-requests")).data,
    enabled: !!currentUserId,
  });

  const { data: allEventsData } = useQuery({
    queryKey: ["publicEvents"],
    queryFn: getPublicEvents,
  });

  const userParticipation = participationsData?.data?.find((p: any) => p.eventId === eventId);

  const isBanned = participationsData?.data?.some(
    (p: any) => p.eventId === eventId && p.status === "BANNED"
  );

  const joinMutation = useMutation({
    mutationFn: () => joinEventRequest(eventId),
    onSuccess: () => {
      toast.success("Successfully joined/requested!");
      if (eventData?.data?.isPublic && eventData?.data?.isPaid) {
        paymentMutation.mutate();
      } else {
        router.push("/dashboard");
      }
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to join event"),
  });

  const paymentMutation = useMutation({
    mutationFn: () => initiatePayment(eventId),
    onSuccess: (res) => {
      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    },
    onError: () => toast.error("Payment initiation failed"),
  });

  if (isLoading && !initialEvent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <span className="text-sm font-medium text-slate-500">Loading event details...</span>
      </div>
    );
  }

  if (isError || !eventData?.data) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 px-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Event Not Found</h2>
        <p className="text-sm text-slate-500">The event you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.push("/")} className="bg-indigo-600 hover:bg-indigo-700">Go to Homepage</Button>
      </div>
    );
  }

  if (isBanned) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-sm">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Access Restricted</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          You have been restricted from viewing or participating in this event by the host.
        </p>
        <div className="pt-4">
          <Button onClick={() => router.push("/events")} className="bg-slate-900 hover:bg-slate-800 shadow-md">
            Browse Other Events
          </Button>
        </div>
      </div>
    );
  }

  const event = eventData.data;

  // Description parsing
  let finalDescription = event.description;
  let bannerImage = "";
  let category = "General";
  try {
    const parsed = JSON.parse(event.description);
    finalDescription = parsed.fullDescription || parsed.shortDescription || event.description;
    bannerImage = parsed.imageUrl || "";
    category = parsed.category || "General";
  } catch {
    // Description is raw text
  }

  // Filter related events matching category
  const allEvents = allEventsData?.data || [];
  const relatedEvents = allEvents
    .filter((e: any) => e.id !== eventId && e.isPublic)
    .filter((e: any) => {
      let eCategory = "General";
      try {
        eCategory = JSON.parse(e.description).category || "General";
      } catch {}
      return eCategory === category;
    })
    .slice(0, 3);

  // Fallback to general public events if none share category
  const fallbackRelatedEvents = relatedEvents.length > 0
    ? relatedEvents
    : allEvents.filter((e: any) => e.id !== eventId && e.isPublic).slice(0, 3);

  const renderActionButton = () => {
    if (currentUserRole === "ADMIN") {
      return (
        <Button size="lg" className="w-full bg-slate-200 text-slate-500 cursor-not-allowed shadow-none" disabled>
          You are Admin
        </Button>
      );
    }

    if (currentUserId === event.ownerId) {
      return (
        <Button size="lg" className="w-full bg-slate-200 text-slate-500 cursor-not-allowed shadow-none" disabled>
          You are the Host
        </Button>
      );
    }

    if (userParticipation) {
      if (userParticipation.status === "PENDING") {
        return (
          <Button size="lg" className="w-full bg-slate-200 text-slate-500 cursor-not-allowed shadow-none" disabled>
            Request Pending...
          </Button>
        );
      }
      
      if (userParticipation.status === "APPROVED" && userParticipation.paymentStatus === "UNPAID" && event.isPaid) {
        return (
          <Button 
            size="lg" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md" 
            onClick={() => paymentMutation.mutate()} 
            disabled={paymentMutation.isPending}
          >
            {paymentMutation.isPending ? "Initiating Checkout..." : `Pay $${event.fee} Now`}
          </Button>
        );
      }

      if (userParticipation.status === "APPROVED" && (!event.isPaid || userParticipation.paymentStatus === "PAID")) {
        return (
          <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-default" disabled>
             Joined Successfully
          </Button>
        );
      }
      
      if (userParticipation.status === "REJECTED" || userParticipation.status === "BANNED") {
         return (
          <Button size="lg" className="w-full bg-red-100 text-red-600 cursor-not-allowed shadow-none" disabled>
            Access Restricted
          </Button>
         );
      }
    }

    if (event.isPublic && !event.isPaid) {
      return (
        <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md" onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending}>
          {joinMutation.isPending ? "Joining..." : "Join for Free"}
        </Button>
      );
    } else if (event.isPublic && event.isPaid) {
      return (
        <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md" onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending || paymentMutation.isPending}>
          {joinMutation.isPending || paymentMutation.isPending ? "Initiating Checkout..." : `Pay $${event.fee} & Join`}
        </Button>
      );
    } else if (!event.isPublic && !event.isPaid) {
      return (
        <Button size="lg" className="w-full bg-slate-900 hover:bg-slate-800 shadow-md" onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending}>
          {joinMutation.isPending ? "Requesting..." : "Request to Join"}
        </Button>
      );
    } else if (!event.isPublic && event.isPaid) {
      return (
        <Button size="lg" className="w-full bg-slate-900 hover:bg-slate-800 shadow-md" onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending}>
          {joinMutation.isPending ? "Requesting..." : `Request to Join (Pay $${event.fee} Later)`}
        </Button>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Back Button */}
      <Link href="/events" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 gap-1 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Explore
      </Link>
 
      {/* Main Banner Image */}
      <div className="h-64 sm:h-96 w-full rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 relative">
        {bannerImage ? (
          <Image
            src={bannerImage}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 flex items-center justify-center">
            <Calendar className="h-20 w-20 text-indigo-500/30" />
          </div>
        )}
      </div>
 
      {/* Event Header */}
      <div className="border-b border-slate-200 pb-8 mb-8 space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {event.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4.5 w-4.5 text-indigo-600" />
            <span>{event.date ? format(new Date(event.date), "PPP") : ""} at {event.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4.5 w-4.5 text-indigo-600" />
            <span>{event.venue}</span>
          </div>
        </div>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-bold text-slate-950 mb-3">About This Event</h2>
            <p className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
              {finalDescription}
            </p>
          </div>
        </div>
 
        {/* Sidebar Info & Action Button */}
        <div className="space-y-6 w-full">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Pricing & Visibility</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  {event.isPaid ? `$${event.fee} USD` : "Free"}
                </span>
                <span className="bg-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  {event.isPublic ? "Public" : "Private"}
                </span>
                <span className="bg-pink-100 text-pink-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {category}
                </span>
              </div>
            </div>
 
            <hr className="border-slate-200" />
 
            <div className="space-y-4">
              {renderActionButton()}
              
              {!event.isPublic && (
                <div className="flex gap-2 items-start text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-amber-600 mt-0.5" />
                  <p>
                    <strong>Private Event:</strong> Your join request will go to the host for approval before you are admitted.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
 
      {/* SECTION: Related Events */}
      {fallbackRelatedEvents.length > 0 && (
        <div className="border-t border-slate-200 pt-10 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Related Events</h2>
            <p className="text-sm text-slate-500 mt-1">Discover other exciting events happening on Planora.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {fallbackRelatedEvents.map((e: any) => {
              let eShort = "";
              let eImg = "";
              let eCategory = "General";
              try {
                const parsed = JSON.parse(e.description);
                eShort = parsed.shortDescription || "";
                eImg = parsed.imageUrl || "";
                eCategory = parsed.category || "General";
              } catch {
                eShort = e.description;
              }
 
              return (
                <Card key={e.id} className="border-slate-200 shadow-sm flex flex-col bg-white overflow-hidden group hover:border-indigo-100 hover:shadow-md transition-all rounded-xl">
                  <div className="relative h-32 w-full bg-slate-50 overflow-hidden shrink-0 border-b border-slate-100">
                    {eImg ? (
                      <Image
                        src={eImg}
                        alt={e.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-indigo-600/30" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-bold text-slate-900 line-clamp-1">{e.title}</CardTitle>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-pink-700 bg-pink-50 px-2 py-0.5 rounded w-fit mt-1">
                      {eCategory}
                    </span>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow text-xs text-slate-500">
                    <p className="line-clamp-2">{eShort}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 mt-auto">
                    <Link href={`/events/${e.id}`} className="w-full">
                      <Button size="sm" className="w-full bg-slate-900 hover:bg-slate-800 text-xs font-semibold cursor-pointer">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
 
      <ReviewSection eventId={eventId} />
    </div>
  );
}
