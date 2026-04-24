/**
 * Error Logging and Debugging Service
 * Provides comprehensive error logging, debugging utilities, and analytics
 */

import { ParserError, ErrorCode, ErrorSeverity } from './ParserErrors';

export interface ErrorLog {
  id: string;
  timestamp: number;
  error: ParserError;
  context: ErrorContext;
  userAgent: string;
  url: string;
  sessionId: string;
  userId?: string;
  resolved: boolean;
  resolutionMethod?: string;
  resolutionTime?: number;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  processingStep?: string;
  userInput?: any;
  systemState?: any;
  additionalInfo?: Record<string, any>;
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorsByCode: Record<ErrorCode, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByComponent: Record<string, number>;
  errorsByTimeRange: Record<string, number>;
  resolutionRate: number;
  averageResolutionTime: number;
  mostCommonErrors: Array<{
    code: ErrorCode;
    count: number;
    percentage: number;
  }>;
  errorTrends: Array<{
    date: string;
    count: number;
    resolved: number;
  }>;
}

export class ErrorLoggingService {
  private static logs: ErrorLog[] = [];
  private static maxLogs = 1000;
  private static sessionId = this.generateSessionId();
  private static userId?: string;

  private static generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static setUserId(userId: string): void {
    this.userId = userId;
  }

  static logError(
    error: ParserError,
    context: ErrorContext = {}
  ): string {
    const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const errorLog: ErrorLog = {
      id: logId,
      timestamp: Date.now(),
      error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
      userId: this.userId,
      resolved: false
    };

    // Add to memory logs
    this.logs.push(errorLog);
    
    // Keep only recent logs in memory
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Persist to local storage
    this.persistToLocalStorage(errorLog);

    // Send to external logging service if available
    this.sendToExternalService(errorLog);

    // Log to console with structured format
    this.logToConsole(errorLog);

    return logId;
  }

