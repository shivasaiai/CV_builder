/**
 * Design System Tokens
 * 
 * This file contains all design tokens for the resume builder application.
 * All tokens are defined using HSL values for better color manipulation.
 */

// Color Tokens
export const colors = {
  // Primary Brand Colors
  primary: {
    50: 'hsl(217, 91%, 95%)',
    100: 'hsl(217, 91%, 90%)',
    200: 'hsl(217, 91%, 80%)',
    300: 'hsl(217, 91%, 70%)',
    400: 'hsl(217, 91%, 60%)',
    500: 'hsl(217, 91%, 50%)', // Main brand color
    600: 'hsl(217, 91%, 45%)',
    700: 'hsl(217, 91%, 40%)',
    800: 'hsl(217, 91%, 35%)',
    900: 'hsl(217, 91%, 30%)',
  },

  // Neutral Colors
  neutral: {
    0: 'hsl(0, 0%, 100%)',
    50: 'hsl(0, 0%, 98%)',
    100: 'hsl(210, 40%, 96%)',
    200: 'hsl(214, 32%, 91%)',
    300: 'hsl(213, 27%, 84%)',
    400: 'hsl(215, 20%, 65%)',
    500: 'hsl(215, 16%, 47%)',
    600: 'hsl(215, 19%, 35%)',
    700: 'hsl(215, 25%, 27%)',
    800: 'hsl(217, 33%, 17%)',
    900: 'hsl(220, 13%, 18%)',
    950: 'hsl(224, 71%, 4%)',
  },

  // Semantic Colors
  semantic: {
    success: {
      50: 'hsl(138, 76%, 97%)',
      100: 'hsl(141, 84%, 93%)',
      500: 'hsl(142, 76%, 36%)',
      600: 'hsl(142, 72%, 29%)',
      900: 'hsl(140, 100%, 14%)',
    },
    warning: {
      50: 'hsl(48, 100%, 96%)',
      100: 'hsl(48, 96%, 89%)',
      500: 'hsl(38, 92%, 50%)',
      600: 'hsl(32, 95%, 44%)',
      900: 'hsl(15, 86%, 30%)',
    },
    error: {
      50: 'hsl(0, 86%, 97%)',
      100: 'hsl(0, 93%, 94%)',
      500: 'hsl(0, 84%, 60%)',
      600: 'hsl(0, 72%, 51%)',
      900: 'hsl(0, 63%, 31%)',
    },
    info: {
      50: 'hsl(204, 100%, 97%)',
      100: 'hsl(204, 94%, 94%)',
      500: 'hsl(199, 89%, 48%)',
      600: 'hsl(200, 98%, 39%)',
      900: 'hsl(202, 100%, 24%)',
    },
  },

  // Special Colors
  special: {
    gradient: {
      primary: 'linear-gradient(135deg, hsl(217, 91%, 60%), hsl(217, 91%, 50%))',
      secondary: 'linear-gradient(135deg, hsl(217, 91%, 95%), hsl(217, 91%, 85%))',
      success: 'linear-gradient(135deg, hsl(142, 76%, 36%), hsl(142, 72%, 29%))',
      warning: 'linear-gradient(135deg, hsl(38, 92%, 50%), hsl(32, 95%, 44%))',
    },
  },
} as const;

// Typography Tokens
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    display: ['Inter', 'system-ui', 'sans-serif'],
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['6rem', { lineHeight: '1' }],
    '9xl': ['8rem', { lineHeight: '1' }],
  },

  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// Spacing Tokens
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const;

// Border Radius Tokens
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

// Shadow Tokens
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 hsl(0 0% 0% / 0.05)',
  base: '0 1px 3px 0 hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1)',
  md: '0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -2px hsl(0 0% 0% / 0.1)',
  lg: '0 10px 15px -3px hsl(0 0% 0% / 0.1), 0 4px 6px -4px hsl(0 0% 0% / 0.1)',
  xl: '0 20px 25px -5px hsl(0 0% 0% / 0.1), 0 8px 10px -6px hsl(0 0% 0% / 0.1)',
  '2xl': '0 25px 50px -12px hsl(0 0% 0% / 0.25)',
  inner: 'inset 0 2px 4px 0 hsl(0 0% 0% / 0.05)',
  
  // Colored shadows
  primary: '0 10px 25px -3px hsl(217 91% 60% / 0.3)',
  success: '0 10px 25px -3px hsl(142 76% 36% / 0.3)',
  warning: '0 10px 25px -3px hsl(38 92% 50% / 0.3)',
  error: '0 10px 25px -3px hsl(0 84% 60% / 0.3)',
} as const;

