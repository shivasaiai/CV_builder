/**
 * Error Recovery Service
 * Provides automated error recovery mechanisms and retry strategies
 */

import { ParserError, ErrorCode, ErrorSeverity } from './ParserErrors';

export interface RecoveryStrategy {
  name: string;
  canRecover: (error: ParserError) => boolean;
  recover: (error: ParserError, context?: any) => Promise<any>;
  maxAttempts: number;
  delayMs: number;
}

export interface RecoveryResult {
  success: boolean;
  result?: any;
  error?: ParserError;
  strategyUsed?: string;
  attemptsUsed: number;
}

export class ErrorRecoveryService {
  private static strategies: RecoveryStrategy[] = [];
  private static recoveryHistory: Map<string, number> = new Map();

  static registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
    // Sort by priority (strategies with fewer max attempts first for quick fixes)
    this.strategies.sort((a, b) => a.maxAttempts - b.maxAttempts);
  }

  static async attemptRecovery(
    error: ParserError,
    context?: any
  ): Promise<RecoveryResult> {
    const errorKey = `${error.code}-${error.context.fileName || 'unknown'}`;
    const previousAttempts = this.recoveryHistory.get(errorKey) || 0;

    // Find applicable recovery strategies
    const applicableStrategies = this.strategies.filter(strategy => 
      strategy.canRecover(error) && previousAttempts < strategy.maxAttempts
    );

    if (applicableStrategies.length === 0) {
      return {
        success: false,
        error,
        attemptsUsed: previousAttempts
      };
    }

    // Try each strategy in order
    for (const strategy of applicableStrategies) {
      try {
        console.log(`Attempting recovery with strategy: ${strategy.name}`);
        
        // Add delay if specified
        if (strategy.delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, strategy.delayMs));
        }

        const result = await strategy.recover(error, context);
        
        // Recovery successful
        this.recoveryHistory.set(errorKey, previousAttempts + 1);
        
        return {
          success: true,
          result,
          strategyUsed: strategy.name,
          attemptsUsed: previousAttempts + 1
        };
      } catch (recoveryError) {
        console.warn(`Recovery strategy ${strategy.name} failed:`, recoveryError);
        continue;
      }
    }

    // All strategies failed
    this.recoveryHistory.set(errorKey, previousAttempts + 1);
    
    return {
      success: false,
      error,
      attemptsUsed: previousAttempts + 1
    };
  }

  static clearHistory(): void {
    this.recoveryHistory.clear();
  }

  static getRecoveryStatistics(): {
    totalAttempts: number;
    successfulRecoveries: number;
    failedRecoveries: number;
    strategiesUsed: Record<string, number>;
  } {
    const totalAttempts = Array.from(this.recoveryHistory.values()).reduce((sum, count) => sum + count, 0);
    
    // This is a simplified version - in a real implementation, you'd track more detailed statistics
    return {
      totalAttempts,
      successfulRecoveries: 0, // Would be tracked separately
      failedRecoveries: 0,     // Would be tracked separately
      strategiesUsed: {}       // Would be tracked separately
    };
  }
}

// Default recovery strategies

// File Re-upload Strategy
const fileReuploadStrategy: RecoveryStrategy = {
  name: 'File Re-upload',
  canRecover: (error: ParserError) => {
    return [
      ErrorCode.FILE_CORRUPTED,
      ErrorCode.PDF_EXTRACTION_FAILED,
      ErrorCode.DOCX_PARSING_FAILED
    ].includes(error.code);
  },
  recover: async (error: ParserError, context?: any) => {
    // This would typically trigger a UI prompt for the user to re-upload
    throw new Error('User intervention required for file re-upload');
  },
  maxAttempts: 1,
  delayMs: 0
};

// OCR Fallback Strategy
const ocrFallbackStrategy: RecoveryStrategy = {
  name: 'OCR Fallback',
  canRecover: (error: ParserError) => {
    return [
      ErrorCode.PDF_NO_TEXT_CONTENT,
      ErrorCode.PDF_EXTRACTION_FAILED
    ].includes(error.code);
  },
  recover: async (error: ParserError, context?: any) => {
    if (!context?.file) {
      throw new Error('File context required for OCR fallback');
    }

    // Import OCR strategy dynamically
    const { OCRParsingStrategy } = await import('./parsing/strategies/OCRParsingStrategy');
    const ocrStrategy = new OCRParsingStrategy();
    
    return await ocrStrategy.parse(context.file);
  },
  maxAttempts: 2,
  delayMs: 1000
};

