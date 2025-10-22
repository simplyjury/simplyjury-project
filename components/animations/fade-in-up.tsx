'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { animationVariants, viewportConfig } from '@/lib/utils/animation-variants';

interface FadeInUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  fast?: boolean;
}

/**
 * Reusable component that fades in and slides up when scrolled into view
 * @param delay - Optional delay before animation starts (in seconds)
 * @param fast - Use faster animation for mobile
 */
export function FadeInUp({ children, delay = 0, className, fast = false }: FadeInUpProps) {
  const variant = fast ? animationVariants.fadeInUpFast : animationVariants.fadeInUp;
  
  return (
    <motion.div
      initial={variant.initial}
      whileInView={variant.animate}
      viewport={viewportConfig}
      transition={{ ...variant.transition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
