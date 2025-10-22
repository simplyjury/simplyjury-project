'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { staggerConfig, viewportConfig } from '@/lib/utils/animation-variants';

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  fast?: boolean;
}

/**
 * Container that staggers the animation of its children
 * Children should be motion components to receive the animation
 */
export function StaggerContainer({ children, className, fast = false }: StaggerContainerProps) {
  const config = fast ? { staggerChildren: 0.05 } : staggerConfig;
  
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={viewportConfig}
      variants={{
        animate: {
          transition: config
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
