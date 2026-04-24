import { 
  ClassifiedError, 
  ErrorCategory, 
  ErrorSeverity, 
  RecoveryStrategy 
} from './ErrorClassification';

/**
 * Error recovery system with automatic and manual recovery strategies
 */

export interface RecoveryResult {
  success: boolean;
  result?: any;
  error?: ClassifiedError;
  strategyUsed?: string;
  recoveryTime: number;
  message: string;
}

export interface RecoveryContext {
  file?: File;
  originalStrategy?: string;
  attemptCount: number;
  maxAttempts: number;
  previousErrors: ClassifiedError[];
  userPreferences?: Record<string, any>;
}

/**
 * Error recovery manager
 */
export class ErrorRecoveryManager {
  private recoveryStrategies: RecoveryStrategy[] = [];
  private recoveryHistory: Map<string, RecoveryResult[]> = new Map();

  constructor() {
    this.initializeDefaultStrategies();
  }

  /**
   * Initialize default recovery strategies
   */
  private initializeDefaultStrategies(): void {
    this.recoveryStrategies = [
      {
        name: 'retry_with_delay',
        description: 'Retry the operation after a short delay',
        priority: 100,
        applicableCategories: [
          ErrorCategory.NETWORK,
          ErrorCategory.TIMEOUT,
          ErrorCategory.MEMORY
        ],
        execute: async (error: ClassifiedError, context: RecoveryContext) => {
          const delay = Math.min(1000 * Math.pow(2, context.attemptCount), 10000);
          await this.delay(delay);
          return { retryRequested: true, delay };
        }
      },
      {
        name: 'fallback_to_ocr',
        description: 'Use OCR as fallback for text extraction failures',
        priority: 90,
        applicableCategories: [
          ErrorCategory.TEXT_EXTRACTION,
          ErrorCategory.PARSING_ENGINE
        ],
        execute: async (error: ClassifiedError, context: RecoveryContext) => {
          if (context.file && context.originalStrategy !== 'OCR Parser') {
            return { 
              fallbackStrategy: 'OCR Parser',
              reason: 'Text extraction failed, trying OCR'
            };
          }
          throw new Error('OCR fallback not applicable');
        }
      },
      {
        name: 'reduce_file_size',
        description: 'Suggest file size reduction for large files',
        priority: 80,
        applicableCategories: [
          ErrorCategory.MEMORY,
          ErrorCategory.TIMEOUT
        ],
        execute: async (error: ClassifiedError, context: RecoveryContext) => {
          if (context.file && context.file.size > 5 * 1024 * 1024) {
            return {
              suggestion: 'file_too_large',
              message: 'Consider compressing the file or using a smaller version',
              maxRecommendedSize: '5MB'
            };
          }
          throw new Error('File size reduction not applicable');
        }
      },
      {
        name: 'alternative_parsing_strategy',
        description: 'Try alternative parsing strategy',
        priority: 85,
        applicableCategories: [
          ErrorCategory.PARSING_ENGINE,
          ErrorCategory.TEXT_EXTRACTION
        ],
        execute: async (error: ClassifiedError, context: RecoveryContext) => {
          const alternativeStrategies = this.getAlternativeStrategies(
            context.originalStrategy,
            context.file
          );
          
          if (alternativeStrategies.length > 0) {
            return {
              alternativeStrategy: alternativeStrategies[0],
              reason: 'Primary parsing strategy failed'
            };
          }
          throw new Error('No alternative strategies available');
        }
      },
      {
        name: 'format_conversion_suggestion',
        description: 'Suggest converting to a different format',
        priority: 70,
        applicableCategories: [
          ErrorCategory.FILE_VALIDATION,
          ErrorCategory.PARSING_ENGINE
        ],
        execute: async (error: ClassifiedError, context: RecoveryContext) => {
          const currentFormat = context.file?.type || 'unknown';
          const recommendedFormats = this.getRecommendedFormats(currentFormat);
          
          return {
            suggestion: 'format_conversion',
            currentFormat,
            recommendedFormats,
            message: 'Try converting to one of the recommended formats'
          };
        }
      },
      {
        name: 'manual_intervention',
        description: 'Request manual user intervention',
        priority: 50,
        applicableCategories: [
          ErrorCategory.FILE_ACCESS,
          ErrorCategory.CONFIGURATION,
          ErrorCategory.UNKNOWN
        ],
        execute: async (error: ClassifiedError, context: RecoveryContext) => {
          return {
            suggestion: 'manual_intervention',
            message: 'Manual review and correction required',
            userActions: error.getSuggestions()
          };
        }
      }
    ];

    // Sort strategies by priority
    this.recoveryStrategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Attempt to recover from an error
   */
  public async attemptRecovery(
    error: ClassifiedError,
    context: RecoveryContext
  ): Promise<RecoveryResult> {
    const startTime = performance.now();
    const errorKey = `${error.classification.code}_${context.file?.name || 'unknown'}`;

    console.log('🔄 Attempting error recovery:', {
      error: error.classification.code,
      category: error.classification.category,
      severity: error.classification.severity,
      attempt: context.attemptCount,
      maxAttempts: context.maxAttempts
    });

    // Check if we've exceeded max attempts
    if (context.attemptCount >= context.maxAttempts) {
      const result: RecoveryResult = {
        success: false,
        error,
        recoveryTime: performance.now() - startTime,
        message: 'Maximum recovery attempts exceeded'
      };
      this.recordRecoveryAttempt(errorKey, result);
      return result;
    }

    // Find applicable recovery strategies
    const applicableStrategies = this.recoveryStrategies.filter(strategy =>
      strategy.applicableCategories.includes(error.classification.category)
    );

    if (applicableStrategies.length === 0) {
      const result: RecoveryResult = {
        success: false,
        error,
        recoveryTime: performance.now() - startTime,
        message: 'No applicable recovery strategies found'
      };
      this.recordRecoveryAttempt(errorKey, result);
      return result;
    }

    // Try each applicable strategy
    for (const strategy of applicableStrategies) {
      try {
        console.log(`🔧 Trying recovery strategy: ${strategy.name}`);
        
        const strategyResult = await strategy.execute(error, context);
        const recoveryTime = performance.now() - startTime;

        const result: RecoveryResult = {
          success: true,
          result: strategyResult,
          strategyUsed: strategy.name,
          recoveryTime,
          message: `Recovery successful using ${strategy.name}`
        };

        console.log('✅ Recovery strategy succeeded:', {
          strategy: strategy.name,
          result: strategyResult,
          recoveryTime: Math.round(recoveryTime)
        });

        this.recordRecoveryAttempt(errorKey, result);
        return result;

      } catch (strategyError) {
        console.warn(`❌ Recovery strategy ${strategy.name} failed:`, strategyError);
        continue;
      }
    }

    // All strategies failed
    const result: RecoveryResult = {
      success: false,
      error,
      recoveryTime: performance.now() - startTime,
      message: 'All recovery strategies failed'
    };

    this.recordRecoveryAttempt(errorKey, result);
    return result;
  }

  /**
   * Get recovery suggestions for an error
   */
  public getRecoverySuggestions(error: ClassifiedError): {
    immediate: string[];
    alternative: string[];
    preventive: string[];
  } {
    const suggestions = {
      immediate: [...error.getSuggestions()],
      alternative: [] as string[],
      preventive: [] as string[]
    };

    // Add category-specific suggestions
    switch (error.classification.category) {
      case ErrorCategory.FILE_VALIDATION:
        suggestions.alternative.push(
          'Try a different file format (PDF, DOCX, or image)',
          'Check if the file is corrupted by opening it in its native application'
        );
        suggestions.preventive.push(
          'Ensure files are saved in supported formats',
          'Keep file sizes under 50MB for best performance'
        );
        break;

      case ErrorCategory.OCR_PROCESSING:
        suggestions.alternative.push(
          'Use a higher resolution image',
          'Ensure text is clearly visible and not handwritten',
          'Try a different image format (PNG, JPEG)'
        );
        suggestions.preventive.push(
          'Scan documents at 300 DPI or higher',
          'Ensure good lighting and contrast when taking photos',
          'Use text-based PDFs when possible'
        );
        break;

      case ErrorCategory.PARSING_ENGINE:
        suggestions.alternative.push(
          'Try converting the document to a different format',
          'Use a simpler document layout',
          'Remove complex formatting or images'
        );
        suggestions.preventive.push(
          'Use standard document formats',
          'Avoid password protection',
          'Keep document structure simple'
        );
        break;

      case ErrorCategory.NETWORK:
        suggestions.alternative.push(
          'Try again when you have a better connection',
          'Use a smaller file if possible',
          'Switch to a different network'
        );
        suggestions.preventive.push(
          'Ensure stable internet connection',
          'Avoid processing large files on slow connections'
        );
        break;

      case ErrorCategory.TIMEOUT:
        suggestions.alternative.push(
          'Break large documents into smaller sections',
          'Try during off-peak hours',
          'Use a faster device if available'
        );
        suggestions.preventive.push(
          'Keep documents under 10MB for faster processing',
          'Close unnecessary browser tabs',
          'Use a device with sufficient memory'
        );
        break;
    }

    return suggestions;
  }

  /**
   * Check if error is worth retrying
   */
  public shouldRetry(error: ClassifiedError, context: RecoveryContext): boolean {
    // Don't retry if not retryable
    if (!error.isRetryable()) {
      return false;
    }

    // Don't retry if max attempts reached
    if (context.attemptCount >= context.maxAttempts) {
      return false;
    }

    // Don't retry critical errors
    if (error.classification.severity === ErrorSeverity.CRITICAL) {
      return false;
    }

    // Check retry history
    const errorKey = `${error.classification.code}_${context.file?.name || 'unknown'}`;
    const history = this.recoveryHistory.get(errorKey) || [];
    
    // Don't retry if we've had too many recent failures
    const recentFailures = history.filter(
      result => !result.success && 
      Date.now() - new Date(result.recoveryTime).getTime() < 300000 // 5 minutes
    ).length;

    return recentFailures < 3;
  }

  /**
   * Get alternative parsing strategies
   */
  private getAlternativeStrategies(
    currentStrategy?: string,
    file?: File
  ): string[] {
    const alternatives: string[] = [];

    if (!file) return alternatives;

    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    // PDF alternatives
    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      if (currentStrategy !== 'OCR Parser') {
        alternatives.push('OCR Parser');
      }
    }

    // DOCX alternatives
    if (fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      if (currentStrategy !== 'Text Parser') {
        alternatives.push('Text Parser');
      }
    }

    // Image alternatives
    if (fileType.includes('image') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/)) {
      if (currentStrategy !== 'OCR Parser') {
        alternatives.push('OCR Parser');
      }
    }

