import { ParsingStrategy, ProgressCallback } from '../interfaces';
import { ParserError, ErrorHandler, ErrorCode, ErrorSeverity } from '../../ParserErrors';
import { ErrorLoggingService } from '../../ErrorLoggingService';

/**
 * Abstract base class for parsing strategies
 * Provides common functionality and validation
 */
export abstract class BaseStrategy implements ParsingStrategy {
  public abstract readonly name: string;
  public abstract readonly priority: number;
  public abstract readonly supportedTypes: string[];

  /**
   * Check if this strategy can handle the given file
   */
  public canHandle(file: File): boolean {
    // Check MIME type
    const mimeTypeMatch = this.supportedTypes.some(type => 
      file.type.toLowerCase().includes(type.toLowerCase())
    );

    // Check file extension as fallback
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const extensionMatch = this.supportedTypes.some(type => 
      type.includes(extension) || extension.includes(type.replace('application/', '').replace('text/', ''))
    );

    return mimeTypeMatch || extensionMatch;
  }

  /**
   * Get confidence score for handling this file (0-100)
   */
  public getConfidenceScore(file: File): number {
    if (!this.canHandle(file)) {
      return 0;
    }

    let confidence = 50; // Base confidence

    // Boost confidence for exact MIME type matches
    if (this.supportedTypes.some(type => file.type === type)) {
      confidence += 30;
    }

    // Boost confidence for file extension matches
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (this.getExpectedExtensions().includes(extension)) {
      confidence += 20;
    }

    // Reduce confidence for very large files (may be slower)
    if (file.size > 10 * 1024 * 1024) { // 10MB
      confidence -= 10;
    }

    // Reduce confidence for very small files (may not have enough content)
    if (file.size < 1024) { // 1KB
      confidence -= 20;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Abstract method to parse the file
   */
  public abstract parse(file: File, onProgress?: ProgressCallback): Promise<string>;

  /**
   * Get expected file extensions for this strategy
   */
  protected abstract getExpectedExtensions(): string[];

  /**
   * Validate file before parsing
   */
  protected validateFile(file: File): void {
    const validationError = ErrorHandler.createFileValidationError(file);
    if (validationError) {
      this.logError(validationError, { processingStep: 'File Validation' });
      throw validationError;
    }

    if (!this.canHandle(file)) {
      const error = new ParserError(
        ErrorCode.FILE_TYPE_UNSUPPORTED,
        `File type ${file.type} not supported by ${this.name} strategy`,
        ErrorSeverity.MEDIUM,
        { fileName: file.name, fileType: file.type, strategy: this.name },
        false
      );
      this.logError(error, { processingStep: 'Strategy Compatibility Check' });
      throw error;
    }
  }

  /**
   * Validate extracted text
   */
  protected validateExtractedText(text: string, minLength: number = 10): string {
    if (!text) {
      const error = new ParserError(
        ErrorCode.TEXT_EXTRACTION_FAILED,
        'No text extracted from file',
        ErrorSeverity.HIGH,
        { strategy: this.name, extractedLength: 0 },
        true
      );
      this.logError(error, { processingStep: 'Text Validation' });
      throw error;
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      const error = new ParserError(
        ErrorCode.TEXT_EXTRACTION_FAILED,
        'Extracted text is empty',
        ErrorSeverity.HIGH,
        { strategy: this.name, extractedLength: 0 },
        true
      );
      this.logError(error, { processingStep: 'Text Validation' });
      throw error;
    }

    if (trimmedText.length < minLength) {
      const warning = new ParserError(
        ErrorCode.INSUFFICIENT_DATA,
        `Extracted text is very short: ${trimmedText.length} characters`,
        ErrorSeverity.LOW,
        { strategy: this.name, extractedLength: trimmedText.length, minLength },
        true
      );
      this.logError(warning, { processingStep: 'Text Length Check' });
      console.warn(`[${this.name}] Warning: ${warning.userMessage}`);
    }

    return trimmedText;
  }

  /**
   * Clean and normalize extracted text
   */
  protected cleanText(text: string): string {
    return text
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      
      // Normalize whitespace
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      
      // Remove common OCR artifacts
      .replace(/[|]/g, 'I') // Pipe to I
      .replace(/[@]/g, 'a') // @ to a in some contexts
      
      // Fix spacing issues
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase
      .replace(/(\d)([A-Za-z])/g, '$1 $2') // Add space between number and letter
      .replace(/([A-Za-z])(\d)/g, '$1 $2') // Add space between letter and number
      
      .trim();
  }

  /**
   * Log parsing progress and statistics
   */
  protected logProgress(stage: string, details: any): void {
    console.log(`[${this.name}] ${stage}:`, details);
  }

  /**
   * Create a timeout promise for parsing operations
   */
  protected createTimeoutPromise<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`${this.name} strategy timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then(result => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Handle parsing errors with strategy-specific context
   */
  protected handleError(error: any, context: string): never {
    let parserError: ParserError;

    if (error instanceof ParserError) {
      parserError = error;
    } else {
      // Convert generic error to ParserError
      parserError = ErrorHandler.handle(error, {
        strategy: this.name,
        processingStep: context
      });
    }

    // Log the error
    this.logError(parserError, { processingStep: context });
    
    throw parserError;
  }

  /**
   * Log errors with strategy context
   */
  protected logError(error: ParserError, context: any = {}): string {
    return ErrorLoggingService.logError(error, {
      component: `${this.name} Strategy`,
      ...context
    });
  }

  /**
   * Create strategy-specific errors
   */
  protected createError(
    code: ErrorCode,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: any = {}
  ): ParserError {
    return new ParserError(
      code,
      message,
      severity,
      { strategy: this.name, ...context },
      true
    );
  }
}