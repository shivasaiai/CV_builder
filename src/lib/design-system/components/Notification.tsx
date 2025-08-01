import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// Notification variants
const notificationVariants = cva(
  [
    'relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg',
    'transition-all duration-300 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-background text-foreground border-border',
        ],
        success: [
          'bg-green-50 text-green-900 border-green-200',
          'dark:bg-green-950 dark:text-green-100 dark:border-green-800',
        ],
        error: [
          'bg-red-50 text-red-900 border-red-200',
          'dark:bg-red-950 dark:text-red-100 dark:border-red-800',
        ],
        warning: [
          'bg-yellow-50 text-yellow-900 border-yellow-200',
          'dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-800',
        ],
        info: [
          'bg-blue-50 text-blue-900 border-blue-200',
          'dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800',
        ],
      },
      size: {
        sm: 'text-sm p-3',
        md: 'text-sm p-4',
        lg: 'text-base p-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Icon mapping
const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  default: Info,
};

// Notification Component
interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  closable?: boolean;
  onClose?: () => void;
  action?: React.ReactNode;
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({
    className,
    variant = 'default',
    size,
    title,
    description,
    icon,
    showIcon = true,
    closable = true,
    onClose,
    action,
    children,
    ...props
  }, ref) => {
    const IconComponent = iconMap[variant || 'default'];
    const displayIcon = icon || (showIcon && <IconComponent className="h-5 w-5 shrink-0" />);

    return (
      <div
        ref={ref}
        className={cn(notificationVariants({ variant, size }), className)}
        role="alert"
        aria-live="polite"
        {...props}
      >
        {displayIcon && (
          <div className="shrink-0 mt-0.5">
            {displayIcon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-medium mb-1">
              {title}
            </div>
          )}
          
          {description && (
            <div className="text-sm opacity-90">
              {description}
            </div>
          )}
          
          {children && (
            <div className="mt-2">
              {children}
            </div>
          )}
          
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        
        {closable && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:hover:bg-white/5"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Notification.displayName = 'Notification';

// Toast Context and Provider
interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: React.ReactNode;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider
interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }

    return id;
  }, [maxToasts]);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast Container
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="animate-in slide-in-from-right-full duration-300"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <Notification
            variant={toast.variant}
            title={toast.title}
            description={toast.description}
            action={toast.action}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

// Toast helper functions
export const toast = {
  success: (message: string, options?: Partial<Toast>) => {
    const { addToast } = React.useContext(ToastContext) || {};
    return addToast?.({
      variant: 'success',
      description: message,
      ...options,
    });
  },
  
  error: (message: string, options?: Partial<Toast>) => {
    const { addToast } = React.useContext(ToastContext) || {};
    return addToast?.({
      variant: 'error',
      description: message,
      duration: 0, // Don't auto-dismiss errors
      ...options,
    });
  },
  
  warning: (message: string, options?: Partial<Toast>) => {
    const { addToast } = React.useContext(ToastContext) || {};
    return addToast?.({
      variant: 'warning',
      description: message,
      ...options,
    });
  },
  
  info: (message: string, options?: Partial<Toast>) => {
    const { addToast } = React.useContext(ToastContext) || {};
    return addToast?.({
      variant: 'info',
      description: message,
      ...options,
    });
  },
  
  custom: (options: Omit<Toast, 'id'>) => {
    const { addToast } = React.useContext(ToastContext) || {};
    return addToast?.(options);
  },
};

export { Notification, ToastContainer };