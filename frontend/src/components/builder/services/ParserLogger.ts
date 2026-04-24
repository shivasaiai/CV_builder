/**
 * Production-grade logging system for resume parser
 * Provides structured logging with different levels and performance tracking
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  error?: Error;
  performance?: {
    startTime: number;
    endTime?: number;
    duration?: number;
  };
}

export class ParserLogger {
  private static logs: LogEntry[] = [];
  private static currentLogLevel: LogLevel = LogLevel.INFO;
  private static maxLogs: number = 1000;
  private static performanceTimers: Map<string, number> = new Map();

  static setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }

  static setMaxLogs(max: number): void {
    this.maxLogs = max;
  }

  static debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  static info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  static warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  static error(category: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  static critical(category: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.CRITICAL, category, message, data, error);
  }

  static startTimer(timerName: string): void {
    this.performanceTimers.set(timerName, performance.now());
  }

  static endTimer(timerName: string, category: string, message: string): number {
    const startTime = this.performanceTimers.get(timerName);
    if (!startTime) {
      this.warn('PERFORMANCE', `Timer '${timerName}' was not started`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.performanceTimers.delete(timerName);
    
    this.log(LogLevel.INFO, category, message, {
      timerName,
      duration: `${duration.toFixed(2)}ms`
    }, undefined, {
      startTime,
      endTime,
      duration
    });

    return duration;
  }

  private static log(
    level: LogLevel, 
    category: string, 
    message: string, 
    data?: any, 
    error?: Error,
    performance?: { startTime: number; endTime?: number; duration?: number }
  ): void {
    if (level < this.currentLogLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      error,
      performance
    };

    this.logs.push(entry);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      this.outputToConsole(entry);
    }
  }

  private static outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelStr = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelStr}] [${entry.category}]`;
    
    const style = this.getConsoleStyle(entry.level);
    
    if (entry.error) {
      console.error(`${prefix} ${entry.message}`, entry.data || '', entry.error);
    } else if (entry.level >= LogLevel.ERROR) {
      console.error(`%c${prefix} ${entry.message}`, style, entry.data || '');
    } else if (entry.level >= LogLevel.WARN) {
      console.warn(`%c${prefix} ${entry.message}`, style, entry.data || '');
    } else {
      console.log(`%c${prefix} ${entry.message}`, style, entry.data || '');
    }

    if (entry.performance?.duration) {
      console.log(`%c⏱️ Performance: ${entry.performance.duration.toFixed(2)}ms`, 
        'color: #666; font-style: italic;');
    }
  }

  private static getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'color: #666; font-size: 11px;';
      case LogLevel.INFO:
        return 'color: #007bff; font-weight: normal;';
      case LogLevel.WARN:
        return 'color: #ff8c00; font-weight: bold;';
      case LogLevel.ERROR:
        return 'color: #dc3545; font-weight: bold;';
      case LogLevel.CRITICAL:
        return 'color: #fff; background: #dc3545; font-weight: bold; padding: 2px 4px;';
      default:
        return '';
    }
  }

  static getLogs(level?: LogLevel, category?: string): LogEntry[] {
    let filteredLogs = this.logs;

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    return filteredLogs;
  }

  static getLogsSummary(): {
    total: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
    errors: LogEntry[];
    warnings: LogEntry[];
    performance: LogEntry[];
  } {
    const byLevel: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const errors: LogEntry[] = [];
    const warnings: LogEntry[] = [];
    const performance: LogEntry[] = [];

    this.logs.forEach(log => {
      const levelStr = LogLevel[log.level];
      byLevel[levelStr] = (byLevel[levelStr] || 0) + 1;
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;

      if (log.level >= LogLevel.ERROR) {
        errors.push(log);
      } else if (log.level >= LogLevel.WARN) {
        warnings.push(log);
      }

      if (log.performance) {
        performance.push(log);
      }
    });

    return {
      total: this.logs.length,
      byLevel,
      byCategory,
      errors,
      warnings,
      performance
    };
  }

  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  static clearLogs(): void {
    this.logs = [];
    this.performanceTimers.clear();
  }

  static createTestReport(fileName: string, success: boolean, data?: any): {
    fileName: string;
    success: boolean;
    timestamp: number;
    logs: LogEntry[];
    summary: ReturnType<typeof ParserLogger.getLogsSummary>;
    data?: any;
  } {
    return {
      fileName,
      success,
      timestamp: Date.now(),
      logs: [...this.logs],
      summary: this.getLogsSummary(),
      data
    };
  }
}

// Export convenience functions
export const logger = {
  debug: (category: string, message: string, data?: any) => ParserLogger.debug(category, message, data),
  info: (category: string, message: string, data?: any) => ParserLogger.info(category, message, data),
  warn: (category: string, message: string, data?: any) => ParserLogger.warn(category, message, data),
  error: (category: string, message: string, error?: Error, data?: any) => ParserLogger.error(category, message, error, data),
  critical: (category: string, message: string, error?: Error, data?: any) => ParserLogger.critical(category, message, error, data),
  startTimer: (name: string) => ParserLogger.startTimer(name),
  endTimer: (name: string, category: string, message: string) => ParserLogger.endTimer(name, category, message),
};