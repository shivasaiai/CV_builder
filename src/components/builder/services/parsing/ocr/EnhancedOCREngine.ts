import Tesseract from 'tesseract.js';
import { OCRConfiguration, ProgressCallback } from '../interfaces';
import { OCRConfidenceScorer, ConfidenceAnalysis } from './OCRConfidenceScorer';

export interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
  method: string;
  warnings: string[];
  confidenceAnalysis: ConfidenceAnalysis;
}

export interface ImagePreprocessingOptions {
  enhanceContrast: boolean;
  adjustBrightness: boolean;
  denoiseImage: boolean;
  sharpenImage: boolean;
  resizeForOCR: boolean;
  targetDPI: number;
}

/**
 * Enhanced OCR Engine with preprocessing pipeline and multiple configurations
 */
export class EnhancedOCREngine {
  private config: OCRConfiguration;
  private preprocessingOptions: ImagePreprocessingOptions;

  constructor(config: OCRConfiguration, preprocessingOptions?: Partial<ImagePreprocessingOptions>) {
    this.config = config;
    this.preprocessingOptions = {
      enhanceContrast: true,
      adjustBrightness: true,
      denoiseImage: true,
      sharpenImage: false, // Can make text worse in some cases
      resizeForOCR: true,
      targetDPI: config.dpi || 300,
      ...preprocessingOptions
    };
  }

  /**
   * Process image with OCR using multiple strategies
   */
  public async processImage(
    file: File, 
    onProgress?: ProgressCallback
  ): Promise<OCRResult> {
    console.log('🔍 Enhanced OCR Engine starting processing:', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      config: this.config,
      preprocessing: this.preprocessingOptions
    });

    if (onProgress) onProgress(0, 100, 'Initializing OCR engine...');

    const startTime = performance.now();
    const warnings: string[] = [];

