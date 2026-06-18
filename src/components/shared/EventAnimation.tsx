"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Pre-compute particle random positions at module level (runs once on import)
const PARTICLE_DATA = Array.from({ length: 18 }, (_, i) => ({
  width: 3 + Math.random() * 5,
  height: 3 + Math.random() * 5,
  left: 10 + Math.random() * 80,
  top: 10 + Math.random() * 80,
  colorIndex: i % 3,
}));

export default function EventAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<SVGSVGElement>(null);
  const ticketRef = useRef<SVGSVGElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const floatingCardsRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Master timeline
      const master = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Initial glow pulse
      master.fromTo(
        glowRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 1.2, ease: "elastic.out(1, 0.5)" },
        0
      );

      // Calendar entrance with elastic bounce
      master.fromTo(
        calendarRef.current,
        { y: 60, opacity: 0, scale: 0.3, rotation: -15 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1.4,
          ease: "elastic.out(1, 0.6)",
        },
        0.2
      );

      // Ticket slides in from the right
      master.fromTo(
        ticketRef.current,
        { x: 80, opacity: 0, rotation: 20 },
        {
          x: 0,
          opacity: 1,
          rotation: -6,
          duration: 1.2,
          ease: "elastic.out(1, 0.5)",
        },
        0.5
      );

      // Floating event cards stagger in
      if (floatingCardsRef.current) {
        const cards = floatingCardsRef.current.children;
        master.fromTo(
          cards,
          { y: 40, opacity: 0, scale: 0.8 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.7)",
          },
          0.6
        );
      }

      // Text reveal
      if (textRef.current) {
        const lines = textRef.current.children;
        master.fromTo(
          lines,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.12,
            ease: "power2.out",
          },
          0.8
        );
      }

      // Particles burst
      if (particlesRef.current) {
        const particles = particlesRef.current.children;
        master.fromTo(
          particles,
          { opacity: 0, scale: 0 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: { each: 0.05, from: "random" },
            ease: "back.out(2)",
          },
          0.4
        );
      }

      // ─── Continuous Animations ───

      // Calendar gentle float
      gsap.to(calendarRef.current, {
        y: -8,
        duration: 2.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 1.5,
      });

      // Ticket subtle rock
      gsap.to(ticketRef.current, {
        rotation: -10,
        y: -5,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 2,
      });

      // Glow pulse
      gsap.to(glowRef.current, {
        scale: 1.15,
        opacity: 0.6,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      // Floating cards gentle sway
      if (floatingCardsRef.current) {
        Array.from(floatingCardsRef.current.children).forEach((card, i) => {
          gsap.to(card, {
            y: -6 + i * 2,
            x: (i % 2 === 0 ? 3 : -3),
            rotation: (i % 2 === 0 ? 2 : -2),
            duration: 2.5 + i * 0.5,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: 1.5 + i * 0.3,
          });
        });
      }

      // Particles twinkle
      if (particlesRef.current) {
        Array.from(particlesRef.current.children).forEach((p) => {
          gsap.to(p, {
            opacity: 0.2 + Math.random() * 0.5,
            scale: 0.6 + Math.random() * 0.8,
            duration: 1.5 + Math.random() * 2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: Math.random() * 2,
          });
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] flex items-center justify-center select-none overflow-hidden"
    >
      {/* Background Glow */}
      <div
        ref={glowRef}
        className="absolute w-72 h-72 rounded-full opacity-0"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.08) 50%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Sparkle Particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {PARTICLE_DATA.map((p, i) => {
          const colors = ["#818cf8", "#a78bfa", "#f0abfc"];
          const shadows = [
            "0 0 8px rgba(129,140,248,0.6)",
            "0 0 8px rgba(167,139,250,0.6)",
            "0 0 8px rgba(240,171,252,0.6)",
          ];
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${p.width}px`,
                height: `${p.height}px`,
                left: `${p.left}%`,
                top: `${p.top}%`,
                background: colors[p.colorIndex],
                boxShadow: shadows[p.colorIndex],
              }}
            />
          );
        })}
      </div>

      {/* Main Calendar SVG */}
      <svg
        ref={calendarRef}
        viewBox="0 0 120 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute w-40 h-40 z-10"
        style={{ left: "20%", top: "18%" }}
      >
        {/* Calendar Body */}
        <rect
          x="4"
          y="20"
          width="112"
          height="100"
          rx="14"
          fill="url(#calGrad)"
          stroke="#6366f1"
          strokeWidth="2"
        />
        {/* Header Bar */}
        <rect x="4" y="20" width="112" height="32" rx="14" fill="#6366f1" />
        <rect x="4" y="38" width="112" height="14" fill="#6366f1" />
        {/* Calendar Pins */}
        <rect x="30" y="12" width="6" height="20" rx="3" fill="#a5b4fc" />
        <rect x="84" y="12" width="6" height="20" rx="3" fill="#a5b4fc" />
        {/* Day Grid */}
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4, 5, 6].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={14 + col * 14}
              y={60 + row * 12}
              width="8"
              height="8"
              rx="2"
              fill={
                row === 1 && col === 3
                  ? "#818cf8"
                  : row === 2 && col === 5
                  ? "#a78bfa"
                  : "rgba(255,255,255,0.06)"
              }
            />
          ))
        )}
        {/* Active Day Indicator */}
        <circle cx="52" cy="76" r="5" fill="#6366f1" opacity="0.9" />
        <circle
          cx="52"
          cy="76"
          r="8"
          fill="none"
          stroke="#818cf8"
          strokeWidth="1"
          opacity="0.4"
        />
        <defs>
          <linearGradient
            id="calGrad"
            x1="60"
            y1="20"
            x2="60"
            y2="120"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1e293b" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
        </defs>
      </svg>

      {/* Ticket SVG */}
      <svg
        ref={ticketRef}
        viewBox="0 0 150 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute w-36 h-20 z-10"
        style={{ right: "12%", top: "55%" }}
      >
        {/* Ticket shape with notch cutouts */}
        <path
          d="M12 0h126a12 12 0 0112 12v18a8 8 0 010 16v22a12 12 0 01-12 12H12A12 12 0 010 68V46a8 8 0 010-16V12A12 12 0 0112 0z"
          fill="url(#tickGrad)"
          stroke="#818cf8"
          strokeWidth="1.5"
        />
        {/* Dashed perforation line */}
        <line
          x1="105"
          y1="8"
          x2="105"
          y2="72"
          stroke="#4f46e5"
          strokeWidth="1"
          strokeDasharray="4 3"
          opacity="0.5"
        />
        {/* Ticket content */}
        <rect x="16" y="14" width="40" height="5" rx="2.5" fill="#6366f1" opacity="0.7" />
        <rect x="16" y="24" width="70" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
        <rect x="16" y="32" width="55" height="3" rx="1.5" fill="rgba(255,255,255,0.1)" />
        {/* Barcode */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect
            key={i}
            x={16 + i * 8}
            y="46"
            width={i % 2 === 0 ? 4 : 2.5}
            height="20"
            rx="1"
            fill={i % 2 === 0 ? "#6366f1" : "#818cf8"}
            opacity={0.5 + i * 0.05}
          />
        ))}
        {/* QR-like area */}
        <rect x="112" y="18" width="26" height="26" rx="4" fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="0.8" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <rect
              key={`qr-${r}-${c}`}
              x={116 + c * 7}
              y={22 + r * 7}
              width="4"
              height="4"
              rx="1"
              fill={(r + c) % 2 === 0 ? "#818cf8" : "transparent"}
            />
          ))
        )}
        <rect x="112" y="50" width="26" height="3" rx="1.5" fill="rgba(255,255,255,0.1)" />
        <rect x="118" y="58" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.07)" />
        <defs>
          <linearGradient
            id="tickGrad"
            x1="75"
            y1="0"
            x2="75"
            y2="80"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1e1b4b" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Mini Event Cards */}
      <div ref={floatingCardsRef} className="absolute inset-0 pointer-events-none">
        {/* Card 1: Event notification */}
        <div
          className="absolute flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-sm border border-indigo-500/20 rounded-xl px-3.5 py-2.5 shadow-lg"
          style={{ right: "8%", top: "18%" }}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-white leading-tight">New Event 🎉</p>
            <p className="text-[9px] text-slate-400">Tech Summit 2025</p>
          </div>
        </div>

        {/* Card 2: Attendees count */}
        <div
          className="absolute flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm border border-purple-500/20 rounded-xl px-3 py-2 shadow-lg"
          style={{ left: "5%", top: "62%" }}
        >
          <div className="w-7 h-7 rounded-lg bg-purple-600/20 flex items-center justify-center shrink-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a78bfa"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold text-purple-300">248</p>
            <p className="text-[9px] text-slate-500">Attendees</p>
          </div>
        </div>

        {/* Card 3: Rating */}
        <div
          className="absolute flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm border border-amber-500/20 rounded-xl px-3 py-2 shadow-lg"
          style={{ left: "15%", top: "85%" }}
        >
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="#fbbf24"
                stroke="#fbbf24"
                strokeWidth="1"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <p className="text-[10px] font-bold text-amber-300">4.9</p>
        </div>

        {/* Card 4: Live badge */}
        <div
          className="absolute flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-sm border border-emerald-500/20 rounded-full px-3 py-1.5 shadow-lg"
          style={{ right: "15%", top: "78%" }}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Live Now</p>
        </div>
      </div>

      {/* Text Content */}
      <div
        ref={textRef}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center w-full px-6 z-20"
      >
        <h3 className="text-lg font-extrabold text-white tracking-tight leading-tight">
          Plan. Host. Experience.
        </h3>
        <p className="text-[11px] text-slate-400 mt-1.5 max-w-[220px] mx-auto leading-relaxed">
          Create unforgettable events with powerful management tools
        </p>
      </div>

      {/* Decorative rings */}
      <div
        className="absolute w-48 h-48 rounded-full border border-indigo-500/10"
        style={{ left: "25%", top: "20%", transform: "translate(-50%, -50%)" }}
      />
      <div
        className="absolute w-64 h-64 rounded-full border border-purple-500/5"
        style={{ left: "30%", top: "25%", transform: "translate(-50%, -50%)" }}
      />
    </div>
  );
}
