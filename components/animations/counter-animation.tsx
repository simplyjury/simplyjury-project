'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface CounterAnimationProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

/**
 * Animated counter that counts up when scrolled into view
 * @param from - Starting number (default: 0)
 * @param to - Target number
 * @param duration - Animation duration in seconds (default: 1.5)
 * @param suffix - Optional suffix like "+" or "h"
 */
export function CounterAnimation({ 
  from = 0, 
  to, 
  duration = 1.5,
  suffix = '',
  className 
}: CounterAnimationProps) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, {
        duration,
        ease: "easeOut"
      });
      return controls.stop;
    }
  }, [inView, count, to, duration]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