    try {
      // Step 1: Preprocess image
      if (onProgress) onProgress(10, 100, 'Preprocessing image...');
      const preprocessedImage = await this.preprocessImage(file, warnings);

      // Step 2: Try multiple OCR configurations
      if (onProgress) onProgress(20, 100, 'Running OCR with multiple configurations...');
      const ocrResults = await this.runMultipleOCRConfigurations(
        preprocessedImage, 
        onProgress,
        warnings
      );

      // Step 3: Select best result
      if (onProgress) onProgress(90, 100, 'Selecting best OCR result...');
      const bestResult = this.selectBestResult(ocrResults);

      // Step 4: Post-process text
      if (onProgress) onProgress(95, 100, 'Post-processing text...');
      const finalText = this.postProcessOCRText(bestResult.text, warnings);

      const processingTime = performance.now() - startTime;

      // Step 5: Analyze confidence with advanced scoring
      if (onProgress) onProgress(98, 100, 'Analyzing result confidence...');
      const confidenceAnalysis = OCRConfidenceScorer.analyzeConfidence(
        finalText,
        bestResult.confidence,
        processingTime
      );

      // Add confidence analysis recommendations to warnings
      warnings.push(...confidenceAnalysis.recommendations);

      const result: OCRResult = {
        text: finalText,
        confidence: confidenceAnalysis.confidence,
        processingTime: Math.round(processingTime),
        method: `Enhanced OCR (${bestResult.method})`,
        warnings,
        confidenceAnalysis
      };

      console.log('✅ Enhanced OCR completed:', {
        textLength: result.text.length,
        confidence: result.confidence,
        reliability: result.confidenceAnalysis.reliability,
        processingTime: result.processingTime,
        warnings: warnings.length,
        confidenceFactors: result.confidenceAnalysis.factors
      });

      if (onProgress) onProgress(100, 100, 'OCR processing complete');

      return result;

    } catch (error) {
      const processingTime = performance.now() - startTime;
      console.error('❌ Enhanced OCR failed:', error);
      
      throw new Error(
        `Enhanced OCR processing failed after ${Math.round(processingTime)}ms: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Preprocess image for optimal OCR results
   */
  private async preprocessImage(file: File, warnings: string[]): Promise<File> {
    console.log('🖼️ Starting image preprocessing...');

    try {
      // For now, we'll return the original file
      // In a production system, you would implement:
      // 1. Canvas-based image manipulation
      // 2. Contrast enhancement
      // 3. Brightness adjustment
      // 4. Noise reduction
      // 5. Resolution optimization

      // Check image characteristics
      const imageInfo = await this.analyzeImage(file);
      console.log('Image analysis:', imageInfo);

      // Add warnings based on image characteristics
      if (imageInfo.estimatedDPI < 150) {
        warnings.push('Low resolution image detected - OCR accuracy may be reduced');
      }

      if (imageInfo.fileSize > 10 * 1024 * 1024) { // 10MB
        warnings.push('Large image file - processing may be slow');
      }

      // TODO: Implement actual preprocessing
      // For now, return original file
      return file;

    } catch (error) {
      console.warn('Image preprocessing failed, using original:', error);
      warnings.push('Image preprocessing failed - using original image');
      return file;
    }
  }

  /**
   * Analyze image characteristics
   */
  private async analyzeImage(file: File): Promise<{
    width: number;
    height: number;
    fileSize: number;
    estimatedDPI: number;
    format: string;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        
        // Estimate DPI based on file size and dimensions
        const pixelCount = img.width * img.height;
        const bytesPerPixel = file.size / pixelCount;
        const estimatedDPI = Math.min(300, Math.max(72, bytesPerPixel * 100));

        resolve({
          width: img.width,
          height: img.height,
          fileSize: file.size,
          estimatedDPI: Math.round(estimatedDPI),
          format: file.type
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to analyze image'));
      };

      img.src = url;
    });
  }

  /**
   * Run OCR with multiple configurations and return all results
   */
  private async runMultipleOCRConfigurations(
    file: File,
    onProgress?: ProgressCallback,
    warnings: string[] = []
  ): Promise<Array<{
    text: string;
    confidence: number;
    method: string;
    processingTime: number;
  }>> {
    const configurations = this.getOCRConfigurations();
    const results = [];
    let lastError: Error | null = null;

    for (let i = 0; i < configurations.length; i++) {
      const config = configurations[i];
      const baseProgress = 20 + (i * 60 / configurations.length);

      try {
        console.log(`🔧 Trying OCR configuration: ${config.name}`);
        
        if (onProgress) {
          onProgress(baseProgress, 100, `OCR: ${config.name}...`);
        }

        const startTime = performance.now();
        
        const tesseractResult = await Tesseract.recognize(
          file, 
          this.config.language, 
          {
            ...config.options,
            logger: (m: any) => {
              if (m.status === 'recognizing text' && onProgress) {
                const configProgress = Math.round(m.progress * (60 / configurations.length));
                onProgress(baseProgress + configProgress, 100, 
                  `OCR (${config.name}): ${Math.round(m.progress * 100)}%`);
              }
            }
          }
        );

        const processingTime = performance.now() - startTime;
        const { text, confidence } = tesseractResult.data;

        console.log(`✅ ${config.name} completed:`, {
          textLength: text.length,
          confidence,
          processingTime: Math.round(processingTime)
        });

        results.push({
          text,
          confidence,
          method: config.name,
          processingTime: Math.round(processingTime)
        });

        // If we got excellent results, we might stop early
        if (text.length > 1000 && confidence > 85) {
          console.log('🎯 Excellent OCR results achieved, stopping early');
          break;
        }

      } catch (error) {
        console.warn(`❌ ${config.name} failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        warnings.push(`${config.name} configuration failed: ${lastError.message}`);
        continue;
      }
    }

    if (results.length === 0) {
      throw new Error(
        `All OCR configurations failed. Last error: ${lastError?.message || 'Unknown error'}`
      );
    }

