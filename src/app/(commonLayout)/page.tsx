"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicEvents } from "@/services/event.service";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { 
  ArrowRight, Calendar, MapPin, Tag, Shield, 
  Award, Users, Activity, Star, Quote, Sparkles 
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Calendar, title: "Create & Publish", desc: "Easily schedule public or private gatherings in seconds." },
  { icon: Shield, title: "Gate Approvals", desc: "Manually approve or reject participant requests for private events." },
  { icon: Tag, title: "Secure Ticketing", desc: "Accept payments and issue secure ticket codes for paid events." },
  { icon: Users, title: "Email Invites", desc: "Directly invite users to your events via automated email invitations." },
  { icon: Award, title: "Reviews & Ratings", desc: "Gather real-time feedback and ratings from your event attendees." },
  { icon: Activity, title: "Event Analytics", desc: "Manage participants, track checkouts, and review analytics." },
];

const testimonials = [
  {
    quote: "Planora made hosting our Web3 Developer Summit so easy. The approval gates for private sessions saved us hours of manual vetting.",
    author: "Sarah Jenkins",
    role: "Tech Summit Organizer",
    stars: 5,
  },
  {
    quote: "Getting tickets is smooth, and the payment integration is flawless. I love reading reviews before joining an event.",
    author: "Alex Rivera",
    role: "Developer & Participant",
    stars: 5,
  },
  {
    quote: "We've hosted several paid webinars on Planora. Ticketing is automatic, and managing attendees in the dashboard is highly intuitive.",
    author: "David Kim",
    role: "Corporate Training Lead",
    stars: 5,
  },
];

const stats = [
  { value: "500+", label: "Active Events Hosted" },
  { value: "12k+", label: "Registered Users" },
  { value: "25k+", label: "Tickets Issued" },
  { value: "99.9%", label: "Checkout Success Rate" },
];

