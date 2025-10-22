'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FloatingElementProps {
  children: ReactNode;
  duration?: number;
  yOffset?: number;
  className?: string;
}

/**
 * Creates a continuous floating animation effect
 * @param duration - Animation cycle duration in seconds (default: 3)
 * @param yOffset - How far to float up/down in pixels (default: 20)
 */
export function FloatingElement({ 
  children, 
  duration = 3, 
  yOffset = 20,
  className 
}: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [0, -yOffset, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
