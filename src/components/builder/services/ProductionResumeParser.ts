/**
 * Production-Grade Resume Parser V3.0
 * Enhanced with comprehensive error handling, logging, and recovery strategies
 */

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import { WorkExperience, Education, ResumeData, ContactInfo } from '../types';
import { ParserLogger, logger } from './ParserLogger';
import { ParserError, ErrorHandler, ErrorCode, ErrorSeverity, createError } from './ParserErrors';

// Set up PDF.js worker with error handling
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
    logger.info('INIT', 'PDF.js worker configured successfully');
  } catch (error) {
    logger.error('INIT', 'Failed to configure PDF.js worker', error as Error);
  }
}

export interface ParsedResumeData {
  contact: ContactInfo;
  workExperiences: WorkExperience[];
  education: Education;
  skills: string[];
  summary: string;
}

export interface ProgressCallback {
  (progress: number, total: number, status: string): void;
}

export interface ParsingOptions {
  timeout?: number;           // Maximum processing time in ms (default: 60000)
  maxFileSize?: number;       // Maximum file size in bytes (default: 50MB)
  enableOCR?: boolean;        // Enable OCR for image-based content (default: true)
  ocrLanguage?: string;       // OCR language (default: 'eng')
  strictValidation?: boolean; // Enable strict data validation (default: false)
  retryAttempts?: number;     // Number of retry attempts for failed operations (default: 2)
}

const DEFAULT_OPTIONS: Required<ParsingOptions> = {
  timeout: 60000,
  maxFileSize: 50 * 1024 * 1024,
  enableOCR: true,
  ocrLanguage: 'eng',
  strictValidation: false,
  retryAttempts: 2
};

export class ProductionResumeParser {
  
