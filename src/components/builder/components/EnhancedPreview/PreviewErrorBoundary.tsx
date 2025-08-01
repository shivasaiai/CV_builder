import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, FileText } from 'lucide-react';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallbackComponent?: ReactNode;
  showErrorDetails?: boolean;
  enableRecovery?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRecovering: boolean;
}

class PreviewErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Preview Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error details for debugging
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Preview Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      console.warn('Max retry attempts reached for preview error');
      return;
    }

    this.setState({
      isRecovering: true
    });

    // Clear any existing timeout
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    // Attempt recovery after a short delay
    this.retryTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1,
        isRecovering: false
      });
    }, 1000);
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRecovering: false
    });
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      // Show custom fallback if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center h-full bg-red-50 border-2 border-red-200 rounded-lg p-8">
          <div className="text-center max-w-md">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            {/* Error Title */}
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Preview Error
            </h3>

            {/* Error Message */}
            <p className="text-red-700 mb-6">
              {this.state.isRecovering 
                ? 'Attempting to recover preview...'
                : 'Something went wrong while rendering the preview. This might be due to invalid data or a template issue.'
              }
            </p>

            {/* Error Details (Development Only) */}
            {this.props.showErrorDetails && this.state.error && process.env.NODE_ENV === 'development' && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-red-800 hover:text-red-900">
                  <Bug className="w-4 h-4 inline mr-1" />
                  Show Error Details
                </summary>
                <div className="mt-2 p-3 bg-red-100 rounded border text-xs font-mono text-red-800 overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.props.enableRecovery !== false && this.state.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  disabled={this.state.isRecovering}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    this.state.isRecovering
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                  }`}
                >
                  {this.state.isRecovering ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Recovering...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again ({this.maxRetries - this.state.retryCount} left)
                    </>
                  )}
                </button>
              )}

              <button
                onClick={this.handleReset}
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                <FileText className="w-4 h-4 mr-2" />
                Reset Preview
              </button>
            </div>

            {/* Retry Count Warning */}
            {this.state.retryCount >= this.maxRetries && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Maximum retry attempts reached. Please check your resume data or try a different template.
                </p>
              </div>
            )}

            {/* Help Text */}
            <div className="mt-6 text-xs text-gray-600">
              <p>
                If this problem persists, try:
              </p>
              <ul className="mt-2 text-left list-disc list-inside space-y-1">
                <li>Switching to a different template</li>
                <li>Checking for invalid characters in your data</li>
                <li>Refreshing the page</li>
                <li>Clearing your browser cache</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PreviewErrorBoundary;