/**
 * Comprehensive error classification system for parsing operations
 */

export enum ErrorCategory {
  FILE_VALIDATION = 'FILE_VALIDATION',
  FILE_ACCESS = 'FILE_ACCESS',
  PARSING_ENGINE = 'PARSING_ENGINE',
  OCR_PROCESSING = 'OCR_PROCESSING',
  TEXT_EXTRACTION = 'TEXT_EXTRACTION',
  CONTENT_VALIDATION = 'CONTENT_VALIDATION',
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  MEMORY = 'MEMORY',
  CONFIGURATION = 'CONFIGURATION',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  CRITICAL = 'CRITICAL',   // Complete failure, no recovery possible
  HIGH = 'HIGH',           // Major issue, limited recovery options
  MEDIUM = 'MEDIUM',       // Moderate issue, recovery possible
  LOW = 'LOW',             // Minor issue, easily recoverable
  WARNING = 'WARNING'      // Not an error, but worth noting
}

export interface ErrorClassification {
  category: ErrorCategory;
  severity: ErrorSeverity;
  code: string;
  message: string;
  userMessage: string;
  suggestions: string[];
  recoverable: boolean;
  retryable: boolean;
  context?: Record<string, any>;
}

export interface RecoveryStrategy {
  name: string;
  description: string;
  execute: (error: ClassifiedError, context: any) => Promise<any>;
  applicableCategories: ErrorCategory[];
  priority: number;
}

/**
 * Enhanced error class with classification and recovery information
 */
export class ClassifiedError extends Error {
  public readonly classification: ErrorClassification;
  public readonly originalError?: Error;
  public readonly timestamp: Date;
  public readonly stackTrace: string;

  constructor(
    classification: ErrorClassification,
    originalError?: Error
  ) {
    super(classification.message);
    this.name = 'ClassifiedError';
    this.classification = classification;
    this.originalError = originalError;
    this.timestamp = new Date();
    this.stackTrace = this.stack || new Error().stack || '';

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ClassifiedError.prototype);
  }

  /**
   * Get user-friendly error message
   */
  public getUserMessage(): string {
    return this.classification.userMessage;
  }

  /**
   * Get recovery suggestions
   */
  public getSuggestions(): string[] {
    return this.classification.suggestions;
  }

  /**
   * Check if error is recoverable
   */
  public isRecoverable(): boolean {
    return this.classification.recoverable;
  }

  /**
   * Check if operation can be retried
   */
  public isRetryable(): boolean {
    return this.classification.retryable;
  }

  /**
   * Get error context
   */
  public getContext(): Record<string, any> {
    return this.classification.context || {};
  }

  /**
   * Convert to JSON for logging
   */
  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      classification: this.classification,
      originalError: this.originalError?.message,
      timestamp: this.timestamp.toISOString(),
      stackTrace: this.stackTrace
    };
  }
}

/**
 * Error classifier that categorizes and enriches errors
 */
