// Animation utilities for Progressive Flow

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export const ANIMATION_CONFIGS = {
  lineTransition: {
    duration: 500,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay: 0
  },
  sectionCompletion: {
    duration: 300,
    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    delay: 100
  },
  navigation: {
    duration: 250,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay: 0
  },
  progressBar: {
    duration: 800,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay: 200
  },
  pulse: {
    duration: 1000,
    easing: 'ease-in-out',
    delay: 0
  }
} as const;

// CSS-in-JS animation styles
export const animationStyles = {
  // Line color transition from white to blue
  connectingLine: (isCompleted: boolean, isActive: boolean) => ({
    background: isCompleted 
      ? '#3B82F6' 
      : isActive 
        ? 'linear-gradient(to bottom, #3B82F6 0%, #D1D5DB 100%)'
        : '#D1D5DB',
    transition: `background ${ANIMATION_CONFIGS.lineTransition.duration}ms ${ANIMATION_CONFIGS.lineTransition.easing}`,
    transformOrigin: 'top',
    animation: isCompleted ? 'lineComplete 0.5s ease-out' : undefined
  }),

  // Section indicator animations
  sectionIndicator: (status: string, isActive: boolean) => ({
    transform: isActive ? 'scale(1.1)' : 'scale(1)',
    transition: `all ${ANIMATION_CONFIGS.sectionCompletion.duration}ms ${ANIMATION_CONFIGS.sectionCompletion.easing}`,
    animation: status === 'completed' ? 'sectionComplete 0.6s ease-out' : undefined
  }),

  // Progress bar animation
  progressBar: (percentage: number) => ({
    width: `${percentage}%`,
    transition: `width ${ANIMATION_CONFIGS.progressBar.duration}ms ${ANIMATION_CONFIGS.progressBar.easing} ${ANIMATION_CONFIGS.progressBar.delay}ms`,
    animation: percentage > 0 ? 'progressGrow 0.8s ease-out' : undefined
  }),

  // Navigation transition
  navigationTransition: (isNavigating: boolean) => ({
    opacity: isNavigating ? 0.7 : 1,
    transform: isNavigating ? 'translateY(-2px)' : 'translateY(0)',
    transition: `all ${ANIMATION_CONFIGS.navigation.duration}ms ${ANIMATION_CONFIGS.navigation.easing}`
  }),

  // Pulse animation for active section
  activePulse: {
    animation: 'activePulse 2s infinite ease-in-out'
  },

  // Completion celebration
  completionCelebration: {
    animation: 'completionCelebration 1s ease-out'
  }
};

// Keyframe animations (to be added to CSS)
export const keyframeAnimations = `
  @keyframes lineComplete {
    0% {
      transform: scaleY(0);
      opacity: 0.5;
    }
    50% {
      transform: scaleY(1.1);
      opacity: 0.8;
    }
    100% {
      transform: scaleY(1);
      opacity: 1;
    }
  }

  @keyframes sectionComplete {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    }
    50% {
      transform: scale(1.2);
      box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.3);
    }
    100% {
      transform: scale(1.1);
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }

  @keyframes progressGrow {
    0% {
      width: 0%;
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes activePulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1);
    }
  }

  @keyframes completionCelebration {
    0% {
      transform: scale(1) rotate(0deg);
    }
    25% {
      transform: scale(1.1) rotate(5deg);
    }
    50% {
      transform: scale(1.2) rotate(-5deg);
    }
    75% {
      transform: scale(1.1) rotate(2deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes slideInFromRight {
    0% {
      transform: translateX(20px);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInFromLeft {
    0% {
      transform: translateX(-20px);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes fadeInUp {
    0% {
      transform: translateY(10px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

// Animation trigger functions
export const triggerLineAnimation = (element: HTMLElement, isCompleted: boolean) => {
  if (!element) return;
  
  element.style.animation = 'none';
  element.offsetHeight; // Trigger reflow
  
  if (isCompleted) {
    element.style.animation = 'lineComplete 0.5s ease-out';
  }
};

export const triggerSectionCompletionAnimation = (element: HTMLElement) => {
  if (!element) return;
  
  element.style.animation = 'none';
  element.offsetHeight; // Trigger reflow
  element.style.animation = 'sectionComplete 0.6s ease-out';
};

export const triggerProgressBarAnimation = (element: HTMLElement, percentage: number) => {
  if (!element) return;
  
  element.style.width = '0%';
  element.offsetHeight; // Trigger reflow
  
  setTimeout(() => {
    element.style.width = `${percentage}%`;
  }, 100);
};

// Intersection Observer for scroll-triggered animations
export const createScrollAnimationObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Reduced motion support
export const respectsReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const getAnimationConfig = (configName: keyof typeof ANIMATION_CONFIGS) => {
  if (respectsReducedMotion()) {
    return {
      ...ANIMATION_CONFIGS[configName],
      duration: 0,
      delay: 0
    };
  }
  return ANIMATION_CONFIGS[configName];
};