    return alternatives;
  }

  /**
   * Get recommended formats for conversion
   */
  private getRecommendedFormats(currentFormat: string): string[] {
    const recommendations: string[] = [];

    if (currentFormat.includes('pdf')) {
      recommendations.push('DOCX', 'PNG', 'JPEG');
    } else if (currentFormat.includes('word')) {
      recommendations.push('PDF', 'TXT');
    } else if (currentFormat.includes('image')) {
      recommendations.push('PDF', 'PNG');
    } else {
      recommendations.push('PDF', 'DOCX', 'PNG');
    }

    return recommendations;
  }

  /**
   * Record recovery attempt for analysis
   */
  private recordRecoveryAttempt(errorKey: string, result: RecoveryResult): void {
    if (!this.recoveryHistory.has(errorKey)) {
      this.recoveryHistory.set(errorKey, []);
    }
    
    const history = this.recoveryHistory.get(errorKey)!;
    history.push(result);
    
    // Keep only last 10 attempts
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
  }

  /**
   * Get recovery statistics
   */
  public getRecoveryStats(): {
    totalAttempts: number;
    successRate: number;
    strategiesUsed: Record<string, number>;
    averageRecoveryTime: number;
  } {
    let totalAttempts = 0;
    let successfulAttempts = 0;
    let totalRecoveryTime = 0;
    const strategiesUsed: Record<string, number> = {};

    this.recoveryHistory.forEach(history => {
      history.forEach(result => {
        totalAttempts++;
        totalRecoveryTime += result.recoveryTime;
        
        if (result.success) {
          successfulAttempts++;
          if (result.strategyUsed) {
            strategiesUsed[result.strategyUsed] = (strategiesUsed[result.strategyUsed] || 0) + 1;
          }
        }
      });
    });

    return {
      totalAttempts,
      successRate: totalAttempts > 0 ? successfulAttempts / totalAttempts : 0,
      strategiesUsed,
      averageRecoveryTime: totalAttempts > 0 ? totalRecoveryTime / totalAttempts : 0
    };
  }

  /**
   * Add custom recovery strategy
   */
  public addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.push(strategy);
    this.recoveryStrategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}