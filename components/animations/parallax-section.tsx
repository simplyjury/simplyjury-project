'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number; // 0.3 = slow, 0.5 = medium, 0.7 = fast
  className?: string;
}

/**
 * Wrapper component that creates parallax effect on scroll
 * @param speed - Parallax speed multiplier (0.3 = slow background, 0.7 = fast)
 */
export function ParallaxSection({ children, speed = 0.5, className }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Transform scroll progress to Y position
  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * speed]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
