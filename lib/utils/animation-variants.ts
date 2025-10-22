/**
 * Shared animation variants for consistent motion design across the app
 * Using custom easing curves for smooth, professional animations
 */

// Custom easing curve for smooth, natural motion (cubic-bezier)
export const EASE_CURVE = [0.22, 1, 0.36, 1] as const;

export const animationVariants = {
  // Fade in from bottom with slide up
  fadeInUp: {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE_CURVE }
  },

  // Fade in from left with slide
  fadeInLeft: {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.7, ease: EASE_CURVE }
  },

  // Fade in from right with slide
  fadeInRight: {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.7, ease: EASE_CURVE }
  },

  // Scale in with fade
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: EASE_CURVE }
  },

  // Continuous floating animation
  float: {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Fast fade in (for mobile)
  fadeInUpFast: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: EASE_CURVE }
  }
};

// Stagger configuration for sequential animations
export const staggerConfig = {
  staggerChildren: 0.1,
  delayChildren: 0.2
};

export const staggerConfigFast = {
  staggerChildren: 0.05,
  delayChildren: 0.1
};

// Viewport configuration for intersection observer
export const viewportConfig = {
  once: true, // Animate only once
  amount: 0.3, // Trigger when 30% visible
  margin: "0px 0px -100px 0px" // Start animation slightly before element is visible
};
