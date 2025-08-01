import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Responsive Utility Components
 * 
 * Components and utilities for responsive design implementation
 */

// Breakpoint hook
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = React.useState<string>('xs');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1536) setBreakpoint('2xl');
      else if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else if (width >= 640) setBreakpoint('sm');
      else if (width >= 475) setBreakpoint('xs');
      else setBreakpoint('xs');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    is2Xl: breakpoint === '2xl',
    isMobile: ['xs', 'sm'].includes(breakpoint),
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint),
  };
};

// Responsive Container Component
interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
}

export const ResponsiveContainer = React.forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ 
    className, 
    maxWidth = 'xl', 
    padding = 'md', 
    center = true, 
    children, 
    ...props 
  }, ref) => {
    const maxWidthClasses = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      full: 'max-w-full',
    };

    const paddingClasses = {
      none: '',
      sm: 'px-4 sm:px-6',
      md: 'px-4 sm:px-6 lg:px-8',
      lg: 'px-6 sm:px-8 lg:px-12',
      xl: 'px-8 sm:px-12 lg:px-16',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          center && 'mx-auto',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ResponsiveContainer.displayName = 'ResponsiveContainer';

// Responsive Grid Component
interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  autoFit?: boolean;
  minItemWidth?: string;
}

export const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ 
    className, 
    cols = { xs: 1, sm: 2, md: 3, lg: 4 }, 
    gap = 'md',
    autoFit = false,
    minItemWidth = '250px',
    children, 
    ...props 
  }, ref) => {
    const gapClasses = {
      none: 'gap-0',
      sm: 'gap-2 sm:gap-3',
      md: 'gap-4 sm:gap-6',
      lg: 'gap-6 sm:gap-8',
      xl: 'gap-8 sm:gap-10',
    };

    const gridColsClasses = Object.entries(cols).map(([breakpoint, colCount]) => {
      const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
      return `${prefix}grid-cols-${colCount}`;
    }).join(' ');

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          autoFit 
            ? `grid-cols-[repeat(auto-fit,minmax(${minItemWidth},1fr))]`
            : gridColsClasses,
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ResponsiveGrid.displayName = 'ResponsiveGrid';

// Responsive Stack Component
interface ResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: {
    xs?: 'row' | 'col';
    sm?: 'row' | 'col';
    md?: 'row' | 'col';
    lg?: 'row' | 'col';
    xl?: 'row' | 'col';
    '2xl'?: 'row' | 'col';
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export const ResponsiveStack = React.forwardRef<HTMLDivElement, ResponsiveStackProps>(
  ({ 
    className, 
    direction = { xs: 'col', md: 'row' }, 
    gap = 'md',
    align = 'start',
    justify = 'start',
    children, 
    ...props 
  }, ref) => {
    const gapClasses = {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    };

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };

    const directionClasses = Object.entries(direction).map(([breakpoint, dir]) => {
      const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
      return `${prefix}flex-${dir}`;
    }).join(' ');

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClasses,
          gapClasses[gap],
          alignClasses[align],
          justifyClasses[justify],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ResponsiveStack.displayName = 'ResponsiveStack';

// Show/Hide Component based on breakpoints
interface ShowHideProps {
  children: React.ReactNode;
  above?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  below?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  only?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const ShowHide: React.FC<ShowHideProps> = ({ 
  children, 
  above, 
  below, 
  only 
}) => {
  let className = '';

  if (above) {
    className = `hidden ${above}:block`;
  } else if (below) {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const belowIndex = breakpoints.indexOf(below);
    const hideBreakpoint = breakpoints[belowIndex + 1];
    className = hideBreakpoint ? `block ${hideBreakpoint}:hidden` : 'block';
  } else if (only) {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const onlyIndex = breakpoints.indexOf(only);
    const prevBreakpoint = breakpoints[onlyIndex - 1];
    const nextBreakpoint = breakpoints[onlyIndex + 1];
    
    let classes = ['hidden'];
    if (onlyIndex === 0) {
      classes.push(`${only}:block`);
      if (nextBreakpoint) classes.push(`${nextBreakpoint}:hidden`);
    } else {
      if (prevBreakpoint) classes.push(`${only}:block`);
      if (nextBreakpoint) classes.push(`${nextBreakpoint}:hidden`);
    }
    className = classes.join(' ');
  }

  return <div className={className}>{children}</div>;
};

// Responsive Text Component
interface ResponsiveTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  size?: {
    xs?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    sm?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    md?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    lg?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    xl?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    '2xl'?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  };
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: {
    xs?: 'left' | 'center' | 'right';
    sm?: 'left' | 'center' | 'right';
    md?: 'left' | 'center' | 'right';
    lg?: 'left' | 'center' | 'right';
    xl?: 'left' | 'center' | 'right';
    '2xl'?: 'left' | 'center' | 'right';
  };
}

export const ResponsiveText = React.forwardRef<HTMLElement, ResponsiveTextProps>(
  ({ 
    as: Component = 'p', 
    className, 
    size = { xs: 'base' }, 
    weight = 'normal',
    align = { xs: 'left' },
    children, 
    ...props 
  }, ref) => {
    const sizeClasses = Object.entries(size).map(([breakpoint, textSize]) => {
      const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
      return `${prefix}text-${textSize}`;
    }).join(' ');

    const alignClasses = Object.entries(align).map(([breakpoint, textAlign]) => {
      const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
      return `${prefix}text-${textAlign}`;
    }).join(' ');

    const weightClasses = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          sizeClasses,
          alignClasses,
          weightClasses[weight],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
ResponsiveText.displayName = 'ResponsiveText';

// Touch-friendly component wrapper
interface TouchFriendlyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  minTouchTarget?: boolean;
}

export const TouchFriendly = React.forwardRef<HTMLDivElement, TouchFriendlyProps>(
  ({ className, children, minTouchTarget = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'touch:select-none',
        minTouchTarget && 'touch:min-h-[44px] touch:min-w-[44px]',
        'touch:flex touch:items-center touch:justify-center',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
TouchFriendly.displayName = 'TouchFriendly';