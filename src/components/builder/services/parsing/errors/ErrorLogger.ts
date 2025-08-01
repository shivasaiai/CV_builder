import { ClassifiedError, ErrorCategory, ErrorSeverity } from './ErrorClassification';
import { RecoveryResult } from './ErrorRecovery';

/**
 * Comprehensive error logging and debugging system
 */

export interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  error: ClassifiedError;
  context: Record<string, any>;
  userAgent: string;
  url: string;
  sessionId: string;
  userId?: string;
  recoveryAttempts: RecoveryResult[];
  resolved: boolean;
  resolutionTime?: number;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByCode: Record<string, number>;
  averageResolutionTime: number;
  resolutionRate: number;
  topErrors: Array<{ code: string; count: number; percentage: number }>;
  timeRange: { start: Date; end: Date };
}

export interface DebugInfo {
  browserInfo: {
    userAgent: string;
    language: string;
    platform: string;
    cookieEnabled: boolean;
    onLine: boolean;
  };
  systemInfo: {
    memoryUsage?: any;
    connectionType?: string;
    effectiveType?: string;
  };
  applicationState: {
    timestamp: Date;
    url: string;
    sessionDuration: number;
    previousErrors: number;
  };
}

/**
 * Error logger with comprehensive tracking and debugging capabilities
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private errorLog: Map<string, ErrorLogEntry> = new Map();
  private sessionId: string;
  private sessionStartTime: Date;
  private maxLogSize: number = 1000;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    this.setupGlobalErrorHandling();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with full context
   */
  public logError(
    error: ClassifiedError,
    context: Record<string, any> = {},
    userId?: string
  ): string {
    const errorId = this.generateErrorId();
    const debugInfo = this.collectDebugInfo();

    const logEntry: ErrorLogEntry = {
      id: errorId,
      timestamp: new Date(),
      error,
      context: {
        ...context,
        debugInfo
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
      userId,
      recoveryAttempts: [],
      resolved: false
    };

    this.errorLog.set(errorId, logEntry);
    this.maintainLogSize();

    // Log to console with appropriate level
    this.logToConsole(logEntry);

    // Send to external logging service if configured
    this.sendToExternalLogger(logEntry);

    console.log(`📝 Error logged with ID: ${errorId}`);
    return errorId;
  }

  /**
   * Log recovery attempt
   */
  public logRecoveryAttempt(errorId: string, recoveryResult: RecoveryResult): void {
    const logEntry = this.errorLog.get(errorId);
    if (logEntry) {
      logEntry.recoveryAttempts.push(recoveryResult);
      
      if (recoveryResult.success) {
        logEntry.resolved = true;
        logEntry.resolutionTime = Date.now() - logEntry.timestamp.getTime();
        console.log(`✅ Error ${errorId} resolved using ${recoveryResult.strategyUsed}`);
      }
    }
  }

  /**
   * Get error by ID
   */
  public getError(errorId: string): ErrorLogEntry | undefined {
    return this.errorLog.get(errorId);
  }

  /**
   * Get all errors for analysis
   */
  public getAllErrors(): ErrorLogEntry[] {
    return Array.from(this.errorLog.values());
  }

  /**
   * Get error metrics for monitoring
   */
  public getErrorMetrics(timeRange?: { start: Date; end: Date }): ErrorMetrics {
    let errors = Array.from(this.errorLog.values());

    // Filter by time range if provided
    if (timeRange) {
      errors = errors.filter(entry => 
        entry.timestamp >= timeRange.start && entry.timestamp <= timeRange.end
      );
    }

    const totalErrors = errors.length;
    const errorsByCategory: Record<ErrorCategory, number> = {} as any;
    const errorsBySeverity: Record<ErrorSeverity, number> = {} as any;
    const errorsByCode: Record<string, number> = {};

    // Initialize counters
    Object.values(ErrorCategory).forEach(category => {
      errorsByCategory[category] = 0;
    });
    Object.values(ErrorSeverity).forEach(severity => {
      errorsBySeverity[severity] = 0;
    });

    let totalResolutionTime = 0;
    let resolvedErrors = 0;

    // Count errors and calculate metrics
    errors.forEach(entry => {
      const { category, severity, code } = entry.error.classification;
      
      errorsByCategory[category]++;
      errorsBySeverity[severity]++;
      errorsByCode[code] = (errorsByCode[code] || 0) + 1;

      if (entry.resolved && entry.resolutionTime) {
        resolvedErrors++;
        totalResolutionTime += entry.resolutionTime;
      }
    });

    // Calculate top errors
    const topErrors = Object.entries(errorsByCode)
      .map(([code, count]) => ({
        code,
        count,
        percentage: totalErrors > 0 ? (count / totalErrors) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors,
      errorsByCategory,
      errorsBySeverity,
      errorsByCode,
      averageResolutionTime: resolvedErrors > 0 ? totalResolutionTime / resolvedErrors : 0,
      resolutionRate: totalErrors > 0 ? resolvedErrors / totalErrors : 0,
      topErrors,
      timeRange: timeRange || {
        start: errors.length > 0 ? errors[0].timestamp : new Date(),
        end: new Date()
      }
    };
  }

  /**
   * Export error log for analysis
   */
  public exportErrorLog(format: 'json' | 'csv' = 'json'): string {
    const errors = this.getAllErrors();

    if (format === 'csv') {
      return this.exportAsCSV(errors);
    } else {
      return JSON.stringify(errors, null, 2);
    }
  }

  /**
   * Clear error log
   */
  public clearLog(): void {
    this.errorLog.clear();
    console.log('🗑️ Error log cleared');
  }

  /**
   * Get debug information for current session
   */
  public getDebugInfo(): DebugInfo {
    return this.collectDebugInfo();
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Collect comprehensive debug information
   */
  private collectDebugInfo(): DebugInfo {
    const debugInfo: DebugInfo = {
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      },
      systemInfo: {},
      applicationState: {
        timestamp: new Date(),
        url: window.location.href,
        sessionDuration: Date.now() - this.sessionStartTime.getTime(),
        previousErrors: this.errorLog.size
      }
    };

    // Add memory usage if available
    if ('memory' in performance) {
      debugInfo.systemInfo.memoryUsage = (performance as any).memory;
    }

    // Add connection info if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      debugInfo.systemInfo.connectionType = connection.type;
      debugInfo.systemInfo.effectiveType = connection.effectiveType;
    }

    return debugInfo;
  }

  /**
   * Log to console with appropriate level
   */
  private logToConsole(logEntry: ErrorLogEntry): void {
    const { error, context } = logEntry;
    const { severity, category, code, userMessage } = error.classification;

    const logData = {
      id: logEntry.id,
      code,
      category,
      severity,
      message: error.message,
      userMessage,
      context: context,
      suggestions: error.getSuggestions()
    };

    switch (severity) {
      case ErrorSeverity.CRITICAL:
        console.error('🚨 CRITICAL ERROR:', logData);
        break;
      case ErrorSeverity.HIGH:
        console.error('❌ HIGH SEVERITY ERROR:', logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('⚠️ MEDIUM SEVERITY ERROR:', logData);
        break;
      case ErrorSeverity.LOW:
        console.warn('⚡ LOW SEVERITY ERROR:', logData);
        break;
      case ErrorSeverity.WARNING:
        console.info('ℹ️ WARNING:', logData);
        break;
    }
  }

  /**
   * Send to external logging service (placeholder)
   */
  private sendToExternalLogger(logEntry: ErrorLogEntry): void {
    // In a production environment, you would send this to your logging service
    // Examples: Sentry, LogRocket, DataDog, etc.
    
    // For now, we'll just store it locally
    try {
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push({
        id: logEntry.id,
        timestamp: logEntry.timestamp.toISOString(),
        code: logEntry.error.classification.code,
        category: logEntry.error.classification.category,
        severity: logEntry.error.classification.severity,
        message: logEntry.error.message,
        userMessage: logEntry.error.classification.userMessage,
        url: logEntry.url,
        userAgent: logEntry.userAgent
      });
      
      // Keep only last 100 entries in localStorage
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
    } catch (storageError) {
      console.warn('Failed to store error log locally:', storageError);
    }
  }

  /**
   * Setup global error handling
   */
  private setupGlobalErrorHandling(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      const classifiedError = ErrorLogger.classifyError(error, {
        type: 'unhandled_promise_rejection',
        promise: event.promise
      });
      this.logError(classifiedError, { source: 'global_handler' });
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      const classifiedError = ErrorLogger.classifyError(event.error || new Error(event.message), {
        type: 'global_javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      this.logError(classifiedError, { source: 'global_handler' });
    });
  }

  /**
   * Maintain log size within limits
   */
  private maintainLogSize(): void {
    if (this.errorLog.size > this.maxLogSize) {
      const entries = Array.from(this.errorLog.entries());
      entries.sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
      
      // Remove oldest entries
      const toRemove = entries.slice(0, this.errorLog.size - this.maxLogSize);
      toRemove.forEach(([id]) => this.errorLog.delete(id));
    }
  }

  /**
   * Export errors as CSV
   */
  private exportAsCSV(errors: ErrorLogEntry[]): string {
    const headers = [
      'ID', 'Timestamp', 'Category', 'Severity', 'Code', 'Message', 
      'User Message', 'Resolved', 'Resolution Time', 'Recovery Attempts'
    ];

    const rows = errors.map(entry => [
      entry.id,
      entry.timestamp.toISOString(),
      entry.error.classification.category,
      entry.error.classification.severity,
      entry.error.classification.code,
      `"${entry.error.message.replace(/"/g, '""')}"`,
      `"${entry.error.classification.userMessage.replace(/"/g, '""')}"`,
      entry.resolved,
      entry.resolutionTime || '',
      entry.recoveryAttempts.length
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Static method to classify errors (for convenience)
   */
  public static classifyError(error: Error | string, context?: Record<string, any>): ClassifiedError {
    // This would import and use the ErrorClassifier
    // For now, we'll create a simple implementation
    const message = typeof error === 'string' ? error : error.message;
    const originalError = typeof error === 'string' ? undefined : error;

    // Import the classifier dynamically to avoid circular dependencies
    const { ErrorClassifier } = require('./ErrorClassification');
    return ErrorClassifier.classify(error, context);
  }
}