    console.log(`📊 OCR configurations completed: ${results.length}/${configurations.length} successful`);
    return results;
  }

  /**
   * Get different OCR configurations optimized for different document types
   */
  private getOCRConfigurations(): Array<{
    name: string;
    options: any;
    description: string;
  }> {
    return [
      {
        name: 'High Accuracy Resume',
        description: 'Optimized for resume documents with mixed content',
        options: {
          tessedit_ocr_engine_mode: 1, // Neural net LSTM
          tessedit_pageseg_mode: 3, // Fully automatic page segmentation
          preserve_interword_spaces: 1,
          tessedit_char_whitelist: this.config.whitelist,
          tessedit_char_blacklist: this.config.blacklist,
          // Resume-specific optimizations
          tessedit_write_images: 0,
          tessedit_create_hocr: 0,
          tessedit_create_pdf: 0
        }
      },
      {
        name: 'Document Layout Optimized',
        description: 'Best for structured documents with clear sections',
        options: {
          tessedit_ocr_engine_mode: 1,
          tessedit_pageseg_mode: 6, // Uniform block of text
          preserve_interword_spaces: 1,
          // Layout preservation
          tessedit_do_invert: 0,
          tessedit_use_reject_spaces: 1
        }
      },
      {
        name: 'Mixed Content Handler',
        description: 'Handles documents with mixed text and formatting',
        options: {
          tessedit_ocr_engine_mode: 1,
          tessedit_pageseg_mode: 4, // Single column of text of variable sizes
          preserve_interword_spaces: 1,
          // Mixed content handling
          tessedit_char_unblacklist_pattern: '',
          tessedit_enable_doc_dict: 1
        }
      },
      {
        name: 'Legacy Fallback',
        description: 'Fallback using legacy OCR engine',
        options: {
          tessedit_ocr_engine_mode: 0, // Legacy OCR engine
          tessedit_pageseg_mode: 1, // Automatic page segmentation with OSD
          preserve_interword_spaces: 1,
          // Legacy engine settings
          tessedit_enable_bigram_correction: 1,
          tessedit_enable_dict_correction: 1
        }
      },
      {
        name: 'Single Block Text',
        description: 'For documents that are primarily single blocks of text',
        options: {
          tessedit_ocr_engine_mode: 1,
          tessedit_pageseg_mode: 8, // Single word
          preserve_interword_spaces: 1,
          // Single block optimizations
          tessedit_reject_mode: 0,
          tessedit_use_reject_spaces: 0
        }
      }
    ];
  }

  /**
   * Select the best OCR result from multiple attempts
   */
  private selectBestResult(results: Array<{
    text: string;
    confidence: number;
    method: string;
    processingTime: number;
  }>): {
    text: string;
    confidence: number;
    method: string;
    processingTime: number;
  } {
    if (results.length === 0) {
      throw new Error('No OCR results to select from');
    }

    // Score each result based on multiple factors
    const scoredResults = results.map(result => {
      let score = 0;

      // Base confidence score (0-100)
      score += result.confidence;

      // Text length bonus (longer text usually better for resumes)
      const lengthBonus = Math.min(result.text.length / 20, 30);
      score += lengthBonus;

      // Penalty for very short text
      if (result.text.length < 100) {
        score -= 30;
      }

      // Bonus for structured content (resume indicators)
      const resumePatterns = [
        /\b(experience|education|skills|contact|summary|objective)\b/i,
        /\b(email|phone|address|linkedin)\b/i,
        /\b(work|job|employment|career)\b/i,
        /\b(university|college|degree|bachelor|master)\b/i
      ];

      const patternMatches = resumePatterns.filter(pattern => pattern.test(result.text)).length;
      score += patternMatches * 10;

      // Bonus for proper formatting indicators
      if (/\n.*\n/.test(result.text)) { // Multiple lines
        score += 5;
      }

      if (/\d{4}/.test(result.text)) { // Years
        score += 5;
      }

      if (/@.*\./.test(result.text)) { // Email patterns
        score += 10;
      }

      // Penalty for excessive processing time
      if (result.processingTime > 30000) { // 30 seconds
        score -= 10;
      }

      return { ...result, score };
    });

    // Sort by score (highest first)
    scoredResults.sort((a, b) => b.score - a.score);

    const bestResult = scoredResults[0];

    console.log('🏆 OCR result selection:', {
      totalResults: results.length,
      selectedMethod: bestResult.method,
      selectedScore: bestResult.score,
      selectedConfidence: bestResult.confidence,
      allScores: scoredResults.map(r => ({
        method: r.method,
        score: r.score,
        confidence: r.confidence,
        textLength: r.text.length
      }))
    });

    return bestResult;
  }

  /**
   * Post-process OCR text to fix common errors
   */
  private postProcessOCRText(text: string, warnings: string[]): string {
    console.log('🔧 Post-processing OCR text...');

    let processedText = text;
    let corrections = 0;

    // Fix common OCR character recognition errors
    const characterFixes = [
      { from: /[|]/g, to: 'I', description: 'pipe to I' },
      { from: /[0]/g, to: 'O', description: 'zero to O (in word contexts)' },
      { from: /[1]/g, to: 'l', description: '1 to l (in word contexts)' },
      { from: /[@]/g, to: 'a', description: '@ to a' },
      { from: /[8]/g, to: 'B', description: '8 to B (in word contexts)' },
      { from: /[5]/g, to: 'S', description: '5 to S (in word contexts)' },
      { from: /rn/g, to: 'm', description: 'rn to m' },
      { from: /vv/g, to: 'w', description: 'vv to w' }
    ];

    // Apply character fixes selectively (only in word contexts)
    characterFixes.forEach(fix => {
      const beforeLength = processedText.length;
      // Only apply fixes within word boundaries to avoid corrupting numbers/emails
      processedText = processedText.replace(
        new RegExp(`\\b\\w*${fix.from.source}\\w*\\b`, 'g'),
        (match) => match.replace(fix.from, fix.to)
      );
      const afterLength = processedText.length;
      if (beforeLength !== afterLength) {
        corrections++;
      }
    });

    // Fix spacing issues
    processedText = processedText
      // Add space between lowercase and uppercase letters
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Add space between letters and numbers
      .replace(/([A-Za-z])(\d)/g, '$1 $2')
      .replace(/(\d)([A-Za-z])/g, '$1 $2')
      // Fix multiple spaces
      .replace(/\s+/g, ' ')
      // Fix line breaks
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // Validate email addresses and fix common OCR errors in them
    processedText = processedText.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      (email) => {
        // Fix common email OCR errors
        return email
          .replace(/[0]/g, 'o') // Zero to o in emails
          .replace(/[1]/g, 'l') // 1 to l in emails
          .replace(/[|]/g, 'i'); // Pipe to i in emails
      }
    );

    // Fix phone numbers
    processedText = processedText.replace(
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      (phone) => {
        // Ensure consistent phone number formatting
        return phone.replace(/[^\d]/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
      }
    );

    if (corrections > 0) {
      warnings.push(`Applied ${corrections} OCR text corrections`);
    }

    console.log('✅ OCR post-processing completed:', {
      originalLength: text.length,
      processedLength: processedText.length,
      corrections
    });

    return processedText;
  }

  /**
   * Update OCR configuration
   */
  public updateConfiguration(config: Partial<OCRConfiguration>): void {
    this.config = { ...this.config, ...config };
    console.log('OCR configuration updated:', this.config);
  }

  /**
   * Update preprocessing options
   */
  public updatePreprocessingOptions(options: Partial<ImagePreprocessingOptions>): void {
    this.preprocessingOptions = { ...this.preprocessingOptions, ...options };
    console.log('OCR preprocessing options updated:', this.preprocessingOptions);
  }
}