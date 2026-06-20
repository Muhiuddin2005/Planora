"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import { deleteEvent } from "@/services/event.service";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Calendar, MapPin, Tag, Eye, Trash2, PlusCircle, LayoutDashboard, Sliders } from "lucide-react";
import { format } from "date-fns";
import Swal from "sweetalert2";

interface HostedEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  isPublic: boolean;
  isPaid: boolean;
  fee: number;
}

export default function ManageEventsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      toast.error("Please sign in to manage your events");
      router.push(`/login?redirect=${pathname}`);
    } else {
      setMounted(true);
    }
  }, [router, pathname]);

  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["manageHostedEvents"],
    queryFn: async () => {
      const res = await axiosInstance.get("/events/hosted");
      return res.data?.data || [];
    },
    enabled: mounted,
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      toast.success("Event deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["manageHostedEvents"] });
      queryClient.invalidateQueries({ queryKey: ["hostedEvents"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete event");
    }
  });

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

  const parseDescription = (desc: string) => {
    try {
      const parsed = JSON.parse(desc);
      return parsed.shortDescription || parsed.fullDescription || desc;
    } catch {
      return desc;
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const events: HostedEvent[] = responseData || [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Sliders className="h-7 w-7 text-indigo-600" />
            Manage Hosted Events
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review your scheduled events, verify tickets, or release event slots.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/events/add">
            <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 shadow-sm font-semibold cursor-pointer">
              <PlusCircle className="h-4 w-4" />
              Add Event
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-2 font-semibold">
              <LayoutDashboard className="h-4 w-4" />
              Full Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {isError && (
        <p className="text-red-500 font-semibold text-center py-10 bg-red-50 border border-red-100 rounded-xl">
          Failed to retrieve hosted events. Please try again later.
        </p>
      )}

      {!isError && events.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 max-w-lg mx-auto p-6 space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">You are not hosting any events</h3>
          <p className="text-xs text-slate-500">
            Get started by scheduling and publishing a public or private gathering.
          </p>
          <Link href="/events/add">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              Host an Event
            </Button>
          </Link>
        </div>
      )}

      {/* Grid for Mobile & Table for Desktop */}
      {!isError && events.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">Event Details</TableHead>
                  <TableHead className="font-bold text-slate-700">Date &amp; Time</TableHead>
                  <TableHead className="font-bold text-slate-700">Venue</TableHead>
                  <TableHead className="font-bold text-slate-700">Admission Fee</TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id} className="hover:bg-slate-50/40 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-base">{event.title}</span>
                        <span className="text-xs text-slate-400 line-clamp-1 mt-1 max-w-xs">
                          {parseDescription(event.description)}
                        </span>
                        <span className={`inline-block w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1.5 ${
                          event.isPublic ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {event.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 font-medium">
                      {event.date ? format(new Date(event.date), "PPP") : ""} at {event.time}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 font-medium">{event.venue}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs font-semibold">
                        <Tag className="h-3 w-3 text-indigo-500" />
                        {event.isPaid ? `$${event.fee}` : "Free"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/events/${event.id}`}>
                        <Button size="sm" variant="outline" className="text-slate-600 hover:bg-slate-50">
                          <Eye className="h-4 w-4 mr-1 text-slate-400" /> View
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(event.id)}
                        disabled={deleteMutation.isPending}
                        className="cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Grid View */}
          <div className="grid grid-cols-1 gap-6 md:hidden">
            {events.map((event) => (
              <Card key={event.id} className="border-slate-200 shadow-sm flex flex-col bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-bold text-slate-900">{event.title}</CardTitle>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      event.isPublic ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {event.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {parseDescription(event.description)}
                  </p>
                </CardHeader>
                <CardContent className="pb-3 text-xs text-slate-600 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span>{event.date ? format(new Date(event.date), "PPP") : ""} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                      <Tag className="h-3 w-3 text-indigo-500" />
                      {event.isPaid ? `$${event.fee}` : "Free"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <Link href={`/events/${event.id}`} className="w-full">
                    <Button size="sm" variant="outline" className="w-full text-slate-600">
                      <Eye className="h-4 w-4 mr-1 text-slate-400" /> View
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(event.id)}
                    disabled={deleteMutation.isPending}
                    className="w-full cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