export class ErrorClassifier {
  private static readonly ERROR_PATTERNS: Array<{
    pattern: RegExp | string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    code: string;
    userMessage: string;
    suggestions: string[];
    recoverable: boolean;
    retryable: boolean;
  }> = [
    // File validation errors
    {
      pattern: /no file provided|file is null|file is undefined/i,
      category: ErrorCategory.FILE_VALIDATION,
      severity: ErrorSeverity.HIGH,
      code: 'NO_FILE',
      userMessage: 'No file was provided for processing.',
      suggestions: ['Please select a file to upload', 'Ensure the file selection was successful'],
      recoverable: true,
      retryable: false
    },
    {
      pattern: /file is empty|0 bytes|empty file/i,
      category: ErrorCategory.FILE_VALIDATION,
      severity: ErrorSeverity.HIGH,
      code: 'EMPTY_FILE',
      userMessage: 'The selected file appears to be empty.',
      suggestions: ['Check if the file was uploaded correctly', 'Try selecting a different file', 'Verify the file contains content'],
      recoverable: true,
      retryable: false
    },
    {
      pattern: /file too large|exceeds maximum size|file size limit/i,
      category: ErrorCategory.FILE_VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      code: 'FILE_TOO_LARGE',
      userMessage: 'The file is too large to process.',
      suggestions: ['Compress the file to reduce its size', 'Split large documents into smaller files', 'Use a different file format'],
      recoverable: true,
      retryable: false
    },
    {
      pattern: /unsupported file type|invalid file format|not supported/i,
      category: ErrorCategory.FILE_VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      code: 'UNSUPPORTED_FORMAT',
      userMessage: 'This file format is not supported.',
      suggestions: ['Convert to PDF, DOCX, or image format', 'Check if the file extension matches the content', 'Try a different file'],
      recoverable: true,
      retryable: false
    },

    // PDF-specific errors
    {
      pattern: /invalid pdf|corrupted pdf|pdf format/i,
      category: ErrorCategory.PARSING_ENGINE,
      severity: ErrorSeverity.HIGH,
      code: 'INVALID_PDF',
      userMessage: 'The PDF file appears to be corrupted or invalid.',
      suggestions: ['Try opening the PDF in a PDF viewer to verify it works', 'Re-save or re-export the PDF', 'Convert to a different format'],
      recoverable: true,
      retryable: true
    },
    {
      pattern: /password protected|password required|encrypted pdf/i,
      category: ErrorCategory.FILE_ACCESS,
      severity: ErrorSeverity.HIGH,
      code: 'PASSWORD_PROTECTED',
      userMessage: 'This PDF is password protected and cannot be processed.',
      suggestions: ['Remove the password protection from the PDF', 'Use an unlocked version of the document', 'Convert to a different format'],
      recoverable: true,
      retryable: false
    },
    {
      pattern: /no text extracted|insufficient text|image-based pdf/i,
      category: ErrorCategory.TEXT_EXTRACTION,
      severity: ErrorSeverity.MEDIUM,
      code: 'NO_TEXT_CONTENT',
      userMessage: 'Unable to extract readable text from this document.',
      suggestions: ['The document may be image-based - OCR will be attempted', 'Ensure the document contains selectable text', 'Try a text-based version of the document'],
      recoverable: true,
      retryable: true
    },

    // OCR errors
    {
      pattern: /ocr failed|tesseract error|recognition failed/i,
      category: ErrorCategory.OCR_PROCESSING,
      severity: ErrorSeverity.HIGH,
      code: 'OCR_FAILED',
      userMessage: 'Text recognition (OCR) failed to process this image.',
      suggestions: ['Ensure the image has clear, readable text', 'Try improving image quality or resolution', 'Use a different image or document format'],
      recoverable: true,
      retryable: true
    },
    {
      pattern: /low ocr confidence|poor image quality|unclear text/i,
      category: ErrorCategory.OCR_PROCESSING,
      severity: ErrorSeverity.MEDIUM,
      code: 'LOW_OCR_CONFIDENCE',
      userMessage: 'Text recognition completed but with low confidence.',
      suggestions: ['Review the extracted text carefully', 'Consider using a higher quality image', 'Manual verification recommended'],
      recoverable: true,
      retryable: true
    },

    // DOCX errors
    {
      pattern: /not a valid zip|docx corrupt|word document error/i,
      category: ErrorCategory.PARSING_ENGINE,
      severity: ErrorSeverity.HIGH,
      code: 'CORRUPT_DOCX',
      userMessage: 'The Word document appears to be corrupted.',
      suggestions: ['Try opening the document in Microsoft Word', 'Re-save the document in DOCX format', 'Convert to PDF format'],
      recoverable: true,
      retryable: true
    },

    // Network and timeout errors
    {
      pattern: /timeout|timed out|operation timeout/i,
      category: ErrorCategory.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      code: 'PROCESSING_TIMEOUT',
      userMessage: 'The processing operation timed out.',
      suggestions: ['Try again with a smaller file', 'Check your internet connection', 'The file may be too complex to process quickly'],
      recoverable: true,
      retryable: true
    },
    {
      pattern: /network error|connection failed|fetch failed/i,
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      code: 'NETWORK_ERROR',
      userMessage: 'A network error occurred during processing.',
      suggestions: ['Check your internet connection', 'Try again in a few moments', 'Ensure you have a stable connection'],
      recoverable: true,
      retryable: true
    },

    // Memory errors
    {
      pattern: /out of memory|memory limit|allocation failed/i,
      category: ErrorCategory.MEMORY,
      severity: ErrorSeverity.HIGH,
      code: 'MEMORY_ERROR',
      userMessage: 'Insufficient memory to process this file.',
      suggestions: ['Try a smaller file', 'Close other browser tabs', 'Restart your browser and try again'],
      recoverable: true,
      retryable: true
    },

    // Configuration errors
    {
      pattern: /configuration error|invalid config|setup failed/i,
      category: ErrorCategory.CONFIGURATION,
      severity: ErrorSeverity.CRITICAL,
      code: 'CONFIG_ERROR',
      userMessage: 'A configuration error occurred.',
      suggestions: ['Please contact support', 'Try refreshing the page', 'Clear browser cache and try again'],
      recoverable: false,
      retryable: false
    }
  ];

  /**
   * Classify an error and return enhanced error information
   */
  public static classify(
    error: Error | string,
    context?: Record<string, any>
  ): ClassifiedError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const originalError = typeof error === 'string' ? undefined : error;

    // Find matching pattern
    const matchedPattern = this.ERROR_PATTERNS.find(pattern => {
      if (typeof pattern.pattern === 'string') {
        return errorMessage.toLowerCase().includes(pattern.pattern.toLowerCase());
      } else {
        return pattern.pattern.test(errorMessage);
      }
    });

    // Use matched pattern or create generic classification
    const classification: ErrorClassification = matchedPattern ? {
      category: matchedPattern.category,
      severity: matchedPattern.severity,
      code: matchedPattern.code,
      message: errorMessage,
      userMessage: matchedPattern.userMessage,
      suggestions: matchedPattern.suggestions,
      recoverable: matchedPattern.recoverable,
      retryable: matchedPattern.retryable,
      context
    } : {
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      userMessage: 'An unexpected error occurred during processing.',
      suggestions: ['Try again', 'If the problem persists, please contact support'],
      recoverable: true,
      retryable: true,
      context
    };

    return new ClassifiedError(classification, originalError);
  }

  /**
   * Get error statistics for monitoring
   */
  public static getErrorStats(errors: ClassifiedError[]): {
    totalErrors: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recoverableCount: number;
    retryableCount: number;
  } {
    const stats = {
      totalErrors: errors.length,
      byCategory: {} as Record<ErrorCategory, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      recoverableCount: 0,
      retryableCount: 0
    };

    // Initialize counters
    Object.values(ErrorCategory).forEach(category => {
      stats.byCategory[category] = 0;
    });
    Object.values(ErrorSeverity).forEach(severity => {
      stats.bySeverity[severity] = 0;
    });

    // Count errors
    errors.forEach(error => {
      stats.byCategory[error.classification.category]++;
      stats.bySeverity[error.classification.severity]++;
      if (error.isRecoverable()) stats.recoverableCount++;
      if (error.isRetryable()) stats.retryableCount++;
    });

    return stats;
  }
}