import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, Home, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorHandler, ParserError, ErrorSeverity } from '../../services/ParserErrors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRetry?: boolean;
  showReportBug?: boolean;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

class GlobalErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `global-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Handle the error through our error management system
    const parserError = ErrorHandler.handle(error, {
      processingStep: this.props.context || 'UI Component',
      additionalInfo: {
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId
      }
    });

    // Log comprehensive error details
    console.error('Global Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: this.props.context,
      errorId: this.state.errorId,
      parserError: parserError.toJSON()
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to error tracking service if available
    this.reportError(parserError, errorInfo);
  }

  private reportError = (error: ParserError, errorInfo: ErrorInfo) => {
    // Report to external error tracking service
    if (typeof window !== 'undefined' && (window as any).errorTracker) {
      (window as any).errorTracker.captureException(error, {
        tags: {
          component: 'GlobalErrorBoundary',
          context: this.props.context || 'unknown',
          severity: error.severity
        },
        extra: {
          componentStack: errorInfo.componentStack,
          errorId: this.state.errorId,
          retryCount: this.state.retryCount
        }
      });
    }

    // Store error in local storage for debugging
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
        error: error.toJSON(),
        componentStack: errorInfo.componentStack,
        context: this.props.context,
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 50 errors
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      
      localStorage.setItem('error_logs', JSON.stringify(existingLogs));
    } catch (e) {
      console.warn('Failed to store error log:', e);
    }
  };

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;
    const { context } = this.props;

    const bugReport = {
      errorId,
      context,
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      retryCount: this.state.retryCount
    };

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(bugReport, null, 2)).then(() => {
      alert('Bug report copied to clipboard. Please paste it when reporting the issue.');
    }).catch(() => {
      console.log('Bug report:', bugReport);
      alert('Bug report logged to console. Please copy it when reporting the issue.');
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGetHelp = () => {
    // Open help documentation or support
    window.open('/help', '_blank');
  };

  private getSeverityColor = (error: Error): string => {
    if (error instanceof ParserError) {
      switch (error.severity) {
        case ErrorSeverity.CRITICAL:
          return 'text-red-600 border-red-200 bg-red-50';
        case ErrorSeverity.HIGH:
          return 'text-orange-600 border-orange-200 bg-orange-50';
        case ErrorSeverity.MEDIUM:
          return 'text-yellow-600 border-yellow-200 bg-yellow-50';
        case ErrorSeverity.LOW:
          return 'text-blue-600 border-blue-200 bg-blue-50';
        default:
          return 'text-gray-600 border-gray-200 bg-gray-50';
      }
    }
    return 'text-red-600 border-red-200 bg-red-50';
  };

  private getErrorTitle = (error: Error): string => {
    if (error instanceof ParserError) {
      switch (error.severity) {
        case ErrorSeverity.CRITICAL:
          return 'Critical Error';
        case ErrorSeverity.HIGH:
          return 'Application Error';
        case ErrorSeverity.MEDIUM:
          return 'Processing Error';
        case ErrorSeverity.LOW:
          return 'Minor Issue';
        default:
          return 'Unexpected Error';
      }
    }
    return 'Application Error';
  };

  private getUserMessage = (error: Error): string => {
    if (error instanceof ParserError) {
      return error.userMessage;
    }
    return 'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error } = this.state;
      const severityColor = this.getSeverityColor(error!);
      const errorTitle = this.getErrorTitle(error!);
      const userMessage = this.getUserMessage(error!);

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className={`max-w-2xl w-full ${severityColor}`}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-current" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {errorTitle}
              </CardTitle>
              <CardDescription className="text-lg">
                {userMessage}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Details */}
              {error && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Error Details</h4>
                  <p className="text-sm font-mono text-gray-700 break-all bg-gray-50 p-2 rounded">
                    {error.message}
                  </p>
                  {this.props.context && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Context:</span> {this.props.context}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">Error ID:</span> {this.state.errorId}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {this.props.showRetry !== false && this.state.retryCount < this.maxRetries && (
                  <Button
                    onClick={this.handleRetry}
                    className="flex-1"
                    variant="default"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again ({this.maxRetries - this.state.retryCount} attempts left)
                  </Button>
                )}

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>

                <Button
                  onClick={this.handleGetHelp}
                  variant="outline"
                  className="flex-1"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Get Help
                </Button>
              </div>

              {/* Report Bug Button */}
              {this.props.showReportBug !== false && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={this.handleReportBug}
                    variant="ghost"
                    className="w-full text-gray-600"
                    size="sm"
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    Report Bug
                  </Button>
                </div>
              )}

              {/* Development Details */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="bg-white border rounded-lg p-4">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                    Development Details
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <h5 className="text-xs font-semibold text-gray-600 mb-1">Stack Trace</h5>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32 text-gray-800">
                        {error?.stack}
                      </pre>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-gray-600 mb-1">Component Stack</h5>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32 text-gray-800">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;