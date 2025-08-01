/**
 * Base parsing strategy interface and common utilities
 * Provides foundation for multiple parsing approaches
 */

export interface ParseResult {
  success: boolean;
  content: string;
  confidence: number;
  method: string;
  errors: ParseError[];
  warnings: ParseWarning[];
  metadata: ParseMetadata;
}

export interface ParseError {
  type: 'password_protected' | 'corrupted_file' | 'unsupported_format' | 'ocr_failed' | 'no_text_found' | 'timeout' | 'network_error';
  message: string;
  userMessage: string;
  suggestedActions: string[];
  recoverable: boolean;
  diagnosticInfo?: string;
}

export interface ParseWarning {
  type: 'low_confidence' | 'partial_extraction' | 'format_issues' | 'quality_concerns';
  message: string;
  impact: 'low' | 'medium' | 'high';
}

export interface ParseMetadata {
  fileSize: number;
  fileType: string;
  processingTime: number;
  pagesProcessed?: number;
  ocrUsed: boolean;
  textLength: number;
  confidence: number;
}

export interface ProgressCallback {
  (progress: number, total: number, status: string): void;
}

export abstract class BaseParsingStrategy {
  abstract name: string;
  abstract priority: number;
  abstract supportedTypes: string[];

  abstract canHandle(file: File): boolean;
  abstract parse(file: File, onProgress?: ProgressCallback): Promise<ParseResult>;

  protected createError(
    type: ParseError['type'], 
    message: string, 
    userMessage: string, 
    suggestedActions: string[],
    recoverable: boolean = true,
    diagnosticInfo?: string
  ): ParseError {
    return {
      type,
      message,
      userMessage,
      suggestedActions,
      recoverable,
      diagnosticInfo
    };
  }

  protected createWarning(
    type: ParseWarning['type'],
    message: string,
    impact: ParseWarning['impact'] = 'medium'
  ): ParseWarning {
    return {
      type,
      message,
      impact
    };
  }

  protected createSuccessResult(
    content: string,
    confidence: number,
    metadata: Partial<ParseMetadata>,
    warnings: ParseWarning[] = []
  ): ParseResult {
    return {
      success: true,
      content,
      confidence,
      method: this.name,
      errors: [],
      warnings,
      metadata: {
        fileSize: 0,
        fileType: '',
        processingTime: 0,
        ocrUsed: false,
        textLength: content.length,
        confidence,
        ...metadata
      }
    };
  }

  protected createFailureResult(
    errors: ParseError[],
    metadata: Partial<ParseMetadata>,
    partialContent: string = ''
  ): ParseResult {
    return {
      success: false,
      content: partialContent,
      confidence: 0,
      method: this.name,
      errors,
      warnings: [],
      metadata: {
        fileSize: 0,
        fileType: '',
        processingTime: 0,
        ocrUsed: false,
        textLength: partialContent.length,
        confidence: 0,
        ...metadata
      }
    };
  }

  protected validateFile(file: File): ParseError | null {
    if (!file) {
      return this.createError(
        'corrupted_file',
        'No file provided',
        'No file was selected for processing.',
        ['Please select a valid file'],
        false
      );
    }

    if (file.size === 0) {
      return this.createError(
        'corrupted_file',
        'File is empty',
        'The selected file appears to be empty (0 bytes).',
        ['Check if the file was uploaded correctly', 'Try a different file'],
        false
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return this.createError(
        'unsupported_format',
        'File too large',
        `File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum allowed size is 50 MB.`,
        ['Compress the file', 'Use a smaller file', 'Split into multiple files'],
        false
      );
    }

    return null;
  }

  protected async measurePerformance<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      console.log(`⏱️ ${operationName} completed in ${duration.toFixed(2)}ms`);
      return { result, duration };
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }
}