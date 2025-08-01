import * as React from 'react';
import { cn } from '@/lib/utils';
import { useBreakpoint } from './ResponsiveUtils';

/**
 * Layout Components
 * 
 * Comprehensive layout system for responsive design
 */

// Main Layout Component
interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: 'sm' | 'md' | 'lg' | 'xl';
  collapsibleSidebar?: boolean;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
}

export const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({
    className,
    children,
    sidebar,
    header,
    footer,
    sidebarPosition = 'left',
    sidebarWidth = 'md',
    collapsibleSidebar = true,
    stickyHeader = true,
    stickyFooter = false,
    ...props
  }, ref) => {
    const { isMobile } = useBreakpoint();
    const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

    const sidebarWidthClasses = {
      sm: 'w-64',
      md: 'w-72',
      lg: 'w-80',
      xl: 'w-96',
    };

    React.useEffect(() => {
      setSidebarOpen(!isMobile);
    }, [isMobile]);

    return (
      <div
        ref={ref}
        className={cn('min-h-screen flex flex-col', className)}
        {...props}
      >
        {/* Header */}
        {header && (
          <header
            className={cn(
              'bg-background border-b border-border z-40',
              stickyHeader && 'sticky top-0'
            )}
          >
            {header}
          </header>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          {sidebar && (
            <>
              {/* Mobile Overlay */}
              {isMobile && sidebarOpen && (
                <div
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}

              {/* Sidebar */}
              <aside
                className={cn(
                  'bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-300',
                  sidebarWidthClasses[sidebarWidth],
                  sidebarPosition === 'right' && 'order-last border-r-0 border-l',
                  isMobile ? [
                    'fixed top-0 bottom-0',
                    sidebarPosition === 'left' ? 'left-0' : 'right-0',
                    sidebarOpen ? 'translate-x-0' : (
                      sidebarPosition === 'left' ? '-translate-x-full' : 'translate-x-full'
                    ),
                  ] : [
                    'relative',
                    collapsibleSidebar && !sidebarOpen && 'w-0 overflow-hidden',
                  ]
                )}
              >
                <div className="h-full overflow-y-auto custom-scrollbar">
                  {sidebar}
                </div>
              </aside>
            </>
          )}

          {/* Main Content */}
          <main
            id="main-content"
            className="flex-1 overflow-auto custom-scrollbar"
          >
            <div className="h-full">
              {children}
            </div>
          </main>
        </div>

        {/* Footer */}
        {footer && (
          <footer
            className={cn(
              'bg-background border-t border-border z-30',
              stickyFooter && 'sticky bottom-0'
            )}
          >
            {footer}
          </footer>
        )}

        {/* Sidebar Toggle Button for Mobile */}
        {sidebar && collapsibleSidebar && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              'fixed bottom-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'transition-all duration-200 hover:scale-110',
              isMobile ? (
                sidebarPosition === 'left' ? 'left-4' : 'right-4'
              ) : 'left-4',
              !isMobile && 'lg:hidden'
            )}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {sidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        )}
      </div>
    );
  }
);
Layout.displayName = 'Layout';

// Page Layout Component
interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  ({
    className,
    children,
    title,
    description,
    actions,
    breadcrumbs,
    maxWidth = 'full',
    padding = 'lg',
    ...props
  }, ref) => {
    const maxWidthClasses = {
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      '2xl': 'max-w-8xl',
      full: 'max-w-full',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-6 lg:p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-full mx-auto',
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <nav className="mb-4" aria-label="Breadcrumb">
            {breadcrumbs}
          </nav>
        )}

        {/* Page Header */}
        {(title || description || actions) && (
          <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                {title && (
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-2 text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex-shrink-0">
                  {actions}
                </div>
              )}
            </div>
          </header>
        )}

        {/* Page Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    );
  }
);
PageLayout.displayName = 'PageLayout';

// Section Layout Component
interface SectionLayoutProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'card' | 'bordered';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export const SectionLayout = React.forwardRef<HTMLElement, SectionLayoutProps>(
  ({
    className,
    children,
    title,
    description,
    actions,
    variant = 'default',
    spacing = 'md',
    ...props
  }, ref) => {
    const spacingClasses = {
      none: '',
      sm: 'space-y-3',
      md: 'space-y-4',
      lg: 'space-y-6',
    };

    const variantClasses = {
      default: '',
      card: 'bg-card border border-border rounded-lg p-6',
      bordered: 'border border-border rounded-lg p-6',
    };

    return (
      <section
        ref={ref}
        className={cn(
          variantClasses[variant],
          spacingClasses[spacing],
          className
        )}
        {...props}
      >
        {/* Section Header */}
        {(title || description || actions) && (
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="min-w-0 flex-1">
              {title && (
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex-shrink-0">
                {actions}
              </div>
            )}
          </header>
        )}

        {/* Section Content */}
        {children}
      </section>
    );
  }
);
SectionLayout.displayName = 'SectionLayout';

// Two Column Layout Component
interface TwoColumnLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
  leftWidth?: 'sm' | 'md' | 'lg';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  stackOnMobile?: boolean;
  reverseOnMobile?: boolean;
}

export const TwoColumnLayout = React.forwardRef<HTMLDivElement, TwoColumnLayoutProps>(
  ({
    className,
    leftColumn,
    rightColumn,
    leftWidth = 'md',
    gap = 'lg',
    stackOnMobile = true,
    reverseOnMobile = false,
    ...props
  }, ref) => {
    const leftWidthClasses = {
      sm: 'lg:w-1/3',
      md: 'lg:w-2/5',
      lg: 'lg:w-1/2',
    };

    const gapClasses = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          stackOnMobile ? 'flex-col lg:flex-row' : 'flex-row',
          reverseOnMobile && stackOnMobile && 'flex-col-reverse lg:flex-row',
          gapClasses[gap],
          className
        )}
        {...props}
      >
        <div className={cn('flex-shrink-0', leftWidthClasses[leftWidth])}>
          {leftColumn}
        </div>
        <div className="flex-1 min-w-0">
          {rightColumn}
        </div>
      </div>
    );
  }
);
TwoColumnLayout.displayName = 'TwoColumnLayout';