  private static persistToLocalStorage(errorLog: ErrorLog): void {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 100 logs in localStorage
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('error_logs', JSON.stringify(existingLogs));
    } catch (e) {
      console.warn('Failed to persist error log to localStorage:', e);
    }
  }

  private static sendToExternalService(errorLog: ErrorLog): void {
    // Send to external error tracking service (e.g., Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined' && (window as any).errorTracker) {
      try {
        (window as any).errorTracker.captureException(errorLog.error, {
          tags: {
            component: errorLog.context.component || 'unknown',
            severity: errorLog.error.severity,
            errorCode: errorLog.error.code
          },
          extra: {
            logId: errorLog.id,
            context: errorLog.context,
            sessionId: errorLog.sessionId,
            userId: errorLog.userId
          }
        });
      } catch (e) {
        console.warn('Failed to send error to external service:', e);
      }
    }

    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalyticsEndpoint(errorLog);
    }
  }

  private static async sendToAnalyticsEndpoint(errorLog: ErrorLog): Promise<void> {
    try {
      // Only send essential data to avoid privacy issues
      const analyticsData = {
        errorCode: errorLog.error.code,
        severity: errorLog.error.severity,
        component: errorLog.context.component,
        timestamp: errorLog.timestamp,
        sessionId: errorLog.sessionId,
        userAgent: errorLog.userAgent,
        url: errorLog.url
      };

      // This would be your analytics endpoint
      await fetch('/api/analytics/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analyticsData)
      });
    } catch (e) {
      // Silently fail for analytics
      console.debug('Failed to send error analytics:', e);
    }
  }

  private static logToConsole(errorLog: ErrorLog): void {
    const { error, context, id } = errorLog;
    
    const logLevel = this.getConsoleLogLevel(error.severity);
    const logMethod = console[logLevel] || console.error;

    logMethod.call(console, 
      `🚨 Error Logged [${id}]`,
      '\n📋 Code:', error.code,
      '\n⚠️ Severity:', error.severity,
      '\n💬 Message:', error.message,
      '\n👤 User Message:', error.userMessage,
      '\n🔄 Recoverable:', error.recoverable,
      '\n🏷️ Component:', context.component || 'Unknown',
      '\n📁 File:', context.fileName || 'N/A',
      '\n⏱️ Timestamp:', new Date(errorLog.timestamp).toISOString(),
      '\n🔍 Full Context:', context,
      '\n📊 Error Object:', error.toJSON()
    );
  }

  private static getConsoleLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' | 'debug' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'debug';
    }
  }

  static markResolved(
    logId: string,
    resolutionMethod: string,
    resolutionTime?: number
  ): void {
    const log = this.logs.find(l => l.id === logId);
    if (log) {
      log.resolved = true;
      log.resolutionMethod = resolutionMethod;
      log.resolutionTime = resolutionTime || Date.now() - log.timestamp;

      // Update in localStorage
      try {
        const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
        const updatedLogs = existingLogs.map((l: ErrorLog) => 
          l.id === logId ? { ...l, resolved: true, resolutionMethod, resolutionTime: log.resolutionTime } : l
        );
        localStorage.setItem('error_logs', JSON.stringify(updatedLogs));
      } catch (e) {
        console.warn('Failed to update resolved status in localStorage:', e);
      }

      console.log(`✅ Error ${logId} marked as resolved using ${resolutionMethod}`);
    }
  }

  static getErrorLogs(filters?: {
    severity?: ErrorSeverity;
    code?: ErrorCode;
    component?: string;
    resolved?: boolean;
    timeRange?: { start: number; end: number };
  }): ErrorLog[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.severity) {
        filteredLogs = filteredLogs.filter(log => log.error.severity === filters.severity);
      }
      if (filters.code) {
        filteredLogs = filteredLogs.filter(log => log.error.code === filters.code);
      }
      if (filters.component) {
        filteredLogs = filteredLogs.filter(log => log.context.component === filters.component);
      }
      if (filters.resolved !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.resolved === filters.resolved);
      }
      if (filters.timeRange) {
        filteredLogs = filteredLogs.filter(log => 
          log.timestamp >= filters.timeRange!.start && 
          log.timestamp <= filters.timeRange!.end
        );
      }
    }

    return filteredLogs.sort((a, b) => b.timestamp - a.timestamp);
  }

  static getAnalytics(): ErrorAnalytics {
    const logs = this.logs;
    const totalErrors = logs.length;
    const resolvedErrors = logs.filter(log => log.resolved).length;

    // Group by error code
    const errorsByCode = logs.reduce((acc, log) => {
      acc[log.error.code] = (acc[log.error.code] || 0) + 1;
      return acc;
    }, {} as Record<ErrorCode, number>);

    // Group by severity
    const errorsBySeverity = logs.reduce((acc, log) => {
      acc[log.error.severity] = (acc[log.error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    // Group by component
    const errorsByComponent = logs.reduce((acc, log) => {
      const component = log.context.component || 'Unknown';
      acc[component] = (acc[component] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Most common errors
    const mostCommonErrors = Object.entries(errorsByCode)
      .map(([code, count]) => ({
        code: code as ErrorCode,
        count,
        percentage: (count / totalErrors) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Resolution rate and average time
    const resolutionRate = totalErrors > 0 ? (resolvedErrors / totalErrors) * 100 : 0;
    const resolvedLogs = logs.filter(log => log.resolved && log.resolutionTime);
    const averageResolutionTime = resolvedLogs.length > 0 
      ? resolvedLogs.reduce((sum, log) => sum + (log.resolutionTime || 0), 0) / resolvedLogs.length
      : 0;

    // Error trends (last 7 days)
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const errorTrends = [];
    
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - (i * 24 * 60 * 60 * 1000);
      const dayEnd = dayStart + (24 * 60 * 60 * 1000);
      const dayLogs = logs.filter(log => log.timestamp >= dayStart && log.timestamp < dayEnd);
      
      errorTrends.push({
        date: new Date(dayStart).toISOString().split('T')[0],
        count: dayLogs.length,
        resolved: dayLogs.filter(log => log.resolved).length
      });
    }

    // Group by time range (last 24 hours by hour)
    const errorsByTimeRange: Record<string, number> = {};
    for (let i = 23; i >= 0; i--) {
      const hourStart = now - (i * 60 * 60 * 1000);
      const hourEnd = hourStart + (60 * 60 * 1000);
      const hourLogs = logs.filter(log => log.timestamp >= hourStart && log.timestamp < hourEnd);
      const hourKey = new Date(hourStart).getHours().toString().padStart(2, '0') + ':00';
      errorsByTimeRange[hourKey] = hourLogs.length;
    }

    return {
      totalErrors,
      errorsByCode,
      errorsBySeverity,
      errorsByComponent,
      errorsByTimeRange,
      resolutionRate,
      averageResolutionTime,
      mostCommonErrors,
      errorTrends
    };
  }

  static exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.logs;

    if (format === 'csv') {
      const headers = [
        'ID', 'Timestamp', 'Error Code', 'Severity', 'Message', 'User Message',
        'Component', 'File Name', 'Resolved', 'Resolution Method', 'Resolution Time'
      ];

      const csvRows = logs.map(log => [
        log.id,
        new Date(log.timestamp).toISOString(),
        log.error.code,
        log.error.severity,
        log.error.message.replace(/"/g, '""'),
        log.error.userMessage.replace(/"/g, '""'),
        log.context.component || '',
        log.context.fileName || '',
        log.resolved,
        log.resolutionMethod || '',
        log.resolutionTime || ''
      ]);

      return [headers, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    }

    return JSON.stringify(logs, null, 2);
  }

  static clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem('error_logs');
    } catch (e) {
      console.warn('Failed to clear error logs from localStorage:', e);
    }
  }

  static getDebugInfo(): {
    sessionId: string;
    userId?: string;
    totalLogs: number;
    memoryUsage?: number;
    browserInfo: {
      userAgent: string;
      language: string;
      platform: string;
      cookieEnabled: boolean;
      onLine: boolean;
    };
    performanceInfo: {
      timing?: PerformanceTiming;
      memory?: any;
    };
  } {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      totalLogs: this.logs.length,
      memoryUsage: (performance as any).memory?.usedJSHeapSize,
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      },
      performanceInfo: {
        timing: performance.timing,
        memory: (performance as any).memory
      }
    };
  }
}

// Convenience function for quick error logging
export const logError = (
  error: ParserError,
  context: ErrorContext = {}
): string => {
  return ErrorLoggingService.logError(error, context);
};

export default ErrorLoggingService;