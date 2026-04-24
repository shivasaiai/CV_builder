/**
 * Production-grade error handling for resume parser
 * Provides structured error types and recovery strategies
 */

export enum ErrorCode {
  // File-related errors
  FILE_NOT_PROVIDED = 'FILE_NOT_PROVIDED',
  FILE_EMPTY = 'FILE_EMPTY',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_TYPE_UNSUPPORTED = 'FILE_TYPE_UNSUPPORTED',
  FILE_CORRUPTED = 'FILE_CORRUPTED',
  
  // PDF-specific errors
  PDF_INVALID_FORMAT = 'PDF_INVALID_FORMAT',
  PDF_PASSWORD_PROTECTED = 'PDF_PASSWORD_PROTECTED',
  PDF_NO_TEXT_CONTENT = 'PDF_NO_TEXT_CONTENT',
  PDF_EXTRACTION_FAILED = 'PDF_EXTRACTION_FAILED',
  
  // OCR-specific errors
  OCR_INITIALIZATION_FAILED = 'OCR_INITIALIZATION_FAILED',
  OCR_PROCESSING_FAILED = 'OCR_PROCESSING_FAILED',
  OCR_INSUFFICIENT_QUALITY = 'OCR_INSUFFICIENT_QUALITY',
  
  // Document processing errors
  DOCX_PARSING_FAILED = 'DOCX_PARSING_FAILED',
  TEXT_EXTRACTION_FAILED = 'TEXT_EXTRACTION_FAILED',
  
  // Data parsing errors
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  CONTACT_INFO_MISSING = 'CONTACT_INFO_MISSING',
  WORK_EXPERIENCE_MISSING = 'WORK_EXPERIENCE_MISSING',
  EDUCATION_INFO_MISSING = 'EDUCATION_INFO_MISSING',
  
  // System errors
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  TIMEOUT_EXCEEDED = 'TIMEOUT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'LOW',           // Warning, parsing can continue
  MEDIUM = 'MEDIUM',     // Significant issue, some data may be missing
  HIGH = 'HIGH',         // Critical issue, parsing may fail
  CRITICAL = 'CRITICAL'  // Fatal error, parsing cannot continue
}

export interface ErrorContext {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  processingStep?: string;
  additionalInfo?: Record<string, any>;
}

export class ParserError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly timestamp: number;
  public readonly recoverable: boolean;
  public readonly userMessage: string;

  constructor(
    code: ErrorCode,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.HIGH,
    context: ErrorContext = {},
    recoverable: boolean = false,
    userMessage?: string
  ) {
    super(message);
    this.name = 'ParserError';
    this.code = code;
    this.severity = severity;
    this.context = context;
    this.timestamp = Date.now();
    this.recoverable = recoverable;
    this.userMessage = userMessage || this.generateUserMessage();
  }

  private generateUserMessage(): string {
    switch (this.code) {
      case ErrorCode.FILE_NOT_PROVIDED:
        return 'Please select a file to upload.';
      
      case ErrorCode.FILE_EMPTY:
        return 'The selected file appears to be empty. Please choose a different file.';
      
      case ErrorCode.FILE_TOO_LARGE:
        return `File is too large (${(this.context.fileSize! / 1024 / 1024).toFixed(1)}MB). Maximum size is 50MB.`;
      
      case ErrorCode.FILE_TYPE_UNSUPPORTED:
        return 'This file type is not supported. Please upload a PDF, DOCX, DOC, TXT, RTF, or image file.';
      
      case ErrorCode.PDF_PASSWORD_PROTECTED:
        return 'This PDF is password protected. Please provide an unlocked PDF file.';
      
      case ErrorCode.PDF_NO_TEXT_CONTENT:
        return 'No text could be extracted from this PDF. It may be an image-based PDF or corrupted.';
      
      case ErrorCode.OCR_PROCESSING_FAILED:
        return 'Could not extract text from the image-based content. The image quality may be too poor.';
      
      case ErrorCode.INSUFFICIENT_DATA:
        return 'Not enough information could be extracted from the resume. Please check if the file contains readable text.';
      
      case ErrorCode.CONTACT_INFO_MISSING:
        return 'Could not find contact information in the resume. Please ensure your name and email are clearly visible.';
      
      case ErrorCode.TIMEOUT_EXCEEDED:
        return 'Processing took too long and was cancelled. Please try with a smaller file or simpler format.';
      
      default:
        return 'An error occurred while processing your resume. Please try again or contact support.';
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp,
      recoverable: this.recoverable,
      stack: this.stack
    };
  }
}

export class ErrorHandler {
  private static errorCounts: Map<ErrorCode, number> = new Map();
  private static errorHistory: ParserError[] = [];
  private static maxHistorySize: number = 100;

  static handle(error: Error | ParserError, context: ErrorContext = {}): ParserError {
    let parserError: ParserError;

    if (error instanceof ParserError) {
      parserError = error;
    } else {
      // Convert generic error to ParserError
      parserError = this.convertToParserError(error, context);
    }

    // Track error statistics
    const currentCount = this.errorCounts.get(parserError.code) || 0;
    this.errorCounts.set(parserError.code, currentCount + 1);

    // Add to history
    this.errorHistory.push(parserError);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }

    // Log the error
    console.error('Parser Error:', parserError.toJSON());