// Alternative Parser Strategy
const alternativeParserStrategy: RecoveryStrategy = {
  name: 'Alternative Parser',
  canRecover: (error: ParserError) => {
    return [
      ErrorCode.PDF_EXTRACTION_FAILED,
      ErrorCode.DOCX_PARSING_FAILED,
      ErrorCode.TEXT_EXTRACTION_FAILED
    ].includes(error.code);
  },
  recover: async (error: ParserError, context?: any) => {
    if (!context?.file) {
      throw new Error('File context required for alternative parser');
    }

    // Try different parsing strategies based on file type
    const fileName = context.file.name.toLowerCase();
    
    if (fileName.endsWith('.pdf')) {
      // Try PDF.js if pdfParse failed
      const { PDFJSParsingStrategy } = await import('./parsing/strategies/PDFJSParsingStrategy');
      const pdfStrategy = new PDFJSParsingStrategy();
      return await pdfStrategy.parse(context.file);
    } else if (fileName.endsWith('.docx')) {
      // Try mammoth if other DOCX parser failed
      const { MammothParsingStrategy } = await import('./parsing/strategies/MammothParsingStrategy');
      const mammothStrategy = new MammothParsingStrategy();
      return await mammothStrategy.parse(context.file);
    }
    
    throw new Error('No alternative parser available for this file type');
  },
  maxAttempts: 1,
  delayMs: 500
};

// Memory Cleanup Strategy
const memoryCleanupStrategy: RecoveryStrategy = {
  name: 'Memory Cleanup',
  canRecover: (error: ParserError) => {
    return error.code === ErrorCode.MEMORY_LIMIT_EXCEEDED;
  },
  recover: async (error: ParserError, context?: any) => {
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }

    // Clear any large cached data
    if (context?.clearCache) {
      context.clearCache();
    }

    // Wait for memory to be freed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Retry the original operation with reduced memory usage
    if (context?.retryWithReducedMemory) {
      return await context.retryWithReducedMemory();
    }

    throw new Error('Memory cleanup completed, but retry mechanism not available');
  },
  maxAttempts: 1,
  delayMs: 2000
};

// Timeout Retry Strategy
const timeoutRetryStrategy: RecoveryStrategy = {
  name: 'Timeout Retry',
  canRecover: (error: ParserError) => {
    return error.code === ErrorCode.TIMEOUT_EXCEEDED;
  },
  recover: async (error: ParserError, context?: any) => {
    if (!context?.retryOperation) {
      throw new Error('Retry operation not available');
    }

    // Retry with increased timeout
    const originalTimeout = context.timeout || 30000;
    const newTimeout = Math.min(originalTimeout * 2, 120000); // Max 2 minutes

    return await context.retryOperation({ timeout: newTimeout });
  },
  maxAttempts: 2,
  delayMs: 1000
};

// Network Retry Strategy
const networkRetryStrategy: RecoveryStrategy = {
  name: 'Network Retry',
  canRecover: (error: ParserError) => {
    return error.code === ErrorCode.NETWORK_ERROR;
  },
  recover: async (error: ParserError, context?: any) => {
    if (!context?.retryNetworkOperation) {
      throw new Error('Network retry operation not available');
    }

    // Check network connectivity
    if (!navigator.onLine) {
      throw new Error('Network is offline');
    }

    return await context.retryNetworkOperation();
  },
  maxAttempts: 3,
  delayMs: 2000
};

// Register default strategies
ErrorRecoveryService.registerStrategy(memoryCleanupStrategy);
ErrorRecoveryService.registerStrategy(timeoutRetryStrategy);
ErrorRecoveryService.registerStrategy(networkRetryStrategy);
ErrorRecoveryService.registerStrategy(ocrFallbackStrategy);
ErrorRecoveryService.registerStrategy(alternativeParserStrategy);
ErrorRecoveryService.registerStrategy(fileReuploadStrategy);

export default ErrorRecoveryService;