"use client";

import { useEffect, useState, useRef } from "react";
import { ReactLenis } from "lenis/react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState<"default" | "hover" | "view" | "drag">("default");
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const trailRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress for the top bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    setMounted(true);

    // Detect touch device to disable custom cursor (good for UX)
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0
      );
    };
    checkTouchDevice();

    // Mouse movement listener for custom cursor
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Hover listener to change cursor styles
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if target or parent is interactive
      const isInteractive = 
        target.closest("a") || 
        target.closest("button") || 
        target.closest('[role="button"]') ||
        target.closest("input") ||
        target.closest("select") ||
        target.closest("textarea") ||
        target.closest(".interactive-element");

      const isViewCard = target.closest(".view-hover-card");

      if (isViewCard) {
        setCursorType("view");
      } else if (isInteractive) {
        setCursorType("hover");
      } else {
        setCursorType("default");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false,
      }}
    >
      {/* Premium top scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 origin-left z-[9999]"
        style={{ scaleX }}
      />

      {/* Interactive Custom Cursor */}
      {!isTouchDevice && (
        <>
          {/* Main Calendar Cursor Badge */}
          <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[99999] flex items-center justify-center bg-white rounded border border-indigo-200 shadow-md select-none"
            animate={{
              x: mousePosition.x - (cursorType === "hover" ? 12 : 8),
              y: mousePosition.y - (cursorType === "hover" ? 12 : 8),
              scale: cursorType === "view" ? 0 : 1,
              width: cursorType === "hover" ? 24 : 16,
              height: cursorType === "hover" ? 24 : 16,
              rotate: cursorType === "hover" ? 15 : 0,
            }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-indigo-600 transition-all duration-300"
              style={{
                width: cursorType === "hover" ? 14 : 9,
                height: cursorType === "hover" ? 14 : 9,
              }}
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
            </svg>
          </motion.div>

          {/* Magnetic/Delayed Outer Circle Ring (Rotating dashed radar) */}
          <motion.div
            ref={trailRef}
            className="fixed top-0 left-0 rounded-full border border-dashed border-indigo-500 pointer-events-none z-[99998] flex items-center justify-center font-semibold text-[10px] tracking-widest uppercase text-white overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.2)] bg-indigo-500/0"
            animate={{
              x: mousePosition.x - (cursorType === "hover" ? 24 : cursorType === "view" ? 36 : 16),
              y: mousePosition.y - (cursorType === "hover" ? 24 : cursorType === "view" ? 36 : 16),
              width: cursorType === "hover" ? 48 : cursorType === "view" ? 72 : 32,
              height: cursorType === "hover" ? 48 : cursorType === "view" ? 72 : 32,
              backgroundColor: cursorType === "view" ? "rgba(79, 70, 229, 0.9)" : "rgba(99, 102, 241, 0)",
              borderColor: cursorType === "hover" ? "rgba(99, 102, 241, 0.8)" : cursorType === "view" ? "rgba(79, 70, 229, 1)" : "rgba(99, 102, 241, 0.4)",
              rotate: 360,
            }}
            transition={{
              x: { type: "spring", stiffness: 250, damping: 25, mass: 0.8 },
              y: { type: "spring", stiffness: 250, damping: 25, mass: 0.8 },
              width: { type: "spring", stiffness: 200, damping: 20 },
              height: { type: "spring", stiffness: 200, damping: 20 },
              rotate: { repeat: Infinity, duration: 12, ease: "linear" },
            }}
          >
            <AnimatePresence>
              {cursorType === "view" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="font-bold text-[9px] text-white tracking-widest"
                >
                  View
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {children}
    </ReactLenis>
  );
}
