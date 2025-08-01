import mammoth from 'mammoth';
import { BaseStrategy } from './BaseStrategy';
import { ProgressCallback } from '../interfaces';

/**
 * DOCX parsing strategy using Mammoth.js
 * Handles Microsoft Word documents (.docx and .doc)
 */
export class DOCXParsingStrategy extends BaseStrategy {
  public readonly name = 'DOCX Parser';
  public readonly priority = 85;
  public readonly supportedTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'docx',
    'doc'
  ];

  protected getExpectedExtensions(): string[] {
    return ['docx', 'doc'];
  }

  public async parse(file: File, onProgress?: ProgressCallback): Promise<string> {
    this.validateFile(file);
    this.logProgress('Starting DOCX parsing', { 
      fileName: file.name, 
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB` 
    });

    if (onProgress) onProgress(0, 100, 'Loading Word document...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error('Word document appears to be empty or corrupted');
      }

      this.logProgress('Document buffer loaded', { size: arrayBuffer.byteLength });

      if (onProgress) onProgress(30, 100, 'Extracting text content...');

      // Configure mammoth options for better text extraction
      const options = {
        // Convert paragraphs to plain text with line breaks
        convertImage: mammoth.images.imgElement(function(image: any) {
          return image.read("base64").then(function(imageBuffer: any) {
            return {
              src: "data:" + image.contentType + ";base64," + imageBuffer
            };
          });
        }),
        // Preserve some formatting
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "b => b",
          "i => i"
        ]
      };

      if (onProgress) onProgress(50, 100, 'Processing document structure...');

      const result = await mammoth.extractRawText({ arrayBuffer }, options);

      if (onProgress) onProgress(80, 100, 'Validating extracted content...');

      // Check for extraction warnings
      if (result.messages && result.messages.length > 0) {
        const warnings = result.messages.filter(msg => msg.type === 'warning');
        const errors = result.messages.filter(msg => msg.type === 'error');
        
        this.logProgress('Mammoth messages', { 
          warnings: warnings.length, 
          errors: errors.length,
          details: result.messages.slice(0, 5) // Log first 5 messages
        });

        if (errors.length > 0) {
          console.warn('DOCX parsing errors:', errors);
        }
      }

      const extractedText = result.value || '';
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text content found in Word document');
      }

      this.logProgress('Raw text extracted', { 
        length: extractedText.length,
        lines: extractedText.split('\n').length,
        words: extractedText.split(/\s+/).length
      });

      if (onProgress) onProgress(90, 100, 'Cleaning extracted text...');

      const cleanedText = this.cleanDocxText(extractedText);
      const validatedText = this.validateExtractedText(cleanedText, 30);

      if (onProgress) onProgress(100, 100, 'DOCX parsing complete');

      this.logProgress('DOCX parsing completed', {
        originalLength: extractedText.length,
        cleanedLength: validatedText.length,
        compressionRatio: (validatedText.length / extractedText.length).toFixed(2)
      });

      return validatedText;

    } catch (error) {
      this.logProgress('DOCX parsing error', error);
      
      // Provide specific error messages for common DOCX issues
      if (error instanceof Error) {
        if (error.message.includes('not a valid zip file')) {
          this.handleError(error, 'document format validation - file may be corrupted or not a valid Word document');
        } else if (error.message.includes('ENOENT') || error.message.includes('zip')) {
          this.handleError(error, 'document structure parsing - file may be corrupted');
        } else if (error.message.includes('No text content')) {
          this.handleError(error, 'text extraction - document may be empty or contain only images');
        }
      }

      this.handleError(error, 'DOCX processing');
    }
  }

  /**
   * Clean DOCX-specific text artifacts
   */
  private cleanDocxText(text: string): string {
    return this.cleanText(text)
      // Remove excessive whitespace from Word formatting
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Reduce multiple line breaks
      .replace(/\t+/g, ' ') // Convert tabs to spaces
      
      // Clean up common Word artifacts
      .replace(/\u00A0/g, ' ') // Non-breaking space to regular space
      .replace(/\u2013/g, '-') // En dash to hyphen
      .replace(/\u2014/g, '--') // Em dash to double hyphen
      .replace(/\u201C|\u201D/g, '"') // Smart quotes to regular quotes
      .replace(/\u2018|\u2019/g, "'") // Smart apostrophes to regular apostrophes
      
      // Remove page breaks and section breaks
      .replace(/\f/g, '\n') // Form feed to newline
      .replace(/\v/g, '\n') // Vertical tab to newline
      
      // Clean up bullet points and numbering
      .replace(/^[\u2022\u25CF\u25E6\u2043]\s*/gm, '• ') // Normalize bullet points
      .replace(/^\d+\.\s*/gm, (match) => match) // Keep numbered lists as-is
      
      // Fix spacing around punctuation
      .replace(/\s+([,.;:!?])/g, '$1') // Remove space before punctuation
      .replace(/([,.;:!?])([A-Za-z])/g, '$1 $2') // Add space after punctuation
      
      .trim();
  }

  /**
   * Enhanced confidence scoring for Word documents
   */
  public getConfidenceScore(file: File): number {
    let confidence = super.getConfidenceScore(file);

    // Boost confidence for exact DOCX MIME type
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      confidence += 15;
    }

    // Boost confidence for .docx extension
    if (file.name.toLowerCase().endsWith('.docx')) {
      confidence += 10;
    }

    // Slight penalty for older .doc format (less reliable parsing)
    if (file.name.toLowerCase().endsWith('.doc') && 
        file.type === 'application/msword') {
      confidence -= 5;
    }

    // Boost confidence for typical resume file sizes
    if (file.size >= 50 * 1024 && file.size <= 2 * 1024 * 1024) {
      confidence += 10;
    }

    // Check filename for resume indicators
    const fileName = file.name.toLowerCase();
    if (fileName.includes('resume') || fileName.includes('cv')) {
      confidence += 5;
    }

    return Math.min(100, confidence);
  }

  /**
   * Enhanced file validation for Word documents
   */
  protected validateFile(file: File): void {
    super.validateFile(file);

    // Additional validation for Word documents
    const fileName = file.name.toLowerCase();
    const hasValidExtension = fileName.endsWith('.docx') || fileName.endsWith('.doc');
    const hasValidMimeType = this.supportedTypes.some(type => 
      file.type.includes(type) || type.includes(file.type)
    );

    if (!hasValidExtension && !hasValidMimeType) {
      throw new Error(`File does not appear to be a valid Word document: ${file.name}`);
    }

    // Warn about very large files
    if (file.size > 10 * 1024 * 1024) { // 10MB
      console.warn(`Large Word document detected: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    }
  }
}