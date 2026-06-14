"use client";

import { useEffect, useState } from "react";
import { fetchMyTickets } from "@/services/ticket.service";
import { toast } from "sonner";
import { Calendar, MapPin, Clock, Search, Ticket, Sparkles, AlertCircle, CheckCircle2, QrCode } from "lucide-react";
import Link from "next/link";

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const res = await fetchMyTickets();
        setTickets(res.data || []);
      } catch (error: any) {
        toast.error("Failed to load your tickets");
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const titleMatch = ticket.event?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const locationMatch = ticket.event?.location?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ticket.event?.venue?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesSearch = titleMatch || locationMatch;
    
    const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading your premium tickets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 min-h-[80vh] bg-slate-50/30 rounded-3xl mt-4">
      {/* Header section with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Ticket className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">My Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            My Event Tickets
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your registered events, access passes, and entry validation codes.
          </p>
        </div>

        {/* Stats Summary Card */}
        <div className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
          <div className="text-center px-4 border-r border-slate-100">
            <p className="text-2xl font-black text-slate-900">{tickets.length}</p>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total</p>
          </div>
          <div className="text-center px-4 border-r border-slate-100">
            <p className="text-2xl font-black text-emerald-600">
              {tickets.filter((t) => t.status === "APPROVED").length}
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase">Active</p>
          </div>
          <div className="text-center px-4">
            <p className="text-2xl font-black text-amber-500">
              {tickets.filter((t) => t.status === "PENDING").length}
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase">Pending</p>
          </div>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center max-w-md mx-auto py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-md animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm">
            <Ticket className="h-8 w-8 animate-bounce" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No tickets found</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            You haven't requested to join or paid for any events yet. Discover amazing public and private events happening around you!
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            Explore Live Events
          </Link>
        </div>
      ) : (
        <>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by event title or location..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 shadow-sm transition-all duration-150"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto shadow-inner">
              {["ALL", "APPROVED", "PENDING", "REJECTED"].map((status) => (
                <button
                  key={status}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-150 ${
                    statusFilter === status
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets Grid */}
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm animate-in fade-in duration-200">
              <p className="font-medium">No tickets match your search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredTickets.map((ticket) => {
                const isApproved = ticket.status === "APPROVED";
                const isPending = ticket.status === "PENDING";
                const isRejected = ticket.status === "REJECTED";

                return (
                  <div
                    key={ticket.id}
                    className="group relative flex flex-col md:flex-row bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200/80 transition-all duration-300 overflow-hidden"
                  >
                    {/* Left Event Details Section */}
                    <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                      <div>
                        {/* Status Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                              isApproved
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : isPending
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-rose-50 text-rose-700 border border-rose-100"
                            }`}
                          >
                            {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {isPending && <Clock className="w-3.5 h-3.5 animate-spin" />}
                            {!isApproved && !isPending && <AlertCircle className="w-3.5 h-3.5" />}
                            {ticket.status}
                          </span>

                          {/* Event Type Badge */}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${ticket.event?.isPaid ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-100 text-slate-600'}`}>
                            {ticket.event?.isPaid ? "PAID PASS" : "FREE ACCESS"}
                          </span>
                        </div>

                        <h2 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
                          {ticket.event?.title || "Planora Event"}
                        </h2>

                        <div className="mt-4 space-y-2.5">
                          <div className="flex items-center text-slate-600 text-sm font-medium">
                            <Calendar className="w-4 h-4 mr-2.5 text-indigo-500 flex-shrink-0" />
                            <span>
                              {ticket.event?.date 
                                ? new Date(ticket.event.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                                : "TBA"
                              }
                            </span>
                          </div>
                          
                          <div className="flex items-center text-slate-600 text-sm font-medium">
                            <Clock className="w-4 h-4 mr-2.5 text-indigo-500 flex-shrink-0" />
                            <span>{ticket.event?.time || "TBA"}</span>
                          </div>

                          <div className="flex items-center text-slate-600 text-sm font-medium">
                            <MapPin className="w-4 h-4 mr-2.5 text-indigo-500 flex-shrink-0" />
                            <span className="line-clamp-1">{ticket.event?.venue || ticket.event?.location || "TBA"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Organizer Details */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span>Ticket ID: {ticket.id.slice(0, 8).toUpperCase()}...</span>
                        <span>Registered {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Perforation Separator */}
                    <div className="hidden md:flex flex-col justify-between items-center relative py-4">
                      <div className="w-6 h-3 bg-slate-50 border-b border-slate-100 rounded-b-full absolute -top-[1px]"></div>
                      <div className="h-full border-r-2 border-dashed border-slate-200"></div>
                      <div className="w-6 h-3 bg-slate-50 border-t border-slate-100 rounded-t-full absolute -bottom-[1px]"></div>
                    </div>

                    {/* Right Stub Section (Secret Code / Access Key) */}
                    <div className="w-full md:w-52 bg-slate-50/80 p-6 flex flex-col justify-center items-center text-center border-t md:border-t-0 md:border-l border-slate-100">
                      <div className="w-full">
                        {isApproved ? (
                          <>
                            <div className="mx-auto w-12 h-12 bg-white rounded-xl shadow-sm border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform duration-200">
                              <QrCode className="w-6 h-6" />
                            </div>
                            <p className="text-[10px] text-indigo-600 uppercase tracking-widest font-black mb-1">
                              Secret Access Code
                            </p>
                            <p className="text-2xl font-black font-mono tracking-[0.15em] text-slate-900 bg-white border border-slate-200/60 rounded-xl py-2 px-3 shadow-inner select-all">
                              {ticket.ticketCode || "------"}
                            </p>
                            <p className="text-[9px] text-slate-400 font-semibold mt-2.5 max-w-[150px] mx-auto leading-normal">
                              Present code or QR code at entry desk.
                            </p>
                          </>
                        ) : isPending ? (
                          <>
                            <div className="mx-auto w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-3 animate-pulse">
                              <Clock className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] text-amber-600 uppercase tracking-widest font-extrabold mb-1">
                              Pass Status
                            </p>
                            <p className="text-sm font-extrabold text-amber-600 py-1.5 px-3 bg-amber-50/50 rounded-lg border border-amber-100 uppercase">
                              Verification Pending
                            </p>
                            <p className="text-[9px] text-slate-400 font-medium mt-3 leading-relaxed max-w-[150px] mx-auto">
                              Your access code will release once the host approves your registration.
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="mx-auto w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-3">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] text-rose-600 uppercase tracking-widest font-extrabold mb-1">
                              Access Status
                            </p>
                            <p className="text-sm font-extrabold text-rose-600 py-1.5 px-3 bg-rose-50/50 rounded-lg border border-rose-100 uppercase">
                              No Access Pass
                            </p>
                            <p className="text-[9px] text-slate-400 font-medium mt-3 leading-relaxed max-w-[150px] mx-auto">
                              Your request has been declined or you have been banned from this event.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