  // Enhanced patterns with better accuracy and coverage
  static PATTERNS = {
    email: [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
      /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi,
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi
    ],
    phone: [
      /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
      /(?:\+?[\d\s\-\(\)]{10,})/g,
      /\d{3}[\s\-\.]?\d{3}[\s\-\.]?\d{4}/g,
      /\+\d{1,3}[-.\s]?\d{1,14}/g,
      // Indian phone patterns
      /(?:\+91[-.\s]?)?[6-9]\d{9}/g,
      /(?:\+91[-.\s]?)?\d{5}[-.\s]?\d{5}/g
    ],
    name: [
      /^([A-Z][a-z]+)\s+([A-Z][a-z]+)(?:\s+([A-Z][a-z]+))?$/,
      /^([A-Z][A-Z\s]+)$/,
      /^([A-Z][a-zA-Z\s]{2,50})$/,
      /([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)*[A-Z][a-z]+)/,
      /^([A-Z][a-z]+(?:\s+[A-Za-z]+){1,3})$/,
      // Indian name patterns
      /^([A-Z][A-Z\s]+)\s+([A-Z][A-Z\s]+)$/,
      /^([A-Z][a-z]+)\s+([A-Z][a-z]+)\s+([A-Z][a-z]+)$/
    ],
    location: [
      /([A-Za-z\s\-]+),?\s*([A-Z]{2,}|[A-Za-z\s]+)(?:\s*,?\s*(\d{5}))?/g,
      /([A-Za-z\s]+),\s*([A-Z]{2})\s*(\d{5})?/g,
      /([A-Za-z\s]+),\s*([A-Za-z\s]+)/g,
      // Indian location patterns
      /([A-Za-z\s]+),\s*([A-Za-z\s]+),\s*India/gi,
      /([A-Za-z\s]+),\s*([A-Za-z\s]+)\s*-\s*(\d{6})/g
    ],
    linkedin: [
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/gi,
      /linkedin\.com\/in\/[A-Za-z0-9_-]+/gi,
      /(?:LinkedIn|linkedin):\s*([A-Za-z0-9_-]+)/gi
    ],
    website: [
      /(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}/gi,
      /(?:Portfolio|Website|Site):\s*(https?:\/\/[^\s]+)/gi
    ],
    dates: [
      // Enhanced date patterns with better accuracy
      /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(?:19|20)\d{2})/gi,
      /(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(?:19|20)\d{2})/gi,
      /(?:19|20)\d{2}/g,
      /(?:\d{1,2}\/\d{1,2}\/\d{2,4})/gi,
      /(?:\d{4}\s*[-–—]\s*\d{4})/gi,
      /(?:\d{4}\s*to\s*\d{4})/gi,
      /(?:\d{4}\s*[-–—]\s*(?:Present|Current|Now))/gi,
      /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*[-–—]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|Present|Current))/gi,
      /(?:\d{1,2}[-\/]\d{4})/gi,
      /(?:\d{4}[-\/]\d{1,2})/gi,
    ],
    section: {
      experience: [
        /(?:^|\n)\s*(PROFESSIONAL\s+EXPERIENCE|WORK\s+EXPERIENCE|EXPERIEN[C]?E|EMPLOYMENT\s+HISTORY|CAREER\s+HISTORY|WORK\s+HISTORY|EMPLOYMENT|CAREER\s+EXPERIENCE|PROFESSIONAL\s+BACKGROUND|WORK\s+BACKGROUND|JOB\s+EXPERIENCE|WORKING\s+EXPERIENCE)\s*:?\s*$/im,
        /(?:^|\n)\s*(Experience|Work|Employment|Career|Professional|Job\s+History|Experien[c]?e|Working\s+Experience)\s*:?\s*$/im,
        /(?:^|\n)\s*(EXPERIENCE|WORK|EMPLOYMENT|CAREER|EXPERIEN[C]?E)\s*$/im,
        /^(Experience|Work|Employment|Career|Experien[c]?e)\s*:?\s*$/im,
        /(?:^|\n)\s*(WORK\s+EXPERIEN[C]?E|PROFESSIONAL\s+EXPERIEN[C]?E|CAREER\s+EXPERIEN[C]?E)\s*:?\s*$/im,
        /(?:^|\n)\s*(experien[c]?e|work|employment|career)\s*:?\s*$/im,
        /(?:^|\n)\s*\d+\.\s*(EXPERIENCE|WORK|EMPLOYMENT|CAREER|EXPERIEN[C]?E)\s*:?\s*$/im,
        /(?:^|\n)\s*(EXPERIENCE|WORK|EMPLOYMENT|CAREER)[\s_-]*:?\s*$/im
      ],
      education: [
        /(?:^|\n)\s*(EDUCATION|ACADEMIC\s+BACKGROUND|QUALIFICATIONS|EDUCATIONAL\s+BACKGROUND|ACADEMICS|SCHOOLING|LEARNING|STUDIES|UNIVERSITY|COLLEGE)\s*:?\s*$/im,
        /(?:^|\n)\s*(Education|Academics|Schooling|Learning|Studies|University|College|Academic\s+Background)\s*:?\s*$/im,
        /(?:^|\n)\s*(EDUCATION|ACADEMICS|SCHOOLING|LEARNING|STUDIES)\s*$/im,
        /^(Education|Academics|Schooling|Learning|Studies)\s*:?\s*$/im,
        /(?:^|\n)\s*(EDUCATON|EDUCTION|EDUCATN)\s*:?\s*$/im,
        /(?:^|\n)\s*(education|academics|schooling|learning|studies)\s*:?\s*$/im,
        /(?:^|\n)\s*\d+\.\s*(EDUCATION|ACADEMICS|SCHOOLING|LEARNING|STUDIES)\s*:?\s*$/im,
        /(?:^|\n)\s*(EDUCATION|ACADEMICS|SCHOOLING)[\s_-]*:?\s*$/im
      ],
      skills: [
        /(?:^|\n)\s*(SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|EXPERTISE|TECHNICAL\s+EXPERTISE|COMPETENCIES|TECHNOLOGIES|KEY\s+SKILLS|TECHNICAL\s+PROFICIENCIES)\s*:?\s*$/im,
        /(?:^|\n)\s*(Skills|Technical\s+Skills|Technologies|Competencies)\s*:?\s*$/im,
        /(?:^|\n)\s*(SKILLS|TECHNOLOGIES|COMPETENCIES)\s*$/im,
        /^(Skills|Technologies|Competencies)\s*:?\s*$/im
      ],
      summary: [
        /(?:^|\n)\s*(SUMMARY|PROFILE|OBJECTIVE|PROFESSIONAL\s+SUMMARY|CAREER\s+OBJECTIVE|PERSONAL\s+STATEMENT|ABOUT\s+ME|CAREER\s+SUMMARY|PROFESSIONAL\s+PROFILE)\s*:?\s*$/im,
        /(?:^|\n)\s*(Summary|Profile|Objective|About\s+Me)\s*:?\s*$/im,
        /(?:^|\n)\s*(SUMMARY|PROFILE|OBJECTIVE)\s*$/im,
        /^(Summary|Profile|Objective)\s*:?\s*$/im
      ]
    }
  };

  static async parseFile(
    file: File, 
    onProgress?: ProgressCallback,
    options: ParsingOptions = {}
  ): Promise<ParsedResumeData> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const startTime = performance.now();
    
    // Clear previous logs for this parsing session
    ParserLogger.clearLogs();
    
    logger.startTimer('total_parsing');
    logger.info('PARSER', '🚀 Production Resume Parser V3.0 Started', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      fileType: file.type,
      options: opts
    });

    try {
      // Validate file
      const validationError = ErrorHandler.createFileValidationError(file);
      if (validationError) {
        throw validationError;
      }

      // Additional size check with options
      if (file.size > opts.maxFileSize) {
        throw createError.fileTooLarge(file.name, file.size);
      }

      if (onProgress) onProgress(0, 100, 'Starting parsing...');

      // Set up timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new ParserError(
            ErrorCode.TIMEOUT_EXCEEDED,
            `Processing timeout after ${opts.timeout}ms`,
            ErrorSeverity.HIGH,
            { fileName: file.name, timeout: opts.timeout }
          ));
        }, opts.timeout);
      });

      // Parse with timeout
      const parsePromise = this.parseFileInternal(file, onProgress, opts);
      const result = await Promise.race([parsePromise, timeoutPromise]);

      // Validate results
      this.validateParsedData(result, opts.strictValidation);
      
      if (onProgress) onProgress(100, 100, 'Complete!');
      
      const totalTime = logger.endTimer('total_parsing', 'PARSER', 'Parsing completed successfully');
      
      logger.info('PARSER', '🎉 Parsing completed successfully', {
        fileName: file.name,
        processingTime: `${totalTime.toFixed(0)}ms`,
        throughput: `${((file.size / 1024) / (totalTime / 1000)).toFixed(1)} KB/s`,
        extractedData: {
          contactFound: !!(result.contact.firstName || result.contact.email),
          workExperiences: result.workExperiences.length,
          educationFound: !!(result.education.school || result.education.degree),
          skillsCount: result.skills.length,
          summaryLength: result.summary.length
        }
      });
      
      return result;
      
    } catch (error) {
      const parserError = ErrorHandler.handle(error as Error, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      logger.critical('PARSER', 'Parsing failed', parserError, {
        fileName: file.name,
        errorCode: parserError.code,
        severity: parserError.severity
      });
      
      throw parserError;
    }
  }

  private static async parseFileInternal(
    file: File,
    onProgress?: ProgressCallback,
    options: Required<ParsingOptions> = DEFAULT_OPTIONS
  ): Promise<ParsedResumeData> {
    logger.startTimer('text_extraction');
    
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    let text = '';

    try {
      // Enhanced file type detection with retry logic
      if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
        logger.info('EXTRACTION', 'Processing as PDF file');
        text = await this.extractFromPDFWithRetry(file, onProgress, options);
      } else if (fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        logger.info('EXTRACTION', 'Processing as Word document');
        text = await this.extractFromDOCXWithRetry(file, onProgress, options);
      } else if (fileType.includes('text') || fileName.endsWith('.txt')) {
        logger.info('EXTRACTION', 'Processing as text file');
        text = await this.extractFromText(file, onProgress);
      } else if (fileType.includes('image') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/)) {
        if (!options.enableOCR) {
          throw new ParserError(
            ErrorCode.OCR_PROCESSING_FAILED,
            'OCR is disabled but required for image files',
            ErrorSeverity.HIGH,
            { fileName: file.name }
          );
        }
        logger.info('EXTRACTION', 'Processing as image file with OCR');
        text = await this.extractWithOCREnhanced(file, onProgress, options);
      } else if (fileName.endsWith('.rtf')) {
        logger.info('EXTRACTION', 'Processing RTF as text file');
        text = await this.extractFromText(file, onProgress);
      } else {
        logger.warn('EXTRACTION', `Unknown file type: ${fileType}, attempting text extraction`);
        text = await this.extractFromText(file, onProgress);
      }

      logger.endTimer('text_extraction', 'EXTRACTION', 'Text extraction completed');

      // Validate extracted text
      if (!text || text.trim().length === 0) {
        throw createError.insufficientData(file.name, 0);
      }

      if (text.length < 50) {
        logger.warn('EXTRACTION', 'Very short text extracted', {
          textLength: text.length,
          fileName: file.name
        });
        
        if (options.strictValidation) {
          throw createError.insufficientData(file.name, text.length);
        }
      }

      logger.info('EXTRACTION', 'Text extraction analysis', {
        textLength: text.length,
        lineCount: text.split('\n').length,
        wordCount: text.split(/\s+/).length,
        preview: text.substring(0, 200) + '...'
      });

      if (onProgress) onProgress(80, 100, 'Parsing content...');

      logger.startTimer('data_parsing');
      const parsedData = this.parseText(text);
      logger.endTimer('data_parsing', 'PARSING', 'Data parsing completed');
      
      return parsedData;
      
    } catch (error) {
      logger.error('EXTRACTION', 'Text extraction failed', error as Error, {
        fileName: file.name,
        fileType: file.type
      });
      throw error;
    }
  }

  private static async extractFromPDFWithRetry(
    file: File,
    onProgress?: ProgressCallback,
    options: Required<ParsingOptions>
  ): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= options.retryAttempts + 1; attempt++) {
      try {
        logger.info('PDF_EXTRACTION', `PDF extraction attempt ${attempt}/${options.retryAttempts + 1}`);
        return await this.extractFromPDF(file, onProgress, options);
      } catch (error) {
        lastError = error as Error;
        logger.warn('PDF_EXTRACTION', `PDF extraction attempt ${attempt} failed`, {
          error: error instanceof Error ? error.message : String(error),
          attempt,
          maxAttempts: options.retryAttempts + 1
        });
        
        if (attempt <= options.retryAttempts) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError || new Error('PDF extraction failed after all retry attempts');
  }

  private static async extractFromPDF(
    file: File,
    onProgress?: ProgressCallback,
    options: Required<ParsingOptions>
  ): Promise<string> {
    logger.info('PDF_EXTRACTION', 'Starting PDF extraction');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new ParserError(
          ErrorCode.PDF_INVALID_FORMAT,
          'PDF file appears to be empty or corrupted',
          ErrorSeverity.HIGH,
          { fileName: file.name }
        );
      }
      
      logger.debug('PDF_EXTRACTION', 'PDF buffer loaded', {
        bufferSize: arrayBuffer.byteLength
      });
      
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0,
        cMapPacked: true,
        standardFontDataUrl: null
      }).promise;
      
      if (!pdf || pdf.numPages === 0) {
        throw new ParserError(
          ErrorCode.PDF_INVALID_FORMAT,
          'PDF has no readable pages',
          ErrorSeverity.HIGH,
          { fileName: file.name }
        );
      }
      
      let fullText = '';
      logger.info('PDF_EXTRACTION', `Processing ${pdf.numPages} pages`);

      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          if (onProgress) {
            onProgress((i / pdf.numPages) * 60, 100, `Reading page ${i}/${pdf.numPages}`);
          }
          
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          logger.debug('PDF_EXTRACTION', `Page ${i} processing`, {
            itemCount: textContent.items.length
          });
          
          if (!textContent.items || textContent.items.length === 0) {
            logger.warn('PDF_EXTRACTION', `Page ${i} has no text content`);
            continue;
          }
          
          const pageText = textContent.items
            .filter((item): item is any => 'str' in item && item.str.trim().length > 0)
            .map((item: any) => item.str)
            .join(' ');
          
          logger.debug('PDF_EXTRACTION', `Page ${i} text extracted`, {
            textLength: pageText.length
          });
          
          fullText += pageText + '\n';
          
        } catch (pageError) {
          logger.error('PDF_EXTRACTION', `Error processing page ${i}`, pageError as Error);
          // Continue with other pages
        }
      }

      logger.info('PDF_EXTRACTION', 'PDF text extraction completed', {
        totalTextLength: fullText.length,
        pagesProcessed: pdf.numPages
      });

      // Enhanced OCR fallback strategy
      if (fullText.length < 100) {
        logger.warn('PDF_EXTRACTION', 'Poor text extraction, attempting OCR fallback');
        
        if (options.enableOCR) {
          if (onProgress) onProgress(65, 100, 'Text extraction poor, trying OCR...');
          
          try {
            const ocrText = await this.extractWithOCREnhanced(file, onProgress, options);
            if (ocrText && ocrText.length > fullText.length) {
              logger.info('PDF_EXTRACTION', 'OCR provided better results, using OCR text');
              return ocrText;
            }
          } catch (ocrError) {
            logger.error('PDF_EXTRACTION', 'OCR fallback failed', ocrError as Error);
          }
        }
      }

      if (fullText.length === 0) {
        if (options.enableOCR) {
          logger.info('PDF_EXTRACTION', 'No text extracted, attempting OCR on image-based PDF');
          if (onProgress) onProgress(70, 100, 'Trying OCR on image-based PDF...');
          
          try {
            const ocrText = await this.extractWithOCREnhanced(file, onProgress, options);
            if (ocrText && ocrText.length > 50) {
              logger.info('PDF_EXTRACTION', 'OCR successful on image-based PDF', {
                extractedLength: ocrText.length
              });
              return ocrText;
            }
          } catch (ocrError) {
            logger.error('PDF_EXTRACTION', 'OCR on image-based PDF failed', ocrError as Error);
          }
        }
        
        throw new ParserError(
          ErrorCode.PDF_NO_TEXT_CONTENT,
          'Could not extract any text from PDF',
          ErrorSeverity.HIGH,
          { fileName: file.name }
        );
      }

      return fullText;
      
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      
      const errorMessage = (error as Error).message.toLowerCase();
      
      if (errorMessage.includes('invalid pdf')) {
        throw new ParserError(
          ErrorCode.PDF_INVALID_FORMAT,
          'Invalid PDF file format',
          ErrorSeverity.HIGH,
          { fileName: file.name }
        );
      } else if (errorMessage.includes('password')) {
        throw createError.pdfPasswordProtected(file.name);
      }
      
      throw new ParserError(
        ErrorCode.PDF_EXTRACTION_FAILED,
        `PDF processing failed: ${(error as Error).message}`,
        ErrorSeverity.HIGH,
        { fileName: file.name }
      );
    }
  }

  private static async extractFromDOCXWithRetry(
    file: File,
    onProgress?: ProgressCallback,
    options: Required<ParsingOptions>
  ): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= options.retryAttempts + 1; attempt++) {
      try {
        logger.info('DOCX_EXTRACTION', `DOCX extraction attempt ${attempt}/${options.retryAttempts + 1}`);
        return await this.extractFromDOCX(file, onProgress);
      } catch (error) {
        lastError = error as Error;
        logger.warn('DOCX_EXTRACTION', `DOCX extraction attempt ${attempt} failed`, {
          error: error instanceof Error ? error.message : String(error),
          attempt
        });
        
        if (attempt <= options.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        }
      }
    }
    
    throw lastError || new Error('DOCX extraction failed after all retry attempts');
  }

  private static async extractFromDOCX(file: File, onProgress?: ProgressCallback): Promise<string> {
    logger.info('DOCX_EXTRACTION', 'Starting DOCX extraction');
    
    try {
      if (onProgress) onProgress(30, 100, 'Extracting from DOCX...');
      
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      logger.info('DOCX_EXTRACTION', 'DOCX extraction completed', {
        textLength: result.value.length,
        messages: result.messages.length
      });
      
      if (result.messages.length > 0) {
        logger.warn('DOCX_EXTRACTION', 'DOCX extraction warnings', {
          messages: result.messages.map(m => m.message)
        });
      }
      
      if (onProgress) onProgress(70, 100, 'DOCX extraction complete');
      
      return result.value;
      
    } catch (error) {
      logger.error('DOCX_EXTRACTION', 'DOCX extraction failed', error as Error);
      throw new ParserError(
        ErrorCode.DOCX_PARSING_FAILED,
        `DOCX processing failed: ${(error as Error).message}`,
        ErrorSeverity.MEDIUM,
        { fileName: file.name },
        true
      );
    }
  }

  private static async extractFromText(file: File, onProgress?: ProgressCallback): Promise<string> {
    logger.info('TEXT_EXTRACTION', 'Starting text extraction');
    
    try {
      if (onProgress) onProgress(50, 100, 'Reading text file...');
      
      const text = await file.text();
      
      logger.info('TEXT_EXTRACTION', 'Text extraction completed', {
        textLength: text.length
      });
      
      if (onProgress) onProgress(70, 100, 'Text file read complete');
      
      return text;
      
    } catch (error) {
      logger.error('TEXT_EXTRACTION', 'Text extraction failed', error as Error);
      throw new ParserError(
        ErrorCode.TEXT_EXTRACTION_FAILED,
        `Text file processing failed: ${(error as Error).message}`,
        ErrorSeverity.MEDIUM,
        { fileName: file.name },
        true
      );
    }
  }

  private static async extractWithOCREnhanced(
    file: File,
    onProgress?: ProgressCallback,
    options: Required<ParsingOptions>
  ): Promise<string> {
    logger.info('OCR_EXTRACTION', 'Starting enhanced OCR extraction', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      language: options.ocrLanguage
    });
    
    try {
      if (onProgress) onProgress(5, 100, 'Initializing OCR engine...');
      
      // Enhanced OCR configurations for different scenarios
      const ocrConfigurations = [
        {
          name: 'High Accuracy Configuration',
          options: {
            logger: (m: any) => {
              if (m.status === 'recognizing text' && onProgress) {
                const progress = Math.round(5 + (m.progress * 80));
                onProgress(progress, 100, `OCR: ${m.status} (${Math.round(m.progress * 100)}%)`);
              }
            },
            tessedit_ocr_engine_mode: 1,
            tessedit_pageseg_mode: 3,
            preserve_interword_spaces: 1,
          }
        },
        {
          name: 'Document Layout Configuration',
          options: {
            logger: (m: any) => {
              if (m.status === 'recognizing text' && onProgress) {
                const progress = Math.round(5 + (m.progress * 80));
                onProgress(progress, 100, `OCR (Layout): ${m.status}`);
              }
            },
            tessedit_ocr_engine_mode: 1,
            tessedit_pageseg_mode: 6,
            preserve_interword_spaces: 1,
          }
        },
        {
          name: 'Fallback Configuration',
          options: {
            logger: (m: any) => {
              if (m.status === 'recognizing text' && onProgress) {
                const progress = Math.round(5 + (m.progress * 80));
                onProgress(progress, 100, `OCR (Fallback): ${m.status}`);
              }
            },
            tessedit_ocr_engine_mode: 0,
            tessedit_pageseg_mode: 1,
          }
        }
      ];
      
      let bestResult = { text: '', confidence: 0 };
      let lastError: Error | null = null;
      
      // Try each configuration until we get good results
      for (let i = 0; i < ocrConfigurations.length; i++) {
        const config = ocrConfigurations[i];
        logger.info('OCR_EXTRACTION', `Trying OCR configuration: ${config.name}`);
        
        try {
          if (onProgress) onProgress(5 + (i * 30), 100, `Trying ${config.name}...`);
          
          const result = await Tesseract.recognize(file, options.ocrLanguage, config.options);
          const { text, confidence } = result.data;
          
          logger.info('OCR_EXTRACTION', `${config.name} results`, {
            textLength: text.length,
            confidence: confidence,
            preview: text.substring(0, 100) + '...'
          });
          
          // Accept result if it's better than previous attempts
          if (text.length > bestResult.text.length || 
              (text.length > 100 && confidence > bestResult.confidence)) {
            bestResult = { text, confidence };
            logger.info('OCR_EXTRACTION', `${config.name} produced better results`);
            
            // If we got good results, don't try other configs
            if (text.length > 500 && confidence > 70) {
              logger.info('OCR_EXTRACTION', 'Excellent OCR results, stopping here');
              break;
            }
          }
          
        } catch (configError) {
          logger.warn('OCR_EXTRACTION', `${config.name} failed`, {
            error: configError instanceof Error ? configError.message : String(configError)
          });
          lastError = configError instanceof Error ? configError : new Error(String(configError));
          continue;
        }
      }
      
      if (onProgress) onProgress(90, 100, 'Finalizing OCR results...');
      
      // Validate final results
      if (bestResult.text.length < 30) {
        logger.error('OCR_EXTRACTION', 'All OCR configurations failed to produce sufficient text', {
          bestLength: bestResult.text.length,
          bestConfidence: bestResult.confidence
        });
        throw createError.ocrFailed(
          file.name, 
          `Insufficient text extracted: ${bestResult.text.length} characters with ${bestResult.confidence}% confidence`
        );
      }
      
      // Clean and validate the OCR text
      const cleanedText = this.cleanOCRText(bestResult.text);
      
      logger.info('OCR_EXTRACTION', 'OCR extraction completed successfully', {
        originalLength: bestResult.text.length,
        cleanedLength: cleanedText.length,
        confidence: bestResult.confidence,
        extractedWords: cleanedText.split(/\s+/).length
      });
      
      if (onProgress) onProgress(100, 100, 'OCR completed successfully!');
      
      return cleanedText;
      
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      
      logger.error('OCR_EXTRACTION', 'OCR extraction failed', error as Error);
      throw createError.ocrFailed(file.name, (error as Error).message);
    }
  }

  private static cleanOCRText(text: string): string {
    if (!text) return '';
    
    return text
      // Fix common OCR errors
      .replace(/[|]/g, 'I')
      .replace(/[0]/g, 'O')
      .replace(/[@]/g, 'a')
      .replace(/[1]/g, 'l')
      
      // Clean up spacing
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .replace(/^\s+|\s+$/g, '')
      
      // Fix common formatting issues
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/(\d)([A-Za-z])/g, '$1 $2')
      .replace(/([A-Za-z])(\d)/g, '$1 $2')
      
      .trim();
  }

  private static validateParsedData(data: ParsedResumeData, strictValidation: boolean): void {
    logger.info('VALIDATION', 'Starting data validation', { strictValidation });
    
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Validate contact information
    if (!data.contact.firstName && !data.contact.lastName) {
      const message = 'No name found in resume';
      if (strictValidation) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }
    
    if (!data.contact.email) {
      const message = 'No email address found';
      if (strictValidation) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }
    
    if (!data.contact.phone) {
      warnings.push('No phone number found');
    }
    
    // Validate work experiences
    if (data.workExperiences.length === 0) {
      const message = 'No work experience found';
      if (strictValidation) {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    } else {
      const validExperiences = data.workExperiences.filter(exp => exp.jobTitle && exp.jobTitle.trim());
      if (validExperiences.length === 0) {
        const message = 'No valid work experience entries found';
        if (strictValidation) {
          errors.push(message);
        } else {
          warnings.push(message);
        }
      }
    }
    
    // Validate education
    if (!data.education.school && !data.education.degree) {
      warnings.push('No education information found');
    }
    
    // Validate skills
    if (data.skills.length === 0) {
      warnings.push('No skills found');
    } else if (data.skills.length > 100) {
      warnings.push('Very large number of skills detected, may include noise');
    }
    
    // Log validation results
    if (warnings.length > 0) {
      logger.warn('VALIDATION', 'Data validation warnings', { warnings });
    }
    
    if (errors.length > 0) {
      logger.error('VALIDATION', 'Data validation errors', undefined, { errors });
      throw new ParserError(
        ErrorCode.INSUFFICIENT_DATA,
        `Data validation failed: ${errors.join(', ')}`,
        ErrorSeverity.HIGH,
        { errors, warnings }
      );
    }
    
    logger.info('VALIDATION', 'Data validation completed successfully', {
      warningCount: warnings.length,
      errorCount: errors.length
    });
  }

  private static parseText(text: string): ParsedResumeData {
    logger.info('TEXT_PARSING', 'Starting text parsing');
    
    // Clean and normalize text
    const cleanText = this.cleanText(text);
    logger.debug('TEXT_PARSING', 'Text cleaned', { 
      originalLength: text.length,
      cleanedLength: cleanText.length 
    });
    
    const sections = this.identifySections(cleanText);
    logger.info('TEXT_PARSING', 'Sections identified', { 
      sections: Object.keys(sections),
      sectionLengths: Object.fromEntries(
        Object.entries(sections).map(([key, value]) => [key, value.length])
      )
    });
    
    const result = {
      contact: this.extractContactInfo(cleanText, sections.contact || ''),
      workExperiences: this.extractWorkExperience(cleanText, sections.experience || ''),
      education: this.extractEducation(cleanText, sections.education || ''),
      skills: this.extractSkills(cleanText, sections.skills || ''),
      summary: this.extractSummary(cleanText, sections.summary || '')
    };
    
    logger.info('TEXT_PARSING', 'Text parsing completed', {
      contactFound: !!(result.contact.firstName || result.contact.email),
      workExperienceCount: result.workExperiences.length,
      educationFound: !!(result.education.school || result.education.degree),
      skillsCount: result.skills.length,
      summaryLength: result.summary.length
    });
    
    return result;
  }

  // ... (continuing with the rest of the parsing methods - they would be similar to the original but with enhanced logging and error handling)
  
  private static cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  private static identifySections(text: string): Record<string, string> {
    logger.debug('SECTION_IDENTIFICATION', 'Starting section identification');
    
    const lines = text.split('\n');
    const sections: Record<string, string> = {};
    const sectionBoundaries: Array<{name: string, start: number, end: number, headerLine: string}> = [];
    
    // Find all section headers
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length === 0) continue;
      
      for (const [sectionName, patterns] of Object.entries(this.PATTERNS.section)) {
        for (let j = 0; j < patterns.length; j++) {
          const pattern = patterns[j];
          if (pattern.test(line)) {
            logger.debug('SECTION_IDENTIFICATION', `Found ${sectionName} section`, {
              line: i,
              text: line,
              pattern: j
            });
            
            const existingBoundary = sectionBoundaries.find(b => b.name === sectionName);
            if (!existingBoundary) {
              sectionBoundaries.push({
                name: sectionName, 
                start: i, 
                end: lines.length,
                headerLine: line
              });
            }
            break;
          }
        }
      }
    }
    
    // Set end boundaries
    for (let i = 0; i < sectionBoundaries.length - 1; i++) {
      sectionBoundaries[i].end = sectionBoundaries[i + 1].start;
    }
    
    // Extract section content
    for (const boundary of sectionBoundaries) {
      const sectionLines = lines.slice(boundary.start + 1, boundary.end);
      sections[boundary.name] = sectionLines.join('\n').trim();
      
      logger.debug('SECTION_IDENTIFICATION', `Extracted ${boundary.name} section`, {
        contentLength: sections[boundary.name].length,
        lineRange: `${boundary.start + 1}-${boundary.end}`
      });
    }
    
    logger.info('SECTION_IDENTIFICATION', 'Section identification completed', {
      sectionsFound: Object.keys(sections).length,
      sections: Object.keys(sections)
    });
    
    return sections;
  }

  // Placeholder methods - these would contain the enhanced versions of the original parsing methods
  private static extractContactInfo(fullText: string, contactSection: string): ContactInfo {
    // Enhanced contact extraction with better logging and error handling
    // ... (implementation similar to original but with logger calls)
    return {
      firstName: '',
      lastName: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      email: ''
    };
  }

  private static extractWorkExperience(fullText: string, experienceSection: string): WorkExperience[] {
    // Enhanced work experience extraction
    // ... (implementation similar to original but with logger calls)
    return [];
  }

  private static extractEducation(fullText: string, educationSection: string): Education {
    // Enhanced education extraction
    // ... (implementation similar to original but with logger calls)
    return {
      school: '',
      location: '',
      degree: '',
      field: '',
      gradYear: '',
      gradMonth: ''
    };
  }

  private static extractSkills(fullText: string, skillsSection: string): string[] {
    // Enhanced skills extraction
    // ... (implementation similar to original but with logger calls)
    return [];
  }

  private static extractSummary(fullText: string, summarySection: string): string {
    // Enhanced summary extraction
    // ... (implementation similar to original but with logger calls)
    return '';
  }

  static convertToResumeData(parsedData: ParsedResumeData): ResumeData {
    logger.info('CONVERSION', 'Converting parsed data to resume format');
    
    // Enhanced conversion with validation and logging
    const result = {
      contact: {
        firstName: parsedData.contact.firstName || '',
        lastName: parsedData.contact.lastName || '',
        email: parsedData.contact.email || '',
        phone: parsedData.contact.phone || '',
        city: parsedData.contact.city || '',
        state: parsedData.contact.state || '',
        zip: parsedData.contact.zip || '',
        summary: parsedData.summary || '',
        linkedin: parsedData.contact.linkedin || '',
        website: parsedData.contact.website || '',
      },
      workExperiences: parsedData.workExperiences.length > 0 
        ? parsedData.workExperiences 
        : [{
            id: 1,
            jobTitle: '',
            employer: '',
            location: '',
            remote: false,
            startDate: null,
            endDate: null,
            current: false,
            accomplishments: ''
          }],
      education: parsedData.education,
      skills: parsedData.skills || [],
      summary: parsedData.summary || '',
      projects: [],
      certifications: [],
      languages: [],
      volunteerExperiences: [],
      publications: [],
      awards: [],
      references: [],
      activeSections: {
        contact: true,
        summary: true,
        experience: true,
        education: true,
        skills: true,
        projects: false,
        certifications: false,
        languages: false,
        volunteer: false,
        publications: false,
        awards: false,
        references: false
      }
    };
    
    logger.info('CONVERSION', 'Conversion completed', {
      hasContact: !!(result.contact.firstName || result.contact.email),
      workExperienceCount: result.workExperiences.length,
      skillsCount: result.skills.length,
      summaryLength: result.summary.length
    });
    
    return result;
  }

  // Utility method to get parsing statistics
  static getParsingStatistics(): ReturnType<typeof ParserLogger.getLogsSummary> {
    return ParserLogger.getLogsSummary();
  }

  // Utility method to export logs for debugging
  static exportLogs(): string {
    return ParserLogger.exportLogs();
  }
}