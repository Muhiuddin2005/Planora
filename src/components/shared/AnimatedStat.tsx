"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate, motion, AnimatePresence } from "framer-motion";

interface AnimatedStatProps {
  value: string;
  label: string;
  duration?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotate: number;
  isSquare: boolean;
}

const CELEBRATION_COLORS = [
  "#6366f1", // Indigo
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
];

export default function CelebratingStat({ value, label, duration = 1.8 }: AnimatedStatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  
  const [displayValue, setDisplayValue] = useState("0");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [countTrigger, setCountTrigger] = useState(0);

  // Parse value once
  const match = value.match(/^([\d.]+)(.*)$/);
  const numericValue = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const isDecimal = match ? match[1].includes(".") : false;

  // Run the counter animation
  useEffect(() => {
    if (!isInView && countTrigger === 0) return;

    const controls = animate(0, numericValue, {
      duration: duration,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate: (latest) => {
        if (isDecimal) {
          setDisplayValue(latest.toFixed(1) + suffix);
        } else {
          setDisplayValue(Math.floor(latest).toString() + suffix);
        }
      },
    });

    return () => controls.stop();
  }, [isInView, countTrigger, numericValue, suffix, isDecimal, duration]);

  // Handle magnetic-like coordinates inside the card container on hover
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) * 0.15;
    const y = (e.clientY - top - height / 2) * 0.15;
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  // Trigger confetti celebration explosion
  const handleHoverStart = () => {
    setIsHovered(true);
    setCountTrigger((prev) => prev + 1); // Re-run count-up!
    
    // Spawn 15 colorful particles shooting outwards
    const newParticles = Array.from({ length: 18 }).map((_, i) => {
      const angle = (i / 18) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const distance = 40 + Math.random() * 80;
      return {
        id: Date.now() + i + Math.random(),
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)],
        size: 5 + Math.random() * 7,
        rotate: Math.random() * 360,
        isSquare: Math.random() > 0.5,
      };
    });

    setParticles(newParticles);
    
    // Clear particles after animation finishes
    setTimeout(() => {
      setParticles([]);
    }, 1000);
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: coords.x,
        y: coords.y,
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      className="relative flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-800 bg-slate-950/40 backdrop-blur-md hover:bg-slate-900/60 hover:border-indigo-500/80 transition-colors duration-300 select-none cursor-pointer h-full group"
    >
      {/* Background neon hover pulse glow */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.25, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-indigo-500 rounded-2xl blur-2xl z-0 pointer-events-none"
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* Confetti Explosion Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute z-30 pointer-events-none"
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: 0,
            scale: [1, 0.8, 0],
            rotate: p.rotate + 180,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isSquare ? "2px" : "50%",
            left: "50%",
            top: "35%",
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
            boxShadow: `0 0 10px ${p.color}`,
          }}
        />
      ))}

      {/* Glowing Counter Number */}
      <div className="relative z-10 flex items-center justify-center h-16">
        <motion.span
          ref={numberRef}
          animate={{
            scale: isHovered ? 1.15 : 1,
            textShadow: isHovered 
              ? "0 0 25px rgba(99, 102, 241, 0.9), 0 0 50px rgba(236, 72, 153, 0.5)" 
              : "0 0 0px rgba(99,102,241,0)",
          }}
          className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-pink-400 transition-all duration-300 tabular-nums drop-shadow-[0_2px_8px_rgba(99,102,241,0.25)]"
        >
          {displayValue}
        </motion.span>
      </div>

      {/* Label Text */}
      <motion.p
        animate={{
          y: isHovered ? 2 : 0,
          color: isHovered ? "#f8fafc" : "#94a3b8",
        }}
        className="relative z-10 text-xs md:text-sm font-bold tracking-wider uppercase text-center mt-3 group-hover:text-white transition-colors duration-300"
      >
        {label}
      </motion.p>
    </motion.div>
  );
}
