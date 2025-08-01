/**
 * Enhanced PDF parsing strategy with comprehensive error handling
 * Handles various PDF types including text-based, image-based, and complex layouts
 */

import * as pdfjsLib from 'pdfjs-dist';
import { BaseParsingStrategy, ParseResult, ProgressCallback } from './BaseParsingStrategy';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
}

export class PDFParsingStrategy extends BaseParsingStrategy {
  name = 'PDF Text Extraction';
  priority = 1;
  supportedTypes = ['application/pdf', '.pdf'];

  canHandle(file: File): boolean {
    return file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
  }

  async parse(file: File, onProgress?: ProgressCallback): Promise<ParseResult> {
    console.log('🔍 === PDF PARSING STRATEGY START ===');
    console.log('📄 File:', {
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type
    });

    const startTime = performance.now();
    
    // Validate file
    const validationError = this.validateFile(file);
    if (validationError) {
      return this.createFailureResult([validationError], {
        fileSize: file.size,
        fileType: file.type,
        processingTime: performance.now() - startTime
      });
    }

    try {
      if (onProgress) onProgress(5, 100, 'Loading PDF...');

      const { result: arrayBuffer, duration: loadDuration } = await this.measurePerformance(
        () => file.arrayBuffer(),
        'PDF file loading'
      );

      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        return this.createFailureResult([
          this.createError(
            'corrupted_file',
            'PDF buffer is empty',
            'The PDF file appears to be corrupted or empty.',
            ['Try re-downloading the file', 'Use a different PDF', 'Check file integrity'],
            false,
            'ArrayBuffer is empty or null'
          )
        ], {
          fileSize: file.size,
          fileType: file.type,
          processingTime: performance.now() - startTime
        });
      }

      if (onProgress) onProgress(15, 100, 'Initializing PDF parser...');

      // Enhanced PDF loading with better error handling
      const { result: pdf, duration: pdfLoadDuration } = await this.measurePerformance(
        () => this.loadPDF(arrayBuffer),
        'PDF document loading'
      );

      if (!pdf || pdf.numPages === 0) {
        return this.createFailureResult([
          this.createError(
            'corrupted_file',
            'PDF has no readable pages',
            'The PDF file contains no readable pages or is corrupted.',
            ['Check if the PDF opens in other applications', 'Try a different file', 'Re-create the PDF'],
            false,
            'PDF.numPages is 0 or PDF object is null'
          )
        ], {
          fileSize: file.size,
          fileType: file.type,
          processingTime: performance.now() - startTime
        });
      }

      console.log(`📖 PDF loaded successfully: ${pdf.numPages} pages`);

      if (onProgress) onProgress(25, 100, `Extracting text from ${pdf.numPages} pages...`);

      // Extract text from all pages
      const { result: extractionResult, duration: extractionDuration } = await this.measurePerformance(
        () => this.extractTextFromPages(pdf, onProgress),
        'Text extraction from all pages'
      );

      const { fullText, pagesProcessed, extractionWarnings } = extractionResult;

      console.log(`📝 Text extraction completed:`, {
        textLength: fullText.length,
        pagesProcessed,
        averageTextPerPage: Math.round(fullText.length / pagesProcessed),
        warnings: extractionWarnings.length
      });

      // Analyze extraction quality
      const qualityAnalysis = this.analyzeExtractionQuality(fullText, file.size, pagesProcessed);
      
      if (onProgress) onProgress(90, 100, 'Analyzing extraction quality...');

      // Determine if extraction was successful
      if (qualityAnalysis.isAcceptable) {
        if (onProgress) onProgress(100, 100, 'PDF parsing completed successfully!');

        return this.createSuccessResult(
          fullText,
          qualityAnalysis.confidence,
          {
            fileSize: file.size,
            fileType: file.type,
            processingTime: performance.now() - startTime,
            pagesProcessed,
            ocrUsed: false,
            textLength: fullText.length
          },
          [...extractionWarnings, ...qualityAnalysis.warnings]
        );
      } else {
        // Text extraction was poor, suggest OCR or other alternatives
        return this.createFailureResult([
          this.createError(
            'no_text_found',
            'Insufficient text extracted from PDF',
            qualityAnalysis.userMessage,
            qualityAnalysis.suggestedActions,
            true,
            `Extracted ${fullText.length} characters from ${pagesProcessed} pages. Quality score: ${qualityAnalysis.confidence}/100`
          )
        ], {
          fileSize: file.size,
          fileType: file.type,
          processingTime: performance.now() - startTime,
          pagesProcessed,
          ocrUsed: false,
          textLength: fullText.length
        }, fullText);
      }

    } catch (error) {
      console.error('💥 PDF parsing failed:', error);
      
      const processingTime = performance.now() - startTime;
      const parseError = this.categorizeError(error, file);
      
      return this.createFailureResult([parseError], {
        fileSize: file.size,
        fileType: file.type,
        processingTime
      });
    }
  }

  private async loadPDF(arrayBuffer: ArrayBuffer): Promise<pdfjsLib.PDFDocumentProxy> {
    try {
      return await pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0, // Reduce console spam
        cMapPacked: true,
        standardFontDataUrl: null,
        // Enhanced error handling options
        stopAtErrors: false,
        maxImageSize: 1024 * 1024, // 1MB max image size
        isEvalSupported: false,
        fontExtraProperties: false
      }).promise;
    } catch (error) {
      console.error('PDF loading error:', error);
      throw error;
    }
  }

  private async extractTextFromPages(
    pdf: pdfjsLib.PDFDocumentProxy, 
    onProgress?: ProgressCallback
  ): Promise<{
    fullText: string;
    pagesProcessed: number;
    extractionWarnings: any[];
  }> {
    let fullText = '';
    let pagesProcessed = 0;
    const extractionWarnings = [];
    const totalPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        if (onProgress) {
          const progress = 25 + Math.round((pageNum / totalPages) * 60); // 25-85% range
          onProgress(progress, 100, `Processing page ${pageNum}/${totalPages}...`);
        }

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        console.log(`📄 Page ${pageNum}: ${textContent.items.length} text items`);

        if (!textContent.items || textContent.items.length === 0) {
          console.warn(`⚠️ Page ${pageNum} has no text content`);
          extractionWarnings.push(
            this.createWarning(
              'partial_extraction',
              `Page ${pageNum} contains no extractable text`,
              'medium'
            )
          );
          continue;
        }

        // Enhanced text extraction with better formatting
        const pageText = this.extractPageText(textContent);
        
        if (pageText.length < 10) {
          console.warn(`⚠️ Page ${pageNum} has very little text: "${pageText}"`);
          extractionWarnings.push(
            this.createWarning(
              'quality_concerns',
              `Page ${pageNum} contains very little text (${pageText.length} characters)`,
              'medium'
            )
          );
        }

        fullText += pageText + '\n';
        pagesProcessed++;

        console.log(`✓ Page ${pageNum} processed: ${pageText.length} characters`);

      } catch (pageError) {
        console.error(`❌ Error processing page ${pageNum}:`, pageError);
        extractionWarnings.push(
          this.createWarning(
            'partial_extraction',
            `Failed to process page ${pageNum}: ${pageError instanceof Error ? pageError.message : 'Unknown error'}`,
            'high'
          )
        );
        // Continue with other pages
      }
    }

    return { fullText, pagesProcessed, extractionWarnings };
  }

  private extractPageText(textContent: any): string {
    return textContent.items
      .filter((item: any) => 'str' in item && item.str.trim().length > 0)
      .map((item: any) => {
        // Enhanced text cleaning and formatting
        let text = item.str.trim();
        
        // Handle common PDF text extraction issues
        text = text
          .replace(/\s+/g, ' ') // Normalize whitespace
          .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
          .replace(/(\d)([A-Za-z])/g, '$1 $2') // Add space between number and letter
          .replace(/([A-Za-z])(\d)/g, '$1 $2'); // Add space between letter and number
        
        return text;
      })
      .join(' ')
      .trim();
  }

  private analyzeExtractionQuality(text: string, fileSize: number, pagesProcessed: number): {
    isAcceptable: boolean;
    confidence: number;
    userMessage: string;
    suggestedActions: string[];
    warnings: any[];
  } {
    const warnings = [];
    let confidence = 100;
    let isAcceptable = true;
    let userMessage = '';
    let suggestedActions: string[] = [];

    // Basic length checks
    if (text.length === 0) {
      confidence = 0;
      isAcceptable = false;
      userMessage = 'No text could be extracted from the PDF. This might be an image-based PDF or a corrupted file.';
      suggestedActions = [
        'Try OCR extraction for image-based PDFs',
        'Check if the PDF opens correctly in other applications',
        'Convert the PDF to a text-based format',
        'Upload a different file'
      ];
    } else if (text.length < 50) {
      confidence = 20;
      isAcceptable = false;
      userMessage = 'Very little text was extracted from the PDF. The file might be image-based or have formatting issues.';
      suggestedActions = [
        'Try OCR extraction for better results',
        'Check if the PDF contains selectable text',
        'Use a text-based PDF instead',
        'Try a different file format'
      ];
    } else if (text.length < 200) {
      confidence = 40;
      isAcceptable = false;
      userMessage = 'Limited text was extracted from the PDF. Consider using OCR for better results.';
      suggestedActions = [
        'Try OCR extraction',
        'Check PDF quality and format',
        'Use a higher quality PDF',
        'Convert to a different format'
      ];
    }

    // Check text quality indicators
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    if (averageWordLength < 2) {
      confidence -= 30;
      warnings.push(
        this.createWarning(
          'quality_concerns',
          'Extracted text has very short average word length, may contain extraction artifacts',
          'high'
        )
      );
    }

    // Check for common OCR/extraction artifacts
    const artifactPatterns = [
      /[|]{3,}/g, // Multiple pipes
      /[.]{5,}/g, // Multiple dots
      /[_]{5,}/g, // Multiple underscores
      /\s[a-z]\s/g, // Single letters (common OCR error)
    ];

    let artifactCount = 0;
    artifactPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        artifactCount += matches.length;
      }
    });

    if (artifactCount > text.length / 100) { // More than 1% artifacts
      confidence -= 20;
      warnings.push(
        this.createWarning(
          'quality_concerns',
          'Text contains potential extraction artifacts, quality may be poor',
          'medium'
        )
      );
    }

    // File size vs text length ratio analysis
    const bytesPerChar = fileSize / text.length;
    if (bytesPerChar > 10000) { // Very high ratio suggests image-based PDF
      confidence -= 25;
      warnings.push(
        this.createWarning(
          'format_issues',
          'High file size to text ratio suggests image-based content',
          'medium'
        )
      );
    }

    // Final acceptability determination
    if (confidence < 50) {
      isAcceptable = false;
      if (!userMessage) {
        userMessage = 'Text extraction quality is poor. The PDF may be image-based or have complex formatting.';
        suggestedActions = [
          'Try OCR extraction',
          'Use a text-based PDF',
          'Check PDF quality',
          'Try a different file'
        ];
      }
    }

    console.log(`📊 Quality analysis:`, {
      textLength: text.length,
      words: words.length,
      averageWordLength: averageWordLength.toFixed(2),
      artifactCount,
      bytesPerChar: bytesPerChar.toFixed(0),
      confidence,
      isAcceptable
    });

    return {
      isAcceptable,
      confidence,
      userMessage,
      suggestedActions,
      warnings
    };
  }

  private categorizeError(error: any, file: File): any {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorLower = errorMessage.toLowerCase();

    if (errorLower.includes('password') || errorLower.includes('encrypted')) {
      return this.createError(
        'password_protected',
        'PDF is password protected',
        'This PDF file is password protected and cannot be processed.',
        [
          'Remove password protection from the PDF',
          'Use an unlocked version of the file',
          'Convert to a different format',
          'Contact the file owner for an unlocked version'
        ],
        false,
        `Original error: ${errorMessage}`
      );
    }

    if (errorLower.includes('invalid pdf') || errorLower.includes('corrupted')) {
      return this.createError(
        'corrupted_file',
        'Invalid or corrupted PDF',
        'The PDF file appears to be corrupted or in an invalid format.',
        [
          'Try re-downloading the file',
          'Check if the file opens in other PDF viewers',
          'Convert the file to PDF again',
          'Use a different file'
        ],
        false,
        `Original error: ${errorMessage}`
      );
    }

    if (errorLower.includes('timeout') || errorLower.includes('time')) {
      return this.createError(
        'timeout',
        'Processing timeout',
        'The PDF took too long to process. This might be due to file complexity or size.',
        [
          'Try a smaller or simpler PDF',
          'Reduce PDF quality/resolution',
          'Split large PDFs into smaller files',
          'Try again later'
        ],
        true,
        `Original error: ${errorMessage}`
      );
    }

    if (errorLower.includes('network') || errorLower.includes('fetch')) {
      return this.createError(
        'network_error',
        'Network error during processing',
        'A network error occurred while processing the PDF.',
        [
          'Check your internet connection',
          'Try again',
          'Use a different network',
          'Contact support if the issue persists'
        ],
        true,
        `Original error: ${errorMessage}`
      );
    }

    // Generic error
    return this.createError(
      'corrupted_file',
      'PDF processing failed',
      `Failed to process the PDF file: ${errorMessage}`,
      [
        'Try a different PDF file',
        'Check if the file is corrupted',
        'Convert to a different format',
        'Contact support if the issue persists'
      ],
      true,
      `Original error: ${errorMessage}`
    );
  }
}