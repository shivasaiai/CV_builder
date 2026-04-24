/**
 * Design System Index
 * 
 * This file exports all design system components, tokens, and utilities
 * for easy consumption throughout the application.
 */

// Design Tokens
export * from './tokens';

// Theme Provider
export * from './theme-provider';

// Accessibility
export * from './accessibility/hooks';
export * from './accessibility/components';
export * from './accessibility/testing';

// Components
export * from './components/Button';
export * from './components/Input';
export * from './components/Form';
export * from './components/LoadingStates';
export * from './components/Modal';
export * from './components/Notification';
export * from './components/Card';
export * from './components/ResponsiveUtils';
export * from './components/Layout';

// Re-export existing UI components for consistency
export * from '../ui/card';
export * from '../ui/dialog';
export * from '../ui/dropdown-menu';
export * from '../ui/select';
export * from '../ui/textarea';
export * from '../ui/checkbox';
export * from '../ui/radio-group';
export * from '../ui/switch';
export * from '../ui/tabs';
export * from '../ui/accordion';
export * from '../ui/alert';
export * from '../ui/badge';
export * from '../ui/separator';
export * from '../ui/tooltip';
export * from '../ui/popover';
export * from '../ui/sheet';
export * from '../ui/toast';

// Utility functions for design system
export const getColorValue = (colorPath: string) => {
  return `hsl(var(--${colorPath.replace('.', '-')}))`;
};

export const getSpacingValue = (spacing: keyof typeof import('./tokens').spacing) => {
  return import('./tokens').spacing[spacing];
};

export const getBreakpointValue = (breakpoint: keyof typeof import('./tokens').breakpoints) => {
  return import('./tokens').breakpoints[breakpoint];
};

// Design system version
export const DESIGN_SYSTEM_VERSION = '1.0.0';