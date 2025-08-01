/**
 * Multi-strategy parser that combines different parsing approaches
 * Provides intelligent fallback and comprehensive error handling
 */

import { BaseParsingStrategy, ParseResult, ProgressCallback } from './strategies/BaseParsingStrategy';
import { PDFParsingStrategy } from './strategies/PDFParsingStrategy';
import { OCRParsingStrategy } from './strategies/OCRParsingStrategy';

export interface ParserConfig {
  maxRetries: number;
  timeoutMs: number;
  enableOCRFallback: boolean;
  enableDiagnostics: boolean;
}

export class MultiStrategyParser {
  private strategies: BaseParsingStrategy[];
  private config: ParserConfig;

  constructor(config: Partial<ParserConfig> = {}) {
    this.config = {
      maxRetries: 3,
      timeoutMs: 120000, // 2 minutes
      enableOCRFallback: true,
      enableDiagnostics: true,
      ...config
    };

    // Initialize strategies in priority order
    this.strategies = [
      new PDFParsingStrategy(),
      new OCRParsingStrategy(),
    ].sort((a, b) => a.priority - b.priority);

    console.log('🚀 MultiStrategyParser initialized with strategies:', 
      this.strategies.map(s => `${s.name} (priority: ${s.priority})`));
  }

  async parseFile(file: File, onProgress?: ProgressCallback): Promise<ParseResult> {
    console.log('🎯 === MULTI-STRATEGY PARSING START ===');
    console.log('📄 File details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      lastModified: new Date(file.lastModified).toISOString()
    });

    const startTime = performance.now();
    const allResults: ParseResult[] = [];
    const allErrors: any[] = [];

