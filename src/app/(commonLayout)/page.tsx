"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicEvents } from "@/services/event.service";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { 
  ArrowRight, Calendar, MapPin, Tag, Shield, 
  Award, Users, Activity, Star, Quote 
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import AnimatedStat from "@/components/shared/AnimatedStat";
import { ScrollReveal, Magnetic } from "@/components/shared/ScrollReveal";
import HeroCarousel from "@/components/shared/HeroCarousel";

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

  const [statsElement, setStatsElement] = useState<HTMLElement | null>(null);

  const { scrollYProgress: statsScrollProgress } = useScroll({
    target: statsElement ? { current: statsElement } : undefined,
    offset: ["start end", "end center"],
  });

  const statsScale = useTransform(statsScrollProgress, [0, 1], [0.85, 1]);
  const statsOpacity = useTransform(statsScrollProgress, [0, 1], [0.3, 1]);
  const statsY = useTransform(statsScrollProgress, [0, 1], [100, 0]);

  const featuredEvents = data?.data?.slice(0, 3) || [];

  // Duplicate features list to perform seamless infinite horizontal sliding
  const doubledFeatures = [...features, ...features];

  return (
    <div className="w-full space-y-24 pb-20 overflow-hidden">
      
      {/* SECTION 2: Hero Carousel */}
      <section className="container mx-auto px-4 pt-8">
        <HeroCarousel />
      </section>

      {/* SECTION 3: Upcoming Highlights (Sliders/Cards) */}
      <section className="container mx-auto px-4">
        <ScrollReveal animation="slide-up">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Upcoming Highlights</h2>
              <p className="text-sm text-slate-500 mt-1">Explore some of the most popular scheduled events on Planora.</p>
            </div>
            <Magnetic>
              <Link href="/events" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
          </div>
        </ScrollReveal>
        
        {isLoading && <div className="flex justify-center py-10"><span className="animate-pulse text-indigo-600 font-medium">Loading events...</span></div>}
        {isError && <p className="text-red-500 font-medium">Failed to load events. Please try again later.</p>}

        <ScrollReveal animation="fade" delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <Card 
                  key={event.id} 
                  className="flex flex-col shadow-sm hover:shadow-md transition-all border-slate-200 group overflow-hidden rounded-2xl bg-white view-hover-card h-full"
                >
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
                    <p className="line-clamp-2">{shortDesc}</p>
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
                  <CardFooter className="pt-0 border-t border-slate-50 mt-auto">
                    <Link href={`/events/${event.id}`} passHref className="w-full mt-3">
                      <Button className="w-full bg-slate-900 hover:bg-slate-800 font-semibold cursor-pointer">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}

            {!isLoading && featuredEvents.length === 0 && (
              <div className="col-span-1 md:col-span-3 text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-slate-500 font-medium">No public events listed yet.</p>
              </div>
            )}
          </div>
        </ScrollReveal>
      </section>

      {/* SECTION 4: Features Section (Infinite horizontal slide using framer-motion) */}
      <section className="space-y-12">
        <ScrollReveal animation="slide-up">
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
        </ScrollReveal>

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
      <section ref={setStatsElement} className="container mx-auto px-4">
        <motion.div
          style={{
            scale: statsScale,
            opacity: statsOpacity,
            y: statsY,
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-slate-800 shadow-2xl relative overflow-hidden"
        >
          {stats.map((stat, idx) => (
            <AnimatedStat key={idx} value={stat.value} label={stat.label} />
          ))}
        </motion.div>
      </section>

      {/* SECTION 6: Testimonials Section */}
      <section className="container mx-auto px-4 space-y-12">
        <ScrollReveal animation="slide-up">
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
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <ScrollReveal key={idx} animation="fall" delay={idx * 0.2} threshold={0.15}>
              <Card className="border-slate-200 shadow-sm flex flex-col bg-white rounded-2xl overflow-hidden hover:border-indigo-100 hover:shadow-md transition-all duration-300 relative group h-full">
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
            </ScrollReveal>
          ))}
        </div>
      </section>

    </div>
  );
}