// Animation Tokens
export const animations = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },

  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Breakpoint Tokens
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-Index Tokens
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: '2.25rem',
      md: '2.5rem',
      lg: '2.75rem',
      xl: '3rem',
    },
    padding: {
      sm: '0.5rem 0.75rem',
      md: '0.5rem 1rem',
      lg: '0.75rem 1.5rem',
      xl: '1rem 2rem',
    },
  },

  input: {
    height: {
      sm: '2.25rem',
      md: '2.5rem',
      lg: '2.75rem',
    },
    padding: {
      sm: '0.5rem 0.75rem',
      md: '0.5rem 0.75rem',
      lg: '0.75rem 1rem',
    },
  },

  card: {
    padding: {
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
    },
  },
} as const;

// Theme configuration
export const themes = {
  light: {
    background: colors.neutral[0],
    foreground: colors.neutral[900],
    card: colors.neutral[0],
    cardForeground: colors.neutral[900],
    popover: colors.neutral[0],
    popoverForeground: colors.neutral[900],
    primary: colors.primary[500],
    primaryForeground: colors.neutral[0],
    secondary: colors.neutral[100],
    secondaryForeground: colors.neutral[900],
    muted: colors.neutral[100],
    mutedForeground: colors.neutral[500],
    accent: colors.primary[500],
    accentForeground: colors.neutral[0],
    destructive: colors.semantic.error[500],
    destructiveForeground: colors.neutral[0],
    border: colors.neutral[200],
    input: colors.neutral[200],
    ring: colors.primary[500],
  },

  dark: {
    background: colors.neutral[900],
    foreground: colors.neutral[50],
    card: colors.neutral[900],
    cardForeground: colors.neutral[50],
    popover: colors.neutral[900],
    popoverForeground: colors.neutral[50],
    primary: colors.primary[400],
    primaryForeground: colors.neutral[0],
    secondary: colors.neutral[800],
    secondaryForeground: colors.neutral[50],
    muted: colors.neutral[800],
    mutedForeground: colors.neutral[400],
    accent: colors.primary[400],
    accentForeground: colors.neutral[0],
    destructive: colors.semantic.error[600],
    destructiveForeground: colors.neutral[50],
    border: colors.neutral[800],
    input: colors.neutral[800],
    ring: colors.primary[400],
  },
} as const;

// Accessibility tokens
export const accessibility = {
  focusRing: {
    width: '2px',
    offset: '2px',
    color: 'hsl(var(--ring))',
  },
  
  contrast: {
    minimum: 4.5, // WCAG AA
    enhanced: 7, // WCAG AAA
  },
  
  motion: {
    // Respect user's motion preferences
    reduceMotion: '@media (prefers-reduced-motion: reduce)',
    noPreference: '@media (prefers-reduced-motion: no-preference)',
  },
  
  screenReader: {
    only: {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    },
  },
} as const;

// Interactive states
export const interactiveStates = {
  hover: {
    scale: '1.02',
    translateY: '-2px',
    shadow: 'var(--shadow-hover)',
    transition: 'all 0.2s ease-in-out',
  },
  
  active: {
    scale: '0.98',
    translateY: '0px',
    transition: 'all 0.1s ease-in-out',
  },
  
  focus: {
    ring: '2px solid hsl(var(--ring))',
    ringOffset: '2px',
    outline: 'none',
  },
  
  disabled: {
    opacity: '0.5',
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
} as const;

// Export all tokens as a single object for easy access
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints,
  zIndex,
  components,
  themes,
  accessibility,
  interactiveStates,
} as const;

export type DesignTokens = typeof designTokens;
export type ColorTokens = typeof colors;
export type TypographyTokens = typeof typography;
export type SpacingTokens = typeof spacing;
export type AccessibilityTokens = typeof accessibility;
export type InteractiveStates = typeof interactiveStates;