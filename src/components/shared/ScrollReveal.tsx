"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "scale" | "fall";
  duration?: number;
  delay?: number;
  threshold?: number;
  distance?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  animation = "slide-up",
  duration = 0.6,
  delay = 0,
  threshold = 0.1,
  distance = 30,
  className = "",
}: ScrollRevealProps) {
  const getVariants = () => {
    switch (animation) {
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
      case "slide-up":
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0 },
        };
      case "slide-down":
        return {
          hidden: { opacity: 0, y: -distance },
          visible: { opacity: 1, y: 0 },
        };
      case "slide-left":
        return {
          hidden: { opacity: 0, x: distance },
          visible: { opacity: 1, x: 0 },
        };
      case "slide-right":
        return {
          hidden: { opacity: 0, x: -distance },
          visible: { opacity: 1, x: 0 },
        };
      case "scale":
        return {
          hidden: { opacity: 0, scale: 0.9 },
          visible: { opacity: 1, scale: 1 },
        };
      case "fall":
        return {
          hidden: { opacity: 0, y: -200, rotate: -3 },
          visible: { opacity: 1, y: 0, rotate: 0 },
        };
      default:
        return {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0 },
        };
    }
  };

  const getTransition = () => {
    if (animation === "fall") {
      return {
        type: "spring" as const,
        stiffness: 90,
        damping: 11,
        mass: 1.2,
        delay,
      };
    }
    return { 
      duration, 
      delay, 
      ease: [0.21, 1.02, 0.43, 1.01] as [number, number, number, number]
    };
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      transition={getTransition()}
      variants={getVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface MagneticProps {
  children: React.ReactElement;
  range?: number;
  actionStrength?: number;
  className?: string;
}

export function Magnetic({ children, range = 35, actionStrength = 0.35, className = "" }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    // Check if mouse is within range
    const distance = Math.hypot(distanceX, distanceY);

    if (distance < range) {
      x.set(distanceX * actionStrength);
      y.set(distanceY * actionStrength);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
