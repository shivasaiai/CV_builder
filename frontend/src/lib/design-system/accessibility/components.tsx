import * as React from 'react';
import { cn } from '@/lib/utils';
import { useFocusTrap, useAnnouncer, useReducedMotion } from './hooks';

/**
 * Accessibility Components
 * 
 * Reusable components that enhance accessibility and WCAG compliance
 */

// Skip Link Component
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ 
  href, 
  children, 
  className 
}) => (
  <a
    href={href}
    className={cn(
      'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
      'bg-primary text-primary-foreground px-4 py-2 rounded-md',
      'focus:z-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      className
    )}
  >
    {children}
  </a>
);

// Focus Trap Component
interface FocusTrapProps {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ 
  children, 
  isActive = true, 
  className,
  as: Component = 'div'
}) => {
  const trapRef = useFocusTrap(isActive);

  return (
    <Component ref={trapRef} className={className}>
      {children}
    </Component>
  );
};

// Screen Reader Only Component
interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ 
  children, 
  as: Component = 'span' 
}) => (
  <Component className="sr-only">
    {children}
  </Component>
);

// Live Region Component
interface LiveRegionProps {
  children: React.ReactNode;
  priority?: 'off' | 'polite' | 'assertive';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  priority = 'polite',
  atomic = true,
  relevant = 'all',
  className,
}) => (
  <div
    className={cn('sr-only', className)}
    aria-live={priority}
    aria-atomic={atomic}
    aria-relevant={relevant}
  >
    {children}
  </div>
);

// Landmark Component
interface LandmarkProps {
  children: React.ReactNode;
  role: 'banner' | 'navigation' | 'main' | 'complementary' | 'contentinfo' | 'search' | 'form';
  label?: string;
  labelledBy?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Landmark: React.FC<LandmarkProps> = ({
  children,
  role,
  label,
  labelledBy,
  className,
  as: Component = 'div',
}) => (
  <Component
    role={role}
    aria-label={label}
    aria-labelledby={labelledBy}
    className={className}
  >
    {children}
  </Component>
);

// Heading Component with proper hierarchy
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Heading: React.FC<HeadingProps> = ({ 
  level, 
  children, 
  className,
  id 
}) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Component id={id} className={className}>
      {children}
    </Component>
  );
};

// Accessible Button Component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
}

export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    children, 
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText = 'Loading...',
    disabled,
    className,
    ...props 
  }, ref) => {
    const prefersReducedMotion = useReducedMotion();

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-describedby={loading ? 'loading-description' : undefined}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'transition-colors duration-200',
          !prefersReducedMotion && 'transform transition-transform duration-200 active:scale-95',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          },
          {
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <ScreenReaderOnly id="loading-description">
              {loadingText}
            </ScreenReaderOnly>
          </>
        )}
        {children}
      </button>
    );
  }
);
AccessibleButton.displayName = 'AccessibleButton';

// Accessible Form Field Component
interface AccessibleFormFieldProps {
  children: React.ReactNode;
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  children,
  label,
  error,
  helperText,
  required = false,
  className,
}) => {
  const fieldId = React.useId();
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={fieldId}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            id: fieldId,
            'aria-describedby': [
              error ? errorId : null,
              helperText ? helperId : null,
            ].filter(Boolean).join(' ') || undefined,
            'aria-invalid': error ? 'true' : 'false',
            'aria-required': required,
            ...child.props,
          });
        }
        return child;
      })}
      
      {error && (
        <div
          id={errorId}
          className="text-sm text-destructive flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <p
          id={helperId}
          className="text-sm text-muted-foreground"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

// Progress Indicator Component
interface ProgressIndicatorProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const progressId = React.useId();

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex justify-between text-sm">
          <label htmlFor={progressId}>{label}</label>
          {showValue && (
            <span aria-live="polite">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div
        id={progressId}
        className="w-full bg-secondary rounded-full h-2 overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        <div
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Accessible Tab Component
interface AccessibleTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const AccessibleTabs: React.FC<AccessibleTabsProps> = ({
  children,
  defaultValue,
  value,
  onValueChange,
  className,
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || '');
  const tabsId = React.useId();

  const handleTabChange = (newValue: string) => {
    if (value === undefined) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  const currentValue = value !== undefined ? value : activeTab;

  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            tabsId,
            currentValue,
            onValueChange: handleTabChange,
            ...child.props,
          });
        }
        return child;
      })}
    </div>
  );
};

// Accessible Alert Component
interface AccessibleAlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const AccessibleAlert: React.FC<AccessibleAlertProps> = ({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  className,
}) => {
  const alertId = React.useId();
  const titleId = title ? `${alertId}-title` : undefined;

  const variantStyles = {
    info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-800',
    error: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-800',
    success: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100 dark:border-green-800',
  };

  const icons = {
    info: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  };

  return (
    <div
      id={alertId}
      role="alert"
      aria-labelledby={titleId}
      className={cn(
        'relative flex items-start gap-3 rounded-lg border p-4',
        variantStyles[variant],
        className
      )}
    >
      <div className="shrink-0 mt-0.5" aria-hidden="true">
        {icons[variant]}
      </div>
      
      <div className="flex-1 min-w-0">
        {title && (
          <h3 id={titleId} className="font-medium mb-1">
            {title}
          </h3>
        )}
        <div className="text-sm">
          {children}
        </div>
      </div>
      
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:hover:bg-white/5"
          aria-label="Dismiss alert"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};