"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Calendar, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const slides = [
  {
    id: 1,
    badge: "Event Management",
    title: "Create Unforgettable Events",
    subtitle: "Plan, manage, and host world-class events with powerful tools built for modern organizers.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80&auto=format&fit=crop",
    cta: { label: "Start Hosting", href: "/register" },
    secondaryCta: { label: "Explore Events", href: "/events" },
    accent: "from-indigo-900/90 via-slate-900/80",
    badge_color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    icon: Sparkles,
  },
  {
    id: 2,
    badge: "Seamless Ticketing",
    title: "Tickets & Payments Made Simple",
    subtitle: "Sell tickets, accept payments, and manage attendees — all in one beautifully integrated platform.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80&auto=format&fit=crop",
    cta: { label: "Create Event", href: "/events/add" },
    secondaryCta: { label: "Learn More", href: "/about" },
    accent: "from-purple-900/90 via-slate-900/80",
    badge_color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    icon: Calendar,
  },
  {
    id: 3,
    badge: "Community First",
    title: "Grow Your Event Community",
    subtitle: "Invite guests, manage RSVPs, send email invitations and build a loyal attendee community around your brand.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&q=80&auto=format&fit=crop",
    cta: { label: "Join Planora", href: "/register" },
    secondaryCta: { label: "Browse Events", href: "/events" },
    accent: "from-rose-900/90 via-slate-900/80",
    badge_color: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    icon: Users,
  },
];

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

export default function HeroCarousel() {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);

  const current = slides[((page % slides.length) + slides.length) % slides.length];

  const paginate = useCallback((dir: number) => {
    setPage(([p]) => [p + dir, dir]);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const id = setInterval(() => paginate(1), 5000);
    return () => clearInterval(id);
  }, [paginate, isHovered]);

  const goTo = (idx: number) => {
    const dir = idx > page % slides.length ? 1 : -1;
    setPage([idx, dir]);
  };

  const BadgeIcon = current.icon;

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl"
      style={{ height: "clamp(380px, 50vw, 560px)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slide Image + Overlay */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.65, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          <img
            src={current.image}
            alt={current.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${current.accent} to-transparent`} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Slide Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${page}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl space-y-5"
          >
            <motion.span
              className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold tracking-wider border ${current.badge_color}`}
            >
              <BadgeIcon className="h-3.5 w-3.5" />
              {current.badge}
            </motion.span>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              {current.title}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-xl">
              {current.subtitle}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href={current.cta.href}>
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 font-semibold px-6 shadow-md border-0 cursor-pointer">
                  {current.cta.label} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={current.secondaryCta.href}>
                <Button size="lg" variant="outline" className="text-white border-white/25 hover:bg-white/10 font-semibold px-6 bg-transparent cursor-pointer">
                  {current.secondaryCta.label}
                </Button>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot navigation */}
        <div className="flex items-center gap-2 mt-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === ((page % slides.length) + slides.length) % slides.length
                  ? "w-8 bg-white shadow"
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Prev / Next Arrows */}
      <button
        onClick={() => paginate(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all cursor-pointer hover:scale-110"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => paginate(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all cursor-pointer hover:scale-110"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide counter pill */}
      <div className="absolute top-5 right-5 z-20 bg-black/30 backdrop-blur-sm border border-white/10 text-white text-xs font-bold px-3 py-1 rounded-full">
        {((page % slides.length) + slides.length) % slides.length + 1} / {slides.length}
      </div>
    </div>
  );
}
