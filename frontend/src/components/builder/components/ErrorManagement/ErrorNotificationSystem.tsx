import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, CheckCircle, Info, X, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ParserError, ErrorSeverity } from '../../services/ParserErrors';
import { ErrorRecoveryService, RecoveryResult } from '../../services/ErrorRecoveryService';

export interface ErrorNotification {
  id: string;
  error: ParserError;
  timestamp: number;
  dismissed: boolean;
  recoveryAttempted: boolean;
  recoveryResult?: RecoveryResult;
  actions?: ErrorAction[];
}

export interface ErrorAction {
  label: string;
  action: () => void | Promise<void>;
  variant?: 'default' | 'outline' | 'ghost';
  icon?: React.ComponentType<{ className?: string }>;
}

interface ErrorNotificationContextType {
  notifications: ErrorNotification[];
  showError: (error: ParserError, actions?: ErrorAction[]) => string;
  dismissError: (id: string) => void;
  clearAllErrors: () => void;
  attemptRecovery: (id: string, context?: any) => Promise<void>;
}

const ErrorNotificationContext = createContext<ErrorNotificationContextType | null>(null);

export const useErrorNotification = () => {
  const context = useContext(ErrorNotificationContext);
  if (!context) {
    throw new Error('useErrorNotification must be used within an ErrorNotificationProvider');
  }
  return context;
};

interface ErrorNotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
  autoHideDelay?: number;
}

export const ErrorNotificationProvider: React.FC<ErrorNotificationProviderProps> = ({
  children,
  maxNotifications = 5,
  autoHideDelay = 10000
}) => {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

  const showError = useCallback((error: ParserError, actions?: ErrorAction[]): string => {
    const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: ErrorNotification = {
      id,
      error,
      timestamp: Date.now(),
      dismissed: false,
      recoveryAttempted: false,
      actions
    };

    setNotifications(prev => {
      const newNotifications = [notification, ...prev];
      // Keep only the most recent notifications
      return newNotifications.slice(0, maxNotifications);
    });

    // Auto-hide for low severity errors
    if (error.severity === ErrorSeverity.LOW && autoHideDelay > 0) {
      setTimeout(() => {
        dismissError(id);
      }, autoHideDelay);
    }

    return id;
  }, [maxNotifications, autoHideDelay]);

  const dismissError = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, dismissed: true }
          : notification
      )
    );

    // Remove dismissed notifications after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 300);
  }, []);

  const clearAllErrors = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, dismissed: true }))
    );

    setTimeout(() => {
      setNotifications([]);
    }, 300);
  }, []);

  const attemptRecovery = useCallback(async (id: string, context?: any) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.recoveryAttempted) {
      return;
    }

    // Mark as recovery attempted
    setNotifications(prev => 
      prev.map(n => 
        n.id === id 
          ? { ...n, recoveryAttempted: true }
          : n
      )
    );

    try {
      const recoveryResult = await ErrorRecoveryService.attemptRecovery(notification.error, context);
      
      // Update notification with recovery result
      setNotifications(prev => 
        prev.map(n => 
          n.id === id 
            ? { ...n, recoveryResult }
            : n
        )
      );

      // If recovery was successful, auto-dismiss after a short delay
      if (recoveryResult.success) {
        setTimeout(() => {
          dismissError(id);
        }, 3000);
      }
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
      
      // Update notification with failed recovery
      setNotifications(prev => 
        prev.map(n => 
          n.id === id 
            ? { 
                ...n, 
                recoveryResult: { 
                  success: false, 
                  error: notification.error,
                  attemptsUsed: 1
                }
              }
            : n
        )
      );
    }
  }, [notifications, dismissError]);

  const contextValue: ErrorNotificationContextType = {
    notifications,
    showError,
    dismissError,
    clearAllErrors,
    attemptRecovery
  };

  return (
    <ErrorNotificationContext.Provider value={contextValue}>
      {children}
      <ErrorNotificationContainer />
    </ErrorNotificationContext.Provider>
  );
};

const ErrorNotificationContainer: React.FC = () => {
  const { notifications, dismissError, attemptRecovery } = useErrorNotification();

  const visibleNotifications = notifications.filter(n => !n.dismissed);

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {visibleNotifications.map(notification => (
        <ErrorNotificationCard
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissError(notification.id)}
          onRetry={() => attemptRecovery(notification.id)}
        />
      ))}
    </div>
  );
};

interface ErrorNotificationCardProps {
  notification: ErrorNotification;
  onDismiss: () => void;
  onRetry: () => void;
}

const ErrorNotificationCard: React.FC<ErrorNotificationCardProps> = ({
  notification,
  onDismiss,
  onRetry
}) => {
  const { error, recoveryAttempted, recoveryResult, actions } = notification;

  const getSeverityConfig = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-50 border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900'
        };
      case ErrorSeverity.HIGH:
        return {
          icon: AlertTriangle,
          bgColor: 'bg-orange-50 border-orange-200',
          iconColor: 'text-orange-600',
          titleColor: 'text-orange-900'
        };
      case ErrorSeverity.MEDIUM:
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50 border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900'
        };
      case ErrorSeverity.LOW:
        return {
          icon: Info,
          bgColor: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900'
        };
      default:
        return {
          icon: AlertTriangle,
          bgColor: 'bg-gray-50 border-gray-200',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-900'
        };
    }
  };

  const config = getSeverityConfig(error.severity);
  const Icon = config.icon;

  return (
    <Card className={`${config.bgColor} shadow-lg animate-in slide-in-from-right-full duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {recoveryResult?.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`text-sm font-semibold ${config.titleColor}`}>
                  {recoveryResult?.success ? 'Issue Resolved' : 'Error Occurred'}
                </h4>
                <p className="text-sm text-gray-700 mt-1">
                  {recoveryResult?.success 
                    ? `Successfully recovered using ${recoveryResult.strategyUsed}`
                    : error.userMessage
                  }
                </p>

                {/* Recovery Status */}
                {recoveryAttempted && !recoveryResult?.success && (
                  <p className="text-xs text-gray-500 mt-1">
                    Recovery attempted but failed
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="flex-shrink-0 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              {/* Recovery Button */}
              {error.recoverable && !recoveryAttempted && !recoveryResult?.success && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try to Fix
                </Button>
              )}

              {/* Custom Actions */}
              {actions?.map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={action.action}
                    className="text-xs"
                  >
                    {ActionIcon && <ActionIcon className="h-3 w-3 mr-1" />}
                    {action.label}
                  </Button>
                );
              })}

              {/* Help Link for Critical Errors */}
              {error.severity === ErrorSeverity.CRITICAL && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('/help', '_blank')}
                  className="text-xs text-gray-600"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Get Help
                </Button>
              )}
            </div>

            {/* Error Details for Development */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary className="text-xs text-gray-500 cursor-pointer">
                  Error Details
                </summary>
                <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto max-h-20 text-gray-700">
                  {JSON.stringify(error.toJSON(), null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorNotificationProvider;