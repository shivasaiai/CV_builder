import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Card variants
const cardVariants = cva(
  [
    'rounded-lg border bg-card text-card-foreground shadow-sm',
    'transition-all duration-200 ease-in-out',
  ],
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: 'shadow-md hover:shadow-lg',
        outlined: 'border-2 border-border shadow-none',
        ghost: 'border-transparent shadow-none bg-transparent',
        gradient: 'bg-gradient-to-br from-card to-card/80 border-border/50',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-md hover:-translate-y-1 active:translate-y-0 active:shadow-sm',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
    },
  }
);

// Card Component
interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : 'div';
    
    if (asChild) {
      return <>{props.children}</>;
    }

    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant, size, interactive }), className)}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

// Card Header
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// Card Title
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// Card Description
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground leading-relaxed', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// Card Content
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pb-4', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// Card Footer
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4 border-t border-border/50', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Feature Card Component
interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'gradient';
  interactive?: boolean;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ 
    className, 
    icon, 
    title, 
    description, 
    action, 
    variant = 'default',
    interactive = false,
    ...props 
  }, ref) => (
    <Card
      ref={ref}
      variant={variant}
      interactive={interactive}
      className={cn('group', className)}
      {...props}
    >
      <CardHeader>
        {icon && (
          <div className="mb-2 text-primary group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
        )}
        <CardTitle className="group-hover:text-primary transition-colors duration-200">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action && (
        <CardFooter>
          {action}
        </CardFooter>
      )}
    </Card>
  )
);
FeatureCard.displayName = 'FeatureCard';

// Stats Card Component
interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  change?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'elevated';
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ 
    className, 
    label, 
    value, 
    change, 
    icon, 
    variant = 'default',
    ...props 
  }, ref) => (
    <Card
      ref={ref}
      variant={variant}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <CardContent className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold">
              {value}
            </p>
            {change && (
              <div className="flex items-center text-xs">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-1',
                    {
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': change.trend === 'up',
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': change.trend === 'down',
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200': change.trend === 'neutral',
                    }
                  )}
                >
                  {change.trend === 'up' && '↗'}
                  {change.trend === 'down' && '↘'}
                  {change.trend === 'neutral' && '→'}
                  {change.value}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
);
StatsCard.displayName = 'StatsCard';

// Action Card Component
interface ActionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  status?: 'default' | 'success' | 'warning' | 'error';
}

const ActionCard = React.forwardRef<HTMLDivElement, ActionCardProps>(
  ({ 
    className, 
    title, 
    description, 
    actions, 
    variant = 'default',
    status = 'default',
    ...props 
  }, ref) => {
    const statusColors = {
      default: '',
      success: 'border-l-4 border-l-green-500',
      warning: 'border-l-4 border-l-yellow-500',
      error: 'border-l-4 border-l-red-500',
    };

    return (
      <Card
        ref={ref}
        variant={variant}
        className={cn(statusColors[status], className)}
        {...props}
      >
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
        <CardFooter className="justify-end space-x-2">
          {actions}
        </CardFooter>
      </Card>
    );
  }
);
ActionCard.displayName = 'ActionCard';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  FeatureCard,
  StatsCard,
  ActionCard,
};