export default function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["publicEvents"],
    queryFn: getPublicEvents,
  });

  const featuredEvents = data?.data?.slice(0, 9) || [];
  const heroEvent = featuredEvents[0];

  let heroDesc = "Join exclusive private gatherings or exciting public events. Create, manage, and book in seconds.";
  if (heroEvent) {
    try {
      const parsed = JSON.parse(heroEvent.description);
      heroDesc = parsed.shortDescription || parsed.fullDescription || heroEvent.description;
    } catch {
      heroDesc = heroEvent.description;
    }
  }

  // Duplicate features list to perform seamless infinite horizontal sliding
  const doubledFeatures = [...features, ...features];

  return (
    <div className="w-full space-y-24 pb-20">
      
      {/* SECTION 2: Dynamic Hero Section */}
      <section className="container mx-auto px-4 pt-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-16 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-1 py-1 px-3 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold tracking-wider border border-indigo-500/30">
              <Sparkles className="h-3.5 w-3.5" /> FEATURED EVENT
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              {heroEvent ? heroEvent.title : "Discover Your Next Experience"}
            </h1>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed line-clamp-2 max-w-2xl">
              {heroDesc}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {heroEvent ? (
                <Link href={`/events/${heroEvent.id}`} passHref>
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 font-semibold px-8 cursor-pointer shadow-md">
                    Get Tickets <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/login" passHref>
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 font-semibold px-8 cursor-pointer shadow-md">
                    Get Started Free
                  </Button>
                </Link>
              )}
              <Link href="/events" passHref>
                <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 font-semibold px-8 bg-transparent cursor-pointer">
                  Explore All
                </Button>
              </Link>
            </div>
          </div>
          {/* Decorative background blur element */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
        </div>
      </section>

      {/* SECTION 3: Upcoming Highlights (Sliders/Cards) */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Upcoming Highlights</h2>
            <p className="text-sm text-slate-500 mt-1">Explore some of the most popular scheduled events on Planora.</p>
          </div>
          <Link href="/events" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {isLoading && <div className="flex justify-center py-10"><span className="animate-pulse text-indigo-600 font-medium">Loading events...</span></div>}
        {isError && <p className="text-red-500 font-medium">Failed to load events. Please try again later.</p>}

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-thin scrollbar-thumb-slate-200">
          {featuredEvents.map((event: any) => {
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
              <Card key={event.id} className="min-w-[300px] md:min-w-[350px] flex-shrink-0 snap-start flex flex-col shadow-sm hover:shadow-md transition-all border-slate-200 group overflow-hidden rounded-2xl bg-white">
                <div className="relative h-40 w-full bg-slate-50 overflow-hidden shrink-0 border-b border-slate-100">
                  {imageSrc ? (
                    <img 
                      src={imageSrc} 
                      alt={event.title} 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 flex items-center justify-center">
                      <Calendar className="h-10 w-10 text-indigo-600/30 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow-sm ${
                    event.isPublic ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {event.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>

                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-lg font-bold tracking-tight text-slate-900 line-clamp-1">{event.title}</CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-1">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span>{event.date ? format(new Date(event.date), "PPP") : ""}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow text-xs text-slate-600 leading-relaxed pb-4">
                  <p className="line-clamp-2 min-h-[32px]">{shortDesc}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px]">
                      <Tag className="h-3 w-3" />
                      {event.isPaid ? `$${event.fee}` : "Free"}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px]">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-[100px]">{event.venue}</span>
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 border-t border-slate-50 mt-2">
                  <Link href={`/events/${event.id}`} passHref className="w-full mt-3">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 font-semibold cursor-pointer">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}

          {!isLoading && featuredEvents.length === 0 && (
            <div className="w-full text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <p className="text-slate-500 font-medium">No public events listed yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: Features Section (Infinite horizontal slide using framer-motion) */}
      <section className="space-y-12">
        <div className="container mx-auto px-4 text-center space-y-4 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
            Features Portal
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Everything you need to run high-impact events
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            From creation to ticket bookings and feedback, Planora hosts a suite of powerful management capabilities to support your community gather.
          </p>
        </div>

        {/* Horizontal Infinite Slider */}
        <div className="relative overflow-hidden w-full py-4 bg-white select-none">
          {/* Blur masks on side edges for seamless visual bleed */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 via-slate-50/70 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 via-slate-50/70 to-transparent z-10 pointer-events-none" />
          
          <motion.div
            className="flex gap-6 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              ease: "linear",
              duration: 35,
              repeat: Infinity,
            }}
          >
            {doubledFeatures.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="w-[280px] bg-slate-50/50 p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4 flex-shrink-0 hover:border-indigo-300 transition-colors duration-300 cursor-default"
                >
                  <div className="h-10 w-10 bg-indigo-50 rounded-xl text-indigo-600 flex items-center justify-center font-bold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-950 text-base">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: Stat Banner / App Info Section */}
      <section className="container mx-auto px-4">
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            {stats.map((stat, idx) => (
              <div key={idx} className={`space-y-2 ${idx > 1 ? 'pt-6 lg:pt-0' : 'lg:pt-0'} ${idx === 1 ? 'pt-0 lg:pt-0' : ''}`}>
                <div className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 to-indigo-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <p className="text-xs md:text-sm text-slate-400 font-semibold tracking-wide uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Testimonials Section */}
      <section className="container mx-auto px-4 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Trusted by active organizers and teams
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Read comments and feedback from members of our active host and developer community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <Card key={idx} className="border-slate-200 shadow-sm flex flex-col bg-white rounded-2xl overflow-hidden hover:border-indigo-100 hover:shadow-md transition-all duration-300 relative group">
              <CardContent className="p-6 flex-grow space-y-6">
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(test.stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {/* Quote */}
                <div className="relative">
                  <Quote className="absolute -left-2.5 -top-2.5 h-8 w-8 text-slate-100 rotate-180 z-0 pointer-events-none group-hover:text-indigo-50/80 transition-colors duration-300" />
                  <p className="text-sm text-slate-600 relative z-10 leading-relaxed font-medium">
                    "{test.quote}"
                  </p>
                </div>
                {/* Profile Details */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-indigo-600 text-xs">
                    {test.author[0]}
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-sm font-bold text-slate-900">{test.author}</span>
                    <span className="text-xs text-slate-400 mt-1 font-semibold">{test.role}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}
