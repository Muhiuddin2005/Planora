"use client";

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useQuery } from "@tanstack/react-query";
import { getPublicEvents } from "@/services/event.service";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Calendar, MapPin, Tag, SlidersHorizontal, Sparkles, User } from "lucide-react";
import Image from "next/image";
import { ScrollReveal, Magnetic } from "@/components/shared/ScrollReveal";
import { motion } from "framer-motion";

interface PublicEventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  isPaid: boolean;
  fee: number;
  isPublic: boolean;
  owner?: {
    name: string;
    profilePic?: string;
  };
}

export default function ExploreEventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [organizerQuery, setOrganizerQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "PUBLIC_FREE" | "PUBLIC_PAID" | "PRIVATE_FREE" | "PRIVATE_PAID">("ALL");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const decoded = jwtDecode<{ role: string }>(token);
          if (decoded.role === "ADMIN") {
            setIsAdmin(true);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["publicEvents"],
    queryFn: getPublicEvents,
  });

  const events: PublicEventItem[] = data?.data || [];

  // Filter and search logic
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    const organizerName = event.owner?.name || "";
    const matchesOrganizer = organizerName.toLowerCase().startsWith(organizerQuery.toLowerCase());

    const matchesFilter =
      filterType === "ALL" ||
      (filterType === "PUBLIC_FREE" && event.isPublic && !event.isPaid) ||
      (filterType === "PUBLIC_PAID" && event.isPublic && event.isPaid) ||
      (filterType === "PRIVATE_FREE" && !event.isPublic && !event.isPaid) ||
      (filterType === "PRIVATE_PAID" && !event.isPublic && event.isPaid);

    return matchesSearch && matchesOrganizer && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 text-xs font-semibold text-indigo-700"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Event Portal Discovery
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight"
        >
          Explore Public Gatherings
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base text-slate-500 max-w-xl mx-auto leading-relaxed"
        >
          Find and join highly anticipated virtual conferences, community bootcamps, and local meetups.
        </motion.p>
      </div>

      {/* Search & Filter Toolbar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 shadow-sm flex flex-col space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search events, venues, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200 focus-visible:ring-indigo-600 cursor-pointer"
            />
          </div>
          <div className="relative flex-1 md:max-w-xs">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Filter by Organizer Name..."
              value={organizerQuery}
              onChange={(e) => setOrganizerQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200 focus-visible:ring-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/60 pt-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider pr-2">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </div>
          <Magnetic>
            <Button
              variant={filterType === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("ALL")}
              className={filterType === "ALL" ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer" : "cursor-pointer"}
            >
              All Events
            </Button>
          </Magnetic>
          <Magnetic>
            <Button
              variant={filterType === "PUBLIC_FREE" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("PUBLIC_FREE")}
              className={filterType === "PUBLIC_FREE" ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer" : "cursor-pointer"}
            >
              Public Free
            </Button>
          </Magnetic>
          <Magnetic>
            <Button
              variant={filterType === "PUBLIC_PAID" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("PUBLIC_PAID")}
              className={filterType === "PUBLIC_PAID" ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer" : "cursor-pointer"}
            >
              Public Paid
            </Button>
          </Magnetic>
          {isAdmin && (
            <>
              <Magnetic>
                <Button
                  variant={filterType === "PRIVATE_FREE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("PRIVATE_FREE")}
                  className={filterType === "PRIVATE_FREE" ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer" : "cursor-pointer"}
                >
                  Private Free
                </Button>
              </Magnetic>
              <Magnetic>
                <Button
                  variant={filterType === "PRIVATE_PAID" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("PRIVATE_PAID")}
                  className={filterType === "PRIVATE_PAID" ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer" : "cursor-pointer"}
                >
                  Private Paid
                </Button>
              </Magnetic>
            </>
          )}
        </div>
      </motion.div>

      {/* Grid List Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-5 space-y-4 animate-pulse bg-slate-50">
              <div className="h-6 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-20 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-red-50 border border-red-100 rounded-xl max-w-md mx-auto p-6">
          <p className="text-red-700 font-semibold text-sm">Failed to load public events.</p>
          <p className="text-xs text-red-500 mt-1">Please make sure the backend database and API server are running.</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 max-w-lg mx-auto p-6 space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No matching events found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search terms or filter selection to explore other events.
          </p>
          <Magnetic>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setOrganizerQuery("");
                setFilterType("ALL");
              }}
              className="cursor-pointer"
            >
              Clear Filters
            </Button>
          </Magnetic>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => {
            let shortDesc = "";
            let imageSrc = "";
            try {
              const parsed = JSON.parse(event.description);
              shortDesc = parsed.shortDescription || "";
              imageSrc = parsed.imageUrl || "";
            } catch {
              shortDesc = event.description;
            }

            return (
              <ScrollReveal 
                key={event.id} 
                animation="slide-up" 
                delay={(index % 3) * 0.08}
                threshold={0.1}
              >
                <Card
                  className="flex flex-col shadow-sm hover:shadow-md transition-all duration-300 border-slate-200 hover:border-indigo-100 hover:-translate-y-0.5 bg-white rounded-xl group overflow-hidden view-hover-card h-full"
                >
                  {/* Event Image Banner */}
                  <div className="relative h-44 w-full bg-slate-50 overflow-hidden shrink-0 border-b border-slate-100">
                    {imageSrc ? (
                      <Image 
                        src={imageSrc} 
                        alt={event.title} 
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-indigo-600/30 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow-sm ${
                      event.isPublic ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'
                    }`}>
                      {event.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>

                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-xl font-bold tracking-tight text-slate-900 leading-tight line-clamp-1">
                      {event.title}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-1.5">
                      <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span>
                        {event.date ? format(new Date(event.date), "PPP") : ""} at {event.time}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow text-sm text-slate-600 leading-relaxed pb-4">
                    <p className="line-clamp-2 min-h-[40px]">{shortDesc}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <Tag className="h-3 w-3" />
                        {event.isPaid ? `$${event.fee} USD` : "Free Admission"}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">{event.venue}</span>
                      </span>
                      {event.owner?.name && (
                        <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <User className="h-3 w-3" />
                          Host: {event.owner.name}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 border-t border-slate-50 mt-4">
                    <Link href={`/events/${event.id}`} passHref className="w-full mt-4">
                      <Button className="w-full bg-slate-900 hover:bg-slate-800 shadow-sm flex items-center justify-center gap-1 font-semibold cursor-pointer">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