    try {
      // Find applicable strategies
      const applicableStrategies = this.strategies.filter(strategy => 
        strategy.canHandle(file)
      );

      console.log('📋 Applicable strategies:', 
        applicableStrategies.map(s => s.name));

      if (applicableStrategies.length === 0) {
        return this.createUnsupportedFileResult(file, performance.now() - startTime);
      }

      if (onProgress) onProgress(5, 100, 'Analyzing file and selecting parsing strategy...');

      // Try each applicable strategy
      for (let i = 0; i < applicableStrategies.length; i++) {
        const strategy = applicableStrategies[i];
        
        console.log(`\n🔄 Attempting strategy ${i + 1}/${applicableStrategies.length}: ${strategy.name}`);
        
        try {
          // Create progress callback for this strategy
          const strategyProgress = (progress: number, total: number, status: string) => {
            const overallProgress = Math.round(10 + (i / applicableStrategies.length) * 80 + (progress / total) * (80 / applicableStrategies.length));
            if (onProgress) onProgress(overallProgress, 100, `${strategy.name}: ${status}`);
          };

          // Apply timeout to strategy
          const result = await this.withTimeout(
            strategy.parse(file, strategyProgress),
            this.config.timeoutMs,
            `${strategy.name} parsing`
          );

          allResults.push(result);

          console.log(`📊 ${strategy.name} result:`, {
            success: result.success,
            confidence: result.confidence,
            textLength: result.content.length,
            errors: result.errors.length,
            warnings: result.warnings.length
          });

          // If we got a successful result with good confidence, use it
          if (result.success && result.confidence >= 70) {
            console.log(`✅ ${strategy.name} succeeded with high confidence (${result.confidence}%)`);
            
            if (onProgress) onProgress(100, 100, 'Parsing completed successfully!');
            
            return this.enhanceResult(result, {
              totalStrategiesTried: i + 1,
              totalProcessingTime: performance.now() - startTime,
              fallbacksUsed: allResults.slice(0, i).map(r => r.method)
            });
          }

          // If we got a successful result but low confidence, continue trying other strategies
          if (result.success && result.confidence >= 40) {
            console.log(`⚠️ ${strategy.name} succeeded but with low confidence (${result.confidence}%), trying other strategies...`);
            continue;
          }

          // If strategy failed but provided partial content, keep it as fallback
          if (!result.success && result.content.length > 50) {
            console.log(`⚠️ ${strategy.name} failed but provided partial content (${result.content.length} chars)`);
            continue;
          }

          console.log(`❌ ${strategy.name} failed:`, result.errors.map(e => e.message));
          allErrors.push(...result.errors);

        } catch (strategyError) {
          console.error(`💥 ${strategy.name} threw exception:`, strategyError);
          
          allErrors.push({
            type: 'strategy_error',
            message: `${strategy.name} failed with exception`,
            userMessage: `${strategy.name} encountered an unexpected error.`,
            suggestedActions: ['Try a different file format', 'Contact support'],
            recoverable: true,
            diagnosticInfo: strategyError instanceof Error ? strategyError.message : String(strategyError)
          });
        }
      }

      // No strategy succeeded with high confidence, choose the best result
      const bestResult = this.selectBestResult(allResults);
      
      if (bestResult) {
        console.log(`🎯 Selected best result from ${bestResult.method} (confidence: ${bestResult.confidence}%)`);
        
        if (onProgress) onProgress(100, 100, 'Parsing completed with best available result');
        
        return this.enhanceResult(bestResult, {
          totalStrategiesTried: applicableStrategies.length,
          totalProcessingTime: performance.now() - startTime,
          fallbacksUsed: allResults.filter(r => r.method !== bestResult.method).map(r => r.method),
          note: 'Used best available result from multiple strategies'
        });
      }

      // All strategies failed
      console.error('❌ All parsing strategies failed');
      
      return this.createFailureResult(file, allErrors, performance.now() - startTime, {
        strategiesTried: applicableStrategies.map(s => s.name),
        totalAttempts: applicableStrategies.length
      });

    } catch (error) {
      console.error('💥 Multi-strategy parsing failed with exception:', error);
      
      return this.createFailureResult(file, [{
        type: 'parser_error',
        message: 'Multi-strategy parser failed',
        userMessage: 'An unexpected error occurred during file processing.',
        suggestedActions: ['Try a different file', 'Contact support'],
        recoverable: true,
        diagnosticInfo: error instanceof Error ? error.message : String(error)
      }], performance.now() - startTime);
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>, 
    timeoutMs: number, 
    operationName: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  private selectBestResult(results: ParseResult[]): ParseResult | null {
    if (results.length === 0) return null;

    // Filter successful results
    const successfulResults = results.filter(r => r.success);
    
    if (successfulResults.length > 0) {
      // Return the one with highest confidence
      return successfulResults.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
    }

    // No successful results, find the one with most content
    const resultsWithContent = results.filter(r => r.content.length > 0);
    
    if (resultsWithContent.length > 0) {
      return resultsWithContent.reduce((best, current) => 
        current.content.length > best.content.length ? current : best
      );
    }

    return null;
  }

  private enhanceResult(result: ParseResult, metadata: any): ParseResult {
    return {
      ...result,
      metadata: {
        ...result.metadata,
        ...metadata
      }
    };
  }

  private createUnsupportedFileResult(file: File, processingTime: number): ParseResult {
    return {
      success: false,
      content: '',
      confidence: 0,
      method: 'MultiStrategyParser',
      errors: [{
        type: 'unsupported_format',
        message: 'Unsupported file format',
        userMessage: `The file format "${file.type || 'unknown'}" is not supported for text extraction.`,
        suggestedActions: [
          'Convert to PDF format',
          'Use a supported file type (PDF, DOCX, images)',
          'Check file extension and format',
          'Try a different file'
        ],
        recoverable: false,
        diagnosticInfo: `File type: ${file.type}, Extension: ${file.name.split('.').pop()}`
      }],
      warnings: [],
      metadata: {
        fileSize: file.size,
        fileType: file.type,
        processingTime,
        ocrUsed: false,
        textLength: 0,
        confidence: 0,
        strategiesTried: [],
        totalAttempts: 0
      }
    };
  }

  private createFailureResult(
    file: File, 
    errors: any[], 
    processingTime: number, 
    metadata: any = {}
  ): ParseResult {
    // Consolidate errors and provide comprehensive guidance
    const consolidatedErrors = this.consolidateErrors(errors);
    
    return {
      success: false,
      content: '',
      confidence: 0,
      method: 'MultiStrategyParser',
      errors: consolidatedErrors,
      warnings: [],
      metadata: {
        fileSize: file.size,
        fileType: file.type,
        processingTime,
        ocrUsed: errors.some(e => e.diagnosticInfo?.includes('OCR')),
        textLength: 0,
        confidence: 0,
        ...metadata
      }
    };
  }

  private consolidateErrors(errors: any[]): any[] {
    if (errors.length === 0) {
      return [{
        type: 'unknown_error',
        message: 'Unknown parsing error',
        userMessage: 'An unknown error occurred during file processing.',
        suggestedActions: ['Try a different file', 'Contact support'],
        recoverable: true
      }];
    }

    // Group errors by type
    const errorGroups = errors.reduce((groups, error) => {
      const type = error.type || 'unknown_error';
      if (!groups[type]) groups[type] = [];
      groups[type].push(error);
      return groups;
    }, {} as Record<string, any[]>);

    // Create consolidated error messages
    const consolidatedErrors = [];

    for (const [type, typeErrors] of Object.entries(errorGroups)) {
      const firstError = typeErrors[0];
      const allActions = [...new Set(typeErrors.flatMap(e => e.suggestedActions || []))];
      
      consolidatedErrors.push({
        type,
        message: `${firstError.message}${typeErrors.length > 1 ? ` (${typeErrors.length} attempts)` : ''}`,
        userMessage: firstError.userMessage,
        suggestedActions: allActions,
        recoverable: typeErrors.some(e => e.recoverable),
        diagnosticInfo: typeErrors.map(e => e.diagnosticInfo).filter(Boolean).join('; ')
      });
    }

    return consolidatedErrors;
  }

  // Utility method to get detailed diagnostics
  getDiagnostics(): any {
    return {
      strategies: this.strategies.map(s => ({
        name: s.name,
        priority: s.priority,
        supportedTypes: s.supportedTypes
      })),
      config: this.config
    };
  }
}