/**
 * Enhanced OCR parsing strategy for image-based PDFs and image files
 * Provides fallback when text extraction fails
 */

import Tesseract from 'tesseract.js';
import { BaseParsingStrategy, ParseResult, ProgressCallback } from './BaseParsingStrategy';

export class OCRParsingStrategy extends BaseParsingStrategy {
  name = 'OCR Text Recognition';
  priority = 2;
  supportedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];

  canHandle(file: File): boolean {
    return file.type.includes('pdf') || 
           file.type.includes('image') || 
           /\.(pdf|jpe?g|png|gif|bmp|tiff?)$/i.test(file.name);
  }

  async parse(file: File, onProgress?: ProgressCallback): Promise<ParseResult> {
    console.log('🔍 === OCR PARSING STRATEGY START ===');
    console.log('📄 File:', {
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type,
      isImageBased: file.type.includes('image') || file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/)
    });

    const startTime = performance.now();
    
    // Validate file
    const validationError = this.validateFile(file);
    if (validationError) {
      return this.createFailureResult([validationError], {
        fileSize: file.size,
        fileType: file.type,
        processingTime: performance.now() - startTime,
        ocrUsed: true
      });
    }

    try {
      if (onProgress) onProgress(5, 100, 'Initializing OCR engine...');

      // Try multiple OCR configurations for best results
      const ocrConfigurations = this.getOCRConfigurations(onProgress);
      
      let bestResult = { text: '', confidence: 0 };
      let lastError: Error | null = null;
      let configurationUsed = '';

      // Try each configuration until we get good results
      for (let i = 0; i < ocrConfigurations.length; i++) {
        const config = ocrConfigurations[i];
        console.log(`🔧 Trying OCR configuration: ${config.name}`);
        
        try {
          if (onProgress) onProgress(10 + (i * 25), 100, `Trying ${config.name}...`);
          
          const { result: ocrResult, duration } = await this.measurePerformance(
            () => Tesseract.recognize(file, 'eng', config.options),
            `OCR with ${config.name}`
          );

          const { text, confidence } = ocrResult.data;
          
          console.log(`📊 ${config.name} results:`, {
            textLength: text.length,
            confidence: confidence,
            processingTime: `${duration.toFixed(0)}ms`,
            preview: text.substring(0, 100) + '...'
          });
          
          // Accept result if it's better than previous attempts
          if (text.length > bestResult.text.length || 
              (text.length > 100 && confidence > bestResult.confidence)) {
            bestResult = { text, confidence };
            configurationUsed = config.name;
            console.log(`✅ ${config.name} produced better results`);
            
            // If we got excellent results, don't try other configs
            if (text.length > 500 && confidence > 80) {
              console.log('🎯 Excellent OCR results, stopping here');
              break;
            }
          }
          
        } catch (configError) {
          console.warn(`❌ ${config.name} failed:`, configError);
          lastError = configError instanceof Error ? configError : new Error(String(configError));
          continue;
        }
      }
      
      if (onProgress) onProgress(90, 100, 'Finalizing OCR results...');
      
      // Analyze OCR results
      const qualityAnalysis = this.analyzeOCRQuality(bestResult.text, bestResult.confidence, file.size);
      
      if (qualityAnalysis.isAcceptable) {
        // Clean and validate the OCR text
        const cleanedText = this.cleanOCRText(bestResult.text);
        
        console.log('🎉 === OCR EXTRACTION COMPLETED SUCCESSFULLY ===');
        console.log('📝 Final OCR results:', {
          configuration: configurationUsed,
          originalLength: bestResult.text.length,
          cleanedLength: cleanedText.length,
          confidence: bestResult.confidence,
          extractedWords: cleanedText.split(/\s+/).length,
          processingTime: `${(performance.now() - startTime).toFixed(0)}ms`
        });
        
        if (onProgress) onProgress(100, 100, 'OCR completed successfully!');
        
        return this.createSuccessResult(
          cleanedText,
          qualityAnalysis.confidence,
          {
            fileSize: file.size,
            fileType: file.type,
            processingTime: performance.now() - startTime,
            ocrUsed: true,
            textLength: cleanedText.length
          },
          qualityAnalysis.warnings
        );
      } else {
        // OCR failed to produce acceptable results
        console.error('❌ All OCR configurations failed to produce sufficient text');
        
        return this.createFailureResult([
          this.createError(
            'ocr_failed',
            'OCR failed to extract sufficient text',
            qualityAnalysis.userMessage,
            qualityAnalysis.suggestedActions,
            false,
            `Best attempt: ${bestResult.text.length} characters with ${bestResult.confidence}% confidence using ${configurationUsed}`
          )
        ], {
          fileSize: file.size,
          fileType: file.type,
          processingTime: performance.now() - startTime,
          ocrUsed: true,
          textLength: bestResult.text.length
        }, bestResult.text);
      }
      
    } catch (error) {
      console.error('💥 === OCR EXTRACTION FAILED ===', error);
      
      const processingTime = performance.now() - startTime;
      const parseError = this.categorizeOCRError(error, file);
      
      return this.createFailureResult([parseError], {
        fileSize: file.size,
        fileType: file.type,
        processingTime,
        ocrUsed: true
      });
    }
  }

  private getOCRConfigurations(onProgress?: ProgressCallback): Array<{name: string, options: any}> {
    return [
      {
        name: 'High Accuracy Configuration',
        options: {
          logger: (m: any) => {
            if (m.status === 'recognizing text' && onProgress) {
              const progress = Math.round(15 + (m.progress * 70)); // 15-85% range
              onProgress(progress, 100, `OCR: ${m.status} (${Math.round(m.progress * 100)}%)`);
            }
          },
          tessedit_ocr_engine_mode: 1, // Neural net LSTM engine
          tessedit_pageseg_mode: 3, // Fully automatic page segmentation
          tessedit_char_whitelist: undefined, // Allow all characters
          preserve_interword_spaces: 1,
        }
      },
      {
        name: 'Document Layout Configuration',
        options: {
          logger: (m: any) => {
            if (m.status === 'recognizing text' && onProgress) {
              const progress = Math.round(15 + (m.progress * 70));
              onProgress(progress, 100, `OCR (Layout): ${m.status}`);
            }
          },
          tessedit_ocr_engine_mode: 1,
          tessedit_pageseg_mode: 6, // Uniform block of text
          preserve_interword_spaces: 1,
        }
      },
      {
        name: 'Single Column Configuration',
        options: {
          logger: (m: any) => {
            if (m.status === 'recognizing text' && onProgress) {
              const progress = Math.round(15 + (m.progress * 70));
              onProgress(progress, 100, `OCR (Column): ${m.status}`);
            }
          },
          tessedit_ocr_engine_mode: 1,
          tessedit_pageseg_mode: 4, // Single column of text
          preserve_interword_spaces: 1,
        }
      },
      {
        name: 'Fallback Configuration',
        options: {
          logger: (m: any) => {
            if (m.status === 'recognizing text' && onProgress) {
              const progress = Math.round(15 + (m.progress * 70));
              onProgress(progress, 100, `OCR (Fallback): ${m.status}`);
            }
          },
          tessedit_ocr_engine_mode: 0, // Legacy OCR engine
          tessedit_pageseg_mode: 1, // Automatic page segmentation with OSD
        }
      }
    ];
  }

  private analyzeOCRQuality(text: string, confidence: number, fileSize: number): {
    isAcceptable: boolean;
    confidence: number;
    userMessage: string;
    suggestedActions: string[];
    warnings: any[];
  } {
    const warnings = [];
    let adjustedConfidence = confidence;
    let isAcceptable = true;
    let userMessage = '';
    let suggestedActions: string[] = [];

    // Basic length checks
    if (text.length < 30) {
      adjustedConfidence = 0;
      isAcceptable = false;
      userMessage = 'OCR failed to extract sufficient text from the image. The image quality may be too poor or the text too small.';
      suggestedActions = [
        'Use a higher quality image',
        'Ensure text is clearly visible and not too small',
        'Try a different file format',
        'Manually enter the information'
      ];
    } else if (text.length < 100) {
      adjustedConfidence = Math.min(adjustedConfidence, 30);
      isAcceptable = false;
      userMessage = 'OCR extracted very little text. Consider using a higher quality image or different format.';
      suggestedActions = [
        'Use a higher resolution image',
        'Ensure good contrast between text and background',
        'Try a text-based PDF instead',
        'Check image quality'
      ];
    }

    // Confidence checks
    if (confidence < 50) {
      adjustedConfidence = Math.min(adjustedConfidence, 40);
      warnings.push(
        this.createWarning(
          'low_confidence',
          `OCR confidence is low (${confidence}%). Text accuracy may be poor.`,
          'high'
        )
      );
    } else if (confidence < 70) {
      warnings.push(
        this.createWarning(
          'low_confidence',
          `OCR confidence is moderate (${confidence}%). Some text may be inaccurate.`,
          'medium'
        )
      );
    }

    // Check for OCR artifacts
    const artifactCount = this.countOCRArticacts(text);
    if (artifactCount > text.length / 50) { // More than 2% artifacts
      adjustedConfidence -= 20;
      warnings.push(
        this.createWarning(
          'quality_concerns',
          'Text contains many OCR artifacts, accuracy may be poor',
          'high'
        )
      );
    }

    // Word analysis
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    if (averageWordLength < 2.5) {
      adjustedConfidence -= 15;
      warnings.push(
        this.createWarning(
          'quality_concerns',
          'Very short average word length detected, may contain OCR errors',
          'medium'
        )
      );
    }

    // Final acceptability determination
    if (adjustedConfidence < 40 || text.length < 50) {
      isAcceptable = false;
      if (!userMessage) {
        userMessage = 'OCR text quality is too poor for reliable extraction.';
        suggestedActions = [
          'Use a higher quality image',
          'Try a text-based PDF instead',
          'Improve image contrast and resolution',
          'Manually enter the information'
        ];
      }
    }

    console.log(`📊 OCR Quality analysis:`, {
      originalConfidence: confidence,
      adjustedConfidence,
      textLength: text.length,
      words: words.length,
      averageWordLength: averageWordLength.toFixed(2),
      artifactCount,
      isAcceptable
    });

    return {
      isAcceptable,
      confidence: adjustedConfidence,
      userMessage,
      suggestedActions,
      warnings
    };
  }

  private countOCRArticacts(text: string): number {
    const artifactPatterns = [
      /[|]{2,}/g, // Multiple pipes
      /[.]{4,}/g, // Multiple dots
      /[_]{4,}/g, // Multiple underscores
      /\s[a-z]\s/g, // Single letters (common OCR error)
      /[^\w\s.,!?;:()\-'"]/g, // Unusual characters
      /\d[a-z]\d/g, // Number-letter-number patterns
    ];

    let artifactCount = 0;
    artifactPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        artifactCount += matches.length;
      }
    });

    return artifactCount;
  }

  private cleanOCRText(text: string): string {
    if (!text) return '';
    
    return text
      // Fix common OCR errors
      .replace(/[|]/g, 'I') // Pipe to I
      .replace(/[0]/g, 'O') // Zero to O in word contexts
      .replace(/[@]/g, 'a') // @ to a
      .replace(/[1]/g, 'l') // 1 to l in word contexts
      .replace(/rn/g, 'm') // Common OCR error
      .replace(/vv/g, 'w') // Common OCR error
      
      // Clean up spacing and formatting
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\n\s*\n/g, '\n') // Multiple newlines to single
      .replace(/^\s+|\s+$/g, '') // Trim
      
      // Fix common formatting issues
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase
      .replace(/(\d)([A-Za-z])/g, '$1 $2') // Add space between number and letter
      .replace(/([A-Za-z])(\d)/g, '$1 $2') // Add space between letter and number
      
      // Remove excessive punctuation artifacts
      .replace(/[.]{3,}/g, '...') // Multiple dots to ellipsis
      .replace(/[-]{3,}/g, '---') // Multiple dashes
      .replace(/[_]{3,}/g, '___') // Multiple underscores
      
      .trim();
  }

  private categorizeOCRError(error: any, file: File): any {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorLower = errorMessage.toLowerCase();

    if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('download')) {
      return this.createError(
        'network_error',
        'OCR engine download failed',
        'Failed to download OCR engine components. Please check your internet connection.',
        [
          'Check your internet connection',
          'Try again later',
          'Use a different network',
          'Contact support if the issue persists'
        ],
        true,
        `Original error: ${errorMessage}`
      );
    }

    if (errorLower.includes('timeout') || errorLower.includes('time')) {
      return this.createError(
        'timeout',
        'OCR processing timeout',
        'OCR processing took too long. This might be due to image complexity or size.',
        [
          'Try a smaller or simpler image',
          'Reduce image resolution',
          'Use a text-based PDF instead',
          'Try again later'
        ],
        true,
        `Original error: ${errorMessage}`
      );
    }

    if (errorLower.includes('memory') || errorLower.includes('heap')) {
      return this.createError(
        'unsupported_format',
        'OCR memory error',
        'The image is too large or complex for OCR processing.',
        [
          'Use a smaller image',
          'Reduce image resolution',
          'Split large images into smaller parts',
          'Try a different format'
        ],
        true,
        `Original error: ${errorMessage}`
      );
    }

    if (errorLower.includes('format') || errorLower.includes('decode')) {
      return this.createError(
        'unsupported_format',
        'Unsupported image format',
        'The image format is not supported by the OCR engine.',
        [
          'Convert to PNG or JPEG format',
          'Use a different image',
          'Check image file integrity',
          'Try a PDF instead'
        ],
        false,
        `Original error: ${errorMessage}`
      );
    }

    // Generic OCR error
    return this.createError(
      'ocr_failed',
      'OCR processing failed',
      `OCR text recognition failed: ${errorMessage}`,
      [
        'Try a higher quality image',
        'Use a text-based PDF instead',
        'Check image quality and format',
        'Contact support if the issue persists'
      ],
      true,
      `Original error: ${errorMessage}`
    );
  }
}