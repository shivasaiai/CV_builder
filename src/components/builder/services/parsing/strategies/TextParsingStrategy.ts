import { BaseStrategy } from './BaseStrategy';
import { ProgressCallback } from '../interfaces';

/**
 * Text parsing strategy for plain text files
 * Handles .txt, .rtf, and other text-based formats
 */
export class TextParsingStrategy extends BaseStrategy {
  public readonly name = 'Text Parser';
  public readonly priority = 70;
  public readonly supportedTypes = [
    'text/plain',
    'text/rtf',
    'application/rtf',
    'txt',
    'rtf'
  ];

  protected getExpectedExtensions(): string[] {
    return ['txt', 'rtf'];
  }

  public async parse(file: File, onProgress?: ProgressCallback): Promise<string> {
    this.validateFile(file);
    this.logProgress('Starting text parsing', { 
      fileName: file.name, 
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      encoding: this.detectEncoding(file)
    });

    if (onProgress) onProgress(0, 100, 'Reading text file...');

    try {
      // Try to read as UTF-8 first
      let text: string;
      
      try {
        text = await file.text();
        this.logProgress('Text read as UTF-8', { length: text.length });
      } catch (encodingError) {
        // Fallback to reading as binary and attempting different encodings
        if (onProgress) onProgress(20, 100, 'Trying alternative encoding...');
        text = await this.readWithFallbackEncoding(file);
        this.logProgress('Text read with fallback encoding', { length: text.length });
      }

      if (onProgress) onProgress(50, 100, 'Analyzing text content...');

      // Analyze the text content
      const analysis = this.analyzeTextContent(text);
      this.logProgress('Text analysis', analysis);

      // Validate that we have meaningful content
      if (analysis.totalLength === 0) {
        throw new Error('Text file is empty');
      }

      if (analysis.printableCharRatio < 0.8) {
        console.warn(`Low printable character ratio: ${(analysis.printableCharRatio * 100).toFixed(1)}%`);
      }

      if (onProgress) onProgress(70, 100, 'Processing text format...');

      // Handle RTF files specially
      let processedText = text;
      if (this.isRTFFile(file)) {
        processedText = this.cleanRTFText(text);
        this.logProgress('RTF processing applied', { 
          originalLength: text.length, 
          processedLength: processedText.length 
        });
      }

      if (onProgress) onProgress(85, 100, 'Cleaning text...');

      const cleanedText = this.cleanText(processedText);
      const validatedText = this.validateExtractedText(cleanedText, 20);

      if (onProgress) onProgress(100, 100, 'Text parsing complete');

      this.logProgress('Text parsing completed', {
        originalLength: text.length,
        cleanedLength: validatedText.length,
        lines: validatedText.split('\n').length,
        words: validatedText.split(/\s+/).length,
        analysis
      });

      return validatedText;

    } catch (error) {
      this.logProgress('Text parsing error', error);
      
      // Provide specific error messages for text file issues
      if (error instanceof Error) {
        if (error.message.includes('encoding') || error.message.includes('decode')) {
          this.handleError(error, 'text encoding - file may use unsupported character encoding');
        } else if (error.message.includes('empty')) {
          this.handleError(error, 'content validation - file appears to be empty');
        }
      }

      this.handleError(error, 'text file processing');
    }
  }

  /**
   * Attempt to read file with fallback encodings
   */
  private async readWithFallbackEncoding(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Try common encodings
    const encodings = ['utf-8', 'iso-8859-1', 'windows-1252'];
    
    for (const encoding of encodings) {
      try {
        const decoder = new TextDecoder(encoding, { fatal: true });
        const text = decoder.decode(uint8Array);
        
        // Validate that the decoded text makes sense
        if (this.isValidText(text)) {
          console.log(`Successfully decoded with ${encoding}`);
          return text;
        }
      } catch (decodingError) {
        console.warn(`Failed to decode with ${encoding}:`, decodingError);
      }
    }

    // Last resort: decode as UTF-8 with replacement characters
    const decoder = new TextDecoder('utf-8', { fatal: false });
    return decoder.decode(uint8Array);
  }

  /**
   * Validate that decoded text contains reasonable content
   */
  private isValidText(text: string): boolean {
    if (!text || text.length === 0) return false;
    
    // Check for reasonable ratio of printable characters
    const printableChars = text.replace(/[\x00-\x1F\x7F-\x9F]/g, '').length;
    const printableRatio = printableChars / text.length;
    
    return printableRatio > 0.7;
  }

  /**
   * Detect likely encoding based on file characteristics
   */
  private detectEncoding(file: File): string {
    // This is a simplified detection - in practice, you might want more sophisticated detection
    const fileName = file.name.toLowerCase();
    
    if (fileName.includes('utf') || fileName.includes('unicode')) {
      return 'utf-8';
    }
    
    if (fileName.includes('ansi') || fileName.includes('ascii')) {
      return 'ascii';
    }
    
    return 'auto-detect';
  }

  /**
   * Analyze text content characteristics
   */
  private analyzeTextContent(text: string): {
    totalLength: number;
    lines: number;
    words: number;
    printableCharRatio: number;
    hasStructuredContent: boolean;
    averageLineLength: number;
  } {
    const lines = text.split('\n');
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const printableChars = text.replace(/[\x00-\x1F\x7F-\x9F]/g, '').length;
    const printableCharRatio = text.length > 0 ? printableChars / text.length : 0;
    
    // Check for structured content (resume-like patterns)
    const hasStructuredContent = /\b(experience|education|skills|contact|summary|objective|employment|work|job)\b/i.test(text);
    
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const averageLineLength = nonEmptyLines.length > 0 
      ? nonEmptyLines.reduce((sum, line) => sum + line.length, 0) / nonEmptyLines.length 
      : 0;

    return {
      totalLength: text.length,
      lines: lines.length,
      words: words.length,
      printableCharRatio,
      hasStructuredContent,
      averageLineLength: Math.round(averageLineLength)
    };
  }

  /**
   * Check if file is RTF format
   */
  private isRTFFile(file: File): boolean {
    return file.type.includes('rtf') || 
           file.name.toLowerCase().endsWith('.rtf');
  }

  /**
   * Clean RTF-specific formatting codes
   */
  private cleanRTFText(text: string): string {
    return text
      // Remove RTF control words
      .replace(/\\[a-z]+\d*\s?/gi, '')
      
      // Remove RTF groups
      .replace(/[{}]/g, '')
      
      // Remove RTF header
      .replace(/^\\rtf\d.*?\\deff\d+/i, '')
      
      // Clean up remaining RTF artifacts
      .replace(/\\\\/g, '\\')
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      
      // Remove control characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      
      .trim();
  }

  /**
   * Enhanced confidence scoring for text files
   */
  public getConfidenceScore(file: File): number {
    let confidence = super.getConfidenceScore(file);

    // Boost confidence for plain text
    if (file.type === 'text/plain') {
      confidence += 10;
    }

    // Slight penalty for RTF (more complex parsing)
    if (this.isRTFFile(file)) {
      confidence -= 5;
    }

    // Boost confidence for reasonable file sizes
    if (file.size >= 1024 && file.size <= 1024 * 1024) { // 1KB - 1MB
      confidence += 10;
    }

    // Check filename for resume indicators
    const fileName = file.name.toLowerCase();
    if (fileName.includes('resume') || fileName.includes('cv')) {
      confidence += 5;
    }

    return Math.min(100, confidence);
  }
}