    return parserError;
  }

  private static convertToParserError(error: Error, context: ErrorContext): ParserError {
    const message = error.message.toLowerCase();

    // PDF-specific errors
    if (message.includes('invalid pdf') || message.includes('pdf format')) {
      return new ParserError(
        ErrorCode.PDF_INVALID_FORMAT,
        error.message,
        ErrorSeverity.HIGH,
        context,
        false
      );
    }

    if (message.includes('password') || message.includes('encrypted')) {
      return new ParserError(
        ErrorCode.PDF_PASSWORD_PROTECTED,
        error.message,
        ErrorSeverity.HIGH,
        context,
        false
      );
    }

    // OCR-specific errors
    if (message.includes('tesseract') || message.includes('ocr')) {
      return new ParserError(
        ErrorCode.OCR_PROCESSING_FAILED,
        error.message,
        ErrorSeverity.MEDIUM,
        context,
        true
      );
    }

    // DOCX-specific errors
    if (message.includes('docx') || message.includes('mammoth')) {
      return new ParserError(
        ErrorCode.DOCX_PARSING_FAILED,
        error.message,
        ErrorSeverity.MEDIUM,
        context,
        true
      );
    }

    // Memory/timeout errors
    if (message.includes('memory') || message.includes('heap')) {
      return new ParserError(
        ErrorCode.MEMORY_LIMIT_EXCEEDED,
        error.message,
        ErrorSeverity.CRITICAL,
        context,
        false
      );
    }

    if (message.includes('timeout') || message.includes('time out')) {
      return new ParserError(
        ErrorCode.TIMEOUT_EXCEEDED,
        error.message,
        ErrorSeverity.HIGH,
        context,
        true
      );
    }

    // Default to unknown error
    return new ParserError(
      ErrorCode.UNKNOWN_ERROR,
      error.message,
      ErrorSeverity.MEDIUM,
      context,
      true
    );
  }

  static createFileValidationError(file: File): ParserError | null {
    if (!file) {
      return new ParserError(
        ErrorCode.FILE_NOT_PROVIDED,
        'No file provided',
        ErrorSeverity.HIGH,
        {},
        false
      );
    }

    if (file.size === 0) {
      return new ParserError(
        ErrorCode.FILE_EMPTY,
        'File is empty',
        ErrorSeverity.HIGH,
        { fileName: file.name, fileSize: file.size },
        false
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return new ParserError(
        ErrorCode.FILE_TOO_LARGE,
        `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        ErrorSeverity.HIGH,
        { fileName: file.name, fileSize: file.size },
        false
      );
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/rtf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff'
    ];

    const fileName = file.name.toLowerCase();
    const hasValidExtension = /\.(pdf|docx?|txt|rtf|jpe?g|png|gif|bmp|tiff?)$/i.test(fileName);
    const hasValidMimeType = allowedTypes.some(type => 
      file.type === type || file.type.includes(type.split('/')[1])
    );

    if (!hasValidExtension && !hasValidMimeType && file.type !== '') {
      return new ParserError(
        ErrorCode.FILE_TYPE_UNSUPPORTED,
        `Unsupported file type: ${file.type}`,
        ErrorSeverity.MEDIUM,
        { fileName: file.name, fileType: file.type },
        false
      );
    }

    return null;
  }

  static getErrorStatistics(): {
    totalErrors: number;
    errorsByCode: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: ParserError[];
    mostCommonErrors: Array<{ code: ErrorCode; count: number }>;
  } {
    const errorsByCode: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    this.errorCounts.forEach((count, code) => {
      errorsByCode[code] = count;
    });

    this.errorHistory.forEach(error => {
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });

    const mostCommonErrors = Array.from(this.errorCounts.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalErrors: this.errorHistory.length,
      errorsByCode,
      errorsBySeverity,
      recentErrors: this.errorHistory.slice(-10),
      mostCommonErrors
    };
  }

  static clearHistory(): void {
    this.errorHistory = [];
    this.errorCounts.clear();
  }
}

// Convenience functions for creating specific errors
export const createError = {
  fileNotProvided: () => new ParserError(
    ErrorCode.FILE_NOT_PROVIDED,
    'No file provided',
    ErrorSeverity.HIGH
  ),

  fileEmpty: (fileName: string) => new ParserError(
    ErrorCode.FILE_EMPTY,
    'File is empty',
    ErrorSeverity.HIGH,
    { fileName }
  ),

  fileTooLarge: (fileName: string, size: number) => new ParserError(
    ErrorCode.FILE_TOO_LARGE,
    `File too large: ${(size / 1024 / 1024).toFixed(2)}MB`,
    ErrorSeverity.HIGH,
    { fileName, fileSize: size }
  ),

  pdfPasswordProtected: (fileName: string) => new ParserError(
    ErrorCode.PDF_PASSWORD_PROTECTED,
    'PDF is password protected',
    ErrorSeverity.HIGH,
    { fileName }
  ),

  insufficientData: (fileName: string, extractedLength: number) => new ParserError(
    ErrorCode.INSUFFICIENT_DATA,
    `Insufficient data extracted: ${extractedLength} characters`,
    ErrorSeverity.MEDIUM,
    { fileName, extractedLength },
    true
  ),

  ocrFailed: (fileName: string, reason: string) => new ParserError(
    ErrorCode.OCR_PROCESSING_FAILED,
    `OCR processing failed: ${reason}`,
    ErrorSeverity.MEDIUM,
    { fileName },
    true
  )
};