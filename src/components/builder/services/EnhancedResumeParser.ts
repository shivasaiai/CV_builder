import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import { WorkExperience, Education, ResumeData, ContactInfo } from '../types';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
}

interface ParsedResumeData {
  contact: ContactInfo;
  workExperiences: WorkExperience[];
  education: Education;
  skills: string[];
  summary: string;
}

export interface ProgressCallback {
  (progress: number, total: number, status: string): void;
}

export class EnhancedResumeParser {
  
  // Production-grade patterns for comprehensive extraction
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
      /\+\d{1,3}[-.\s]?\d{1,14}/g
    ],
    name: [
      /^([A-Z][a-z]+)\s+([A-Z][a-z]+)(?:\s+([A-Z][a-z]+))?$/, // John Smith or John Doe Smith
      /^([A-Z][A-Z\s]+)$/, // JOHN SMITH (all caps)
      /^([A-Z][a-zA-Z\s]{2,50})$/, // Mixed case names
      /([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)*[A-Z][a-z]+)/, // Names with initials
      /^([A-Z][a-z]+(?:\s+[A-Za-z]+){1,3})$/ // Multiple name variations
    ],
    location: [
      /([A-Za-z\s\-]+),?\s*([A-Z]{2,}|[A-Za-z\s]+)(?:\s*,?\s*(\d{5}))?/g,
      /([A-Za-z\s]+),\s*([A-Z]{2})\s*(\d{5})?/g,
      /([A-Za-z\s]+),\s*([A-Za-z\s]+)/g
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
      // Month Year formats
      /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(?:19|20)\d{2})/gi,
      /(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(?:19|20)\d{2})/gi,
      
      // Year only
      /(?:19|20)\d{2}/g,
      
      // Date ranges with various separators
      /(?:\d{1,2}\/\d{1,2}\/\d{2,4})/gi,
      /(?:\d{4}\s*[-–—]\s*\d{4})/gi,
      /(?:\d{4}\s*to\s*\d{4})/gi,
      /(?:\d{4}\s*[-–—]\s*(?:Present|Current|Now))/gi,
      
      // Month/Year ranges
      /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*[-–—]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|Present|Current))/gi,
      
      // Alternative formats
      /(?:\d{1,2}[-\/]\d{4})/gi, // MM/YYYY or MM-YYYY
      /(?:\d{4}[-\/]\d{1,2})/gi, // YYYY/MM or YYYY-MM
    ],
    section: {
      experience: [
        // Comprehensive experience patterns with typos and variations
        /(?:^|\n)\s*(PROFESSIONAL\s+EXPERIENCE|WORK\s+EXPERIENCE|EXPERIEN[C]?E|EMPLOYMENT\s+HISTORY|CAREER\s+HISTORY|WORK\s+HISTORY|EMPLOYMENT|CAREER\s+EXPERIENCE|PROFESSIONAL\s+BACKGROUND|WORK\s+BACKGROUND|JOB\s+EXPERIENCE|WORKING\s+EXPERIENCE)\s*:?\s*$/im,
        /(?:^|\n)\s*(Experience|Work|Employment|Career|Professional|Job\s+History|Experien[c]?e|Working\s+Experience)\s*:?\s*$/im,
        /(?:^|\n)\s*(EXPERIENCE|WORK|EMPLOYMENT|CAREER|EXPERIEN[C]?E)\s*$/im,
        /^(Experience|Work|Employment|Career|Experien[c]?e)\s*:?\s*$/im,
        // Common variations and typos
        /(?:^|\n)\s*(WORK\s+EXPERIEN[C]?E|PROFESSIONAL\s+EXPERIEN[C]?E|CAREER\s+EXPERIEN[C]?E)\s*:?\s*$/im,
        /(?:^|\n)\s*(experien[c]?e|work|employment|career)\s*:?\s*$/im,
        // Numbered sections
        /(?:^|\n)\s*\d+\.\s*(EXPERIENCE|WORK|EMPLOYMENT|CAREER|EXPERIEN[C]?E)\s*:?\s*$/im,
        // With underscores or dashes
        /(?:^|\n)\s*(EXPERIENCE|WORK|EMPLOYMENT|CAREER)[\s_-]*:?\s*$/im
      ],
      education: [
        // Comprehensive education patterns with typos and variations  
        /(?:^|\n)\s*(EDUCATION|ACADEMIC\s+BACKGROUND|QUALIFICATIONS|EDUCATIONAL\s+BACKGROUND|ACADEMICS|SCHOOLING|LEARNING|STUDIES|UNIVERSITY|COLLEGE)\s*:?\s*$/im,
        /(?:^|\n)\s*(Education|Academics|Schooling|Learning|Studies|University|College|Academic\s+Background)\s*:?\s*$/im,
        /(?:^|\n)\s*(EDUCATION|ACADEMICS|SCHOOLING|LEARNING|STUDIES)\s*$/im,
        /^(Education|Academics|Schooling|Learning|Studies)\s*:?\s*$/im,
        // Common typos and variations
        /(?:^|\n)\s*(EDUCATON|EDUCTION|EDUCATN)\s*:?\s*$/im,
        /(?:^|\n)\s*(education|academics|schooling|learning|studies)\s*:?\s*$/im,
        // Numbered sections
        /(?:^|\n)\s*\d+\.\s*(EDUCATION|ACADEMICS|SCHOOLING|LEARNING|STUDIES)\s*:?\s*$/im,
        // With underscores or dashes
        /(?:^|\n)\s*(EDUCATION|ACADEMICS|SCHOOLING)[\s_-]*:?\s*$/im
      ],
      skills: [
        /(?:^|\n)\s*(SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|EXPERTISE|TECHNICAL\s+EXPERTISE|COMPETENCIES|TECHNOLOGIES)\s*:?\s*$/im,
        /(?:^|\n)\s*(Skills)\s*$/im,
        /(?:^|\n)\s*(Technologies)\s*$/im
      ],
      summary: [
        /(?:^|\n)\s*(SUMMARY|PROFILE|OBJECTIVE|PROFESSIONAL\s+SUMMARY|CAREER\s+OBJECTIVE|PERSONAL\s+STATEMENT|ABOUT\s+ME|CAREER\s+SUMMARY)\s*:?\s*$/im,
        /(?:^|\n)\s*(Summary)\s*$/im,
        /(?:^|\n)\s*(Profile)\s*$/im,
        /(?:^|\n)\s*(Objective)\s*$/im
      ]
    }
  };

  static async parseFile(file: File, onProgress?: ProgressCallback): Promise<ParsedResumeData> {
    const startTime = performance.now();
    console.log('🚀 === PRODUCTION GRADE RESUME PARSER V2.0 ===');
    console.log('📄 File details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      lastModified: new Date(file.lastModified).toISOString(),
      extension: file.name.split('.').pop()?.toLowerCase()
    });
    
    // Production-grade input validation
    if (!file) {
      throw new Error('❌ No file provided');
    }
    
    if (file.size === 0) {
      throw new Error('❌ File is empty (0 bytes)');
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error(`❌ File too large: ${(file.size / 1024 / 1024).toFixed(2)} MB. Maximum allowed: 50 MB`);
    }
    
    // Validate file type
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
    const hasValidMimeType = allowedTypes.some(type => file.type.includes(type.split('/')[1]));
    
    if (!hasValidExtension && !hasValidMimeType && file.type !== '') {
      console.warn('⚠️ Potentially unsupported file type, but attempting to process...');
    }
    
    const fileType = file.type.toLowerCase();
    let text = '';
    

    
    if (onProgress) onProgress(0, 100, 'Starting parsing...');

    try {
      // Enhanced file type detection
      if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
        console.log('Processing as PDF file');
        text = await this.extractFromPDF(file, onProgress);
      } else if (fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        console.log('Processing as Word document');
        text = await this.extractFromDOCX(file, onProgress);
      } else if (fileType.includes('text') || fileName.endsWith('.txt')) {
        console.log('Processing as text file');
        text = await this.extractFromText(file, onProgress);
      } else if (fileType.includes('image') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/)) {
        console.log('Processing as image file with OCR');
        text = await this.extractWithOCR(file, onProgress);
      } else if (fileName.endsWith('.rtf')) {
        console.log('Processing RTF as text file');
        text = await this.extractFromText(file, onProgress);
      } else {
        console.warn(`Unknown file type: ${fileType}, extension: ${fileName.split('.').pop()}`);
        console.log('Attempting text extraction as fallback...');
        text = await this.extractFromText(file, onProgress);
      }

      // Production-ready text validation

      // Validate extracted text
      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from the file. Please ensure the file contains readable text.');
      }

      if (text.length < 50) {
        console.warn('Very short text extracted, may not contain sufficient resume data');
        // Try to continue anyway for short resumes
      }

      console.log('=== EXTRACTED TEXT ANALYSIS ===');
      console.log('Text length:', text.length);
      console.log('Number of lines:', text.split('\n').length);
      console.log('Number of words:', text.split(/\s+/).length);
      console.log('First 1000 characters:');
      console.log(text.substring(0, 1000));
      console.log('Last 500 characters:');
      console.log(text.substring(Math.max(0, text.length - 500)));
      
      // Show all lines for debugging
      const lines = text.split('\n');
      console.log('=== ALL EXTRACTED LINES (First 50) ===');
      lines.slice(0, 50).forEach((line, index) => {
        console.log(`Line ${index}: "${line}"`);
      });

      if (onProgress) onProgress(80, 100, 'Parsing content...');

      const parsedData = this.parseText(text);
      
      // Validate parsed data
      this.validateParsedData(parsedData);
      
      if (onProgress) onProgress(100, 100, 'Complete!');
      
      // Performance metrics
      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);
      
      console.log('🎉 === PARSING COMPLETED SUCCESSFULLY ===');
      console.log('⏱️ Performance:', {
        processingTime: `${processingTime}ms`,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        throughput: `${((file.size / 1024) / (processingTime / 1000)).toFixed(1)} KB/s`
      });
      
      console.log('📊 === EXTRACTION SUMMARY ===');
      console.log('👤 Contact:', {
        name: `${parsedData.contact.firstName} ${parsedData.contact.lastName}`.trim() || 'Not found',
        email: parsedData.contact.email || 'Not found',
        phone: parsedData.contact.phone || 'Not found'
      });
      console.log('💼 Work Experiences:', parsedData.workExperiences.length);
      console.log('🎓 Education:', {
        school: parsedData.education.school || 'Not found',
        degree: parsedData.education.degree || 'Not found',
        year: parsedData.education.gradYear || 'Not found'
      });
      console.log('🛠️ Skills:', parsedData.skills.length);
      console.log('📝 Summary:', parsedData.summary ? `${parsedData.summary.length} characters` : 'Not found');
      
      return parsedData;
    } catch (error) {
      console.error('=== PARSING ERROR ===', error);
      
      // Provide more helpful error messages
      if (error instanceof Error) {
        if (error.message.includes('PDF')) {
          throw new Error(`PDF parsing failed: ${error.message}. Try converting your PDF to a text-selectable format.`);
        } else if (error.message.includes('DOCX')) {
          throw new Error(`Word document parsing failed: ${error.message}. Try saving as a newer .docx format.`);
        } else if (error.message.includes('OCR')) {
          throw new Error(`OCR processing failed: ${error.message}. Your PDF may be image-based and couldn't be processed.`);
        }
      }
      
      throw new Error(`Failed to parse ${file.name}: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  }

  private static validateParsedData(data: ParsedResumeData): void {
    console.log('=== VALIDATING PARSED DATA ===');
    
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Validate contact information
    if (!data.contact.firstName && !data.contact.lastName) {
      warnings.push('No name found in resume');
    }
    if (!data.contact.email) {
      warnings.push('No email address found');
    }
    if (!data.contact.phone) {
      warnings.push('No phone number found');
    }
    
    // Validate work experiences
    if (data.workExperiences.length === 0) {
      warnings.push('No work experience found');
    } else {
      const validExperiences = data.workExperiences.filter(exp => exp.jobTitle && exp.jobTitle.trim());
      if (validExperiences.length === 0) {
        warnings.push('No valid work experience entries found');
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
      console.warn('Data validation warnings:', warnings);
    }
    if (errors.length > 0) {
      console.error('Data validation errors:', errors);
      throw new Error(`Data validation failed: ${errors.join(', ')}`);
    }
    
    console.log('Data validation completed successfully');
  }

  private static async extractFromPDF(file: File, onProgress?: ProgressCallback): Promise<string> {
    console.log('=== PDF EXTRACTION START ===');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error('PDF file appears to be empty or corrupted');
      }
      
      console.log('PDF buffer size:', arrayBuffer.byteLength);
      
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        // Add error handling options
        verbosity: 0, // Reduce console spam
        cMapPacked: true,
        standardFontDataUrl: null
      }).promise;
      
      if (!pdf || pdf.numPages === 0) {
        throw new Error('PDF has no readable pages');
      }
      
      let fullText = '';
      console.log('PDF pages:', pdf.numPages);

      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          if (onProgress) onProgress((i / pdf.numPages) * 60, 100, `Reading page ${i}/${pdf.numPages}`);
          
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          console.log(`Page ${i} items:`, textContent.items.length);
          
          if (!textContent.items || textContent.items.length === 0) {
            console.warn(`Page ${i} has no text content`);
            continue;
          }
          
          const pageText = textContent.items
            .filter((item): item is any => 'str' in item && item.str.trim().length > 0)
            .map((item: any) => {
              console.log('Text item:', item.str);
              return item.str;
            })
            .join(' ');
          
          console.log(`Page ${i} text length:`, pageText.length);
          fullText += pageText + '\n';
          
        } catch (pageError) {
          console.error(`Error processing page ${i}:`, pageError);
          // Continue with other pages
        }
      }

      console.log('Total extracted text length:', fullText.length);

      // Enhanced OCR fallback strategy
      if (fullText.length < 100) {
        console.log('Text extraction poor, trying OCR...');
        if (onProgress) onProgress(65, 100, 'Text extraction poor, trying OCR...');
        
        try {
          const ocrText = await this.extractWithOCR(file, onProgress);
          if (ocrText && ocrText.length > fullText.length) {
            console.log('OCR provided better results, using OCR text');
            return ocrText;
          }
        } catch (ocrError) {
          console.error('OCR fallback failed:', ocrError);
          // Continue with the extracted text even if OCR fails
        }
      }

      // If still no text, try alternative PDF parsing methods
      if (fullText.length === 0) {
        console.log('No text extracted, trying alternative methods...');
        if (onProgress) onProgress(70, 100, 'Trying alternative extraction...');
        
        try {
          // Try OCR even if text extraction seemed to work but produced no results
          console.log('Attempting OCR on potentially image-based PDF...');
          const ocrText = await this.extractWithOCR(file, onProgress);
          if (ocrText && ocrText.length > 50) {
            console.log('✅ OCR successful on image-based PDF, extracted', ocrText.length, 'characters');
            return ocrText;
          } else {
            console.warn('OCR completed but extracted insufficient text:', ocrText?.length || 0, 'characters');
          }
        } catch (ocrError) {
          console.error('Alternative OCR failed:', ocrError);
        }
        
        // If we still have some text, even if minimal, try to use it
        if (fullText.length > 10) {
          console.warn('Using minimal extracted text despite poor quality');
          return fullText;
        }
        
        throw new Error('Could not extract any text from PDF. The PDF may be image-based, corrupted, or password-protected.');
      }

      // Also try OCR if we got very little text (likely image-based PDF with some metadata)
      if (fullText.length < 200) {
        console.log('Very little text extracted, trying OCR to supplement...');
        try {
          const ocrText = await this.extractWithOCR(file, onProgress);
          if (ocrText && ocrText.length > fullText.length * 2) {
            console.log('✅ OCR provided significantly better results, using OCR text');
            return ocrText;
          }
        } catch (ocrError) {
          console.warn('Supplementary OCR failed, using extracted text:', ocrError);
        }
      }

      return fullText;
      
    } catch (error) {
      console.error('PDF extraction error:', error);
      
      // Try OCR as last resort for PDF parsing errors
      try {
        console.log('PDF parsing failed, attempting OCR as last resort...');
        if (onProgress) onProgress(75, 100, 'PDF parsing failed, trying OCR...');
        
        const ocrText = await this.extractWithOCR(file, onProgress);
        if (ocrText && ocrText.length > 50) {
          console.log('OCR successful after PDF parsing failure');
          return ocrText;
        }
      } catch (ocrError) {
        console.error('OCR last resort failed:', ocrError);
      }
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid PDF')) {
          throw new Error('Invalid PDF file format. Please ensure the file is a valid PDF.');
        } else if (error.message.includes('password')) {
          throw new Error('PDF is password protected. Please provide an unlocked PDF.');
        }
      }
      
      throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown PDF error'}`);
    }
  }

  private static async extractFromDOCX(file: File, onProgress?: ProgressCallback): Promise<string> {
    console.log('=== DOCX EXTRACTION START ===');
    if (onProgress) onProgress(30, 100, 'Extracting from DOCX...');
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    console.log('DOCX text length:', result.value.length);
    if (onProgress) onProgress(70, 100, 'DOCX extraction complete');
    
    return result.value;
  }

  private static async extractFromText(file: File, onProgress?: ProgressCallback): Promise<string> {
    console.log('=== TEXT EXTRACTION START ===');
    if (onProgress) onProgress(50, 100, 'Reading text file...');
    
    const text = await file.text();
    console.log('Text file length:', text.length);
    
    if (onProgress) onProgress(70, 100, 'Text file read complete');
    
    return text;
  }

  private static async extractWithOCR(file: File, onProgress?: ProgressCallback): Promise<string> {
    console.log('🔍 === PRODUCTION OCR EXTRACTION START ===');
    console.log('📄 File details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      isImageBased: file.type.includes('image') || file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/)
    });
    
    try {
      if (onProgress) onProgress(5, 100, 'Initializing OCR engine...');
      
      // Production-grade OCR configurations for different scenarios
      const ocrConfigurations = [
        {
          name: 'High Accuracy Configuration',
          options: {
            logger: (m: any) => {
              if (m.status === 'recognizing text' && onProgress) {
                const progress = Math.round(5 + (m.progress * 80)); // 5-85% range
                onProgress(progress, 100, `OCR: ${m.status} (${Math.round(m.progress * 100)}%)`);
              }
            },
            tessedit_ocr_engine_mode: 1, // Neural net LSTM engine
            tessedit_pageseg_mode: 3, // Fully automatic page segmentation, but no OSD
            tessedit_char_whitelist: undefined, // Allow all characters
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
            tessedit_pageseg_mode: 6, // Uniform block of text
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
            tessedit_ocr_engine_mode: 0, // Legacy OCR engine
            tessedit_pageseg_mode: 1, // Automatic page segmentation with OSD
          }
        }
      ];
      
      let bestResult = { text: '', confidence: 0 };
      let lastError: Error | null = null;
      
      // Try each configuration until we get good results
      for (let i = 0; i < ocrConfigurations.length; i++) {
        const config = ocrConfigurations[i];
        console.log(`🔧 Trying OCR configuration: ${config.name}`);
        
        try {
          if (onProgress) onProgress(5 + (i * 30), 100, `Trying ${config.name}...`);
          
          const result = await Tesseract.recognize(file, 'eng', config.options);
          const { text, confidence } = result.data;
          
          console.log(`📊 ${config.name} results:`, {
            textLength: text.length,
            confidence: confidence,
            preview: text.substring(0, 100) + '...'
          });
          
          // Accept result if it's better than previous attempts
          if (text.length > bestResult.text.length || 
              (text.length > 100 && confidence > bestResult.confidence)) {
            bestResult = { text, confidence };
            console.log(`✅ ${config.name} produced better results`);
            
            // If we got good results, don't try other configs
            if (text.length > 500 && confidence > 70) {
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
      
      // Validate final results
      if (bestResult.text.length < 30) {
        console.error('❌ All OCR configurations failed to produce sufficient text');
        throw new Error(`OCR failed to extract sufficient text. Best attempt: ${bestResult.text.length} characters with ${bestResult.confidence}% confidence`);
      }
      
      // Clean and validate the OCR text
      const cleanedText = this.cleanOCRText(bestResult.text);
      
      console.log('🎉 === OCR EXTRACTION COMPLETED ===');
      console.log('📝 Final OCR results:', {
        originalLength: bestResult.text.length,
        cleanedLength: cleanedText.length,
        confidence: bestResult.confidence,
        extractedWords: cleanedText.split(/\s+/).length,
        preview: cleanedText.substring(0, 200) + '...'
      });
      
      if (onProgress) onProgress(100, 100, 'OCR completed successfully!');
      
      return cleanedText;
      
    } catch (error) {
      console.error('💥 === OCR EXTRACTION FAILED ===', error);
      
      if (onProgress) onProgress(100, 100, 'OCR failed');
      
      // Provide detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown OCR error';
      throw new Error(`OCR processing failed: ${errorMessage}. This might be due to poor image quality, unsupported format, or corrupted file.`);
    }
  }

  private static cleanOCRText(text: string): string {
    if (!text) return '';
    
    return text
      // Fix common OCR errors
      .replace(/[|]/g, 'I') // Pipe to I
      .replace(/[0]/g, 'O') // Zero to O in appropriate contexts
      .replace(/[@]/g, 'a') // @ to a
      .replace(/[1]/g, 'l') // 1 to l in appropriate contexts
      
      // Clean up spacing
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\n\s*\n/g, '\n') // Multiple newlines to single
      .replace(/^\s+|\s+$/g, '') // Trim
      
      // Fix common formatting issues
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase
      .replace(/(\d)([A-Za-z])/g, '$1 $2') // Add space between number and letter
      .replace(/([A-Za-z])(\d)/g, '$1 $2') // Add space between letter and number
      
      .trim();
  }

  private static parseText(text: string): ParsedResumeData {
    console.log('=== PARSING TEXT START ===');
    
    // Clean and normalize text
    const cleanText = this.cleanText(text);
    console.log('Cleaned text length:', cleanText.length);
    
    const sections = this.identifySections(cleanText);
    console.log('Identified sections:', Object.keys(sections));
    
    return {
      contact: this.extractContactInfo(cleanText, sections.contact || ''),
      workExperiences: this.extractWorkExperience(cleanText, sections.experience || ''),
      education: this.extractEducation(cleanText, sections.education || ''),
      skills: this.extractSkills(cleanText, sections.skills || ''),
      summary: this.extractSummary(cleanText, sections.summary || '')
    };
  }

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
    console.log('=== IDENTIFYING SECTIONS ===');
    const lines = text.split('\n');
    const sections: Record<string, string> = {};
    
    const sectionBoundaries: Array<{name: string, start: number, end: number, headerLine: string}> = [];
    
    // Find all section headers with enhanced logging
    console.log('Scanning for section headers in', lines.length, 'lines...');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (line.length === 0) continue;
      
      // Check each section type
      for (const [sectionName, patterns] of Object.entries(this.PATTERNS.section)) {
        for (let j = 0; j < patterns.length; j++) {
          const pattern = patterns[j];
          if (pattern.test(line)) {
            console.log(`✓ Found ${sectionName} section at line ${i}: "${line}" (pattern ${j})`);
            
            // Check if we already have this section type
            const existingBoundary = sectionBoundaries.find(b => b.name === sectionName);
            if (existingBoundary) {
              console.log(`Already found ${sectionName} section, skipping duplicate`);
              break;
            }
            
            sectionBoundaries.push({
              name: sectionName, 
              start: i, 
              end: lines.length,
              headerLine: line
            });
            break;
          }
        }
      }
    }
    
    console.log('Section boundaries found:', sectionBoundaries.length);
    sectionBoundaries.forEach(b => {
      console.log(`  - ${b.name}: line ${b.start} ("${b.headerLine}")`);
    });
    
    // Set end boundaries
    for (let i = 0; i < sectionBoundaries.length - 1; i++) {
      sectionBoundaries[i].end = sectionBoundaries[i + 1].start;
    }
    
    // Extract section content
    for (const boundary of sectionBoundaries) {
      const sectionLines = lines.slice(boundary.start + 1, boundary.end);
      sections[boundary.name] = sectionLines.join('\n').trim();
      console.log(`${boundary.name} section content (lines ${boundary.start + 1}-${boundary.end}):`, sections[boundary.name].length, 'characters');
      
      // Show preview of content
      if (sections[boundary.name].length > 0) {
        console.log(`  Preview: "${sections[boundary.name].substring(0, 100)}..."`);
      }
    }
    
    // Enhanced fallback strategy with partial section detection
    if (Object.keys(sections).length === 0) {
      console.log('No formal sections found, using enhanced fallback strategy...');
      console.log('=== TESTING SECTION PATTERNS MANUALLY ===');
      
      // Test all patterns manually to see why they're not matching
      const testLines = text.split('\n').map(line => line.trim());
      for (let i = 0; i < Math.min(100, testLines.length); i++) {
        const line = testLines[i];
        if (line.length === 0) continue;
        
        // Test experience patterns
        for (let j = 0; j < this.PATTERNS.section.experience.length; j++) {
          const pattern = this.PATTERNS.section.experience[j];
          if (pattern.test(line)) {
            console.log(`✓ EXPERIENCE pattern ${j} matches line ${i}: "${line}"`);
          }
        }
        
        // Check for common experience indicators
        if (/(experience|work|employment|career|professional)/i.test(line) && line.length < 50) {
          console.log(`? Potential experience header at line ${i}: "${line}"`);
        }
      }
      
      // Try to find content that looks like each section type
      sections.contact = this.findContactFallback(text);
      sections.experience = this.findExperienceFallback(text);
      sections.education = this.findEducationFallback(text);
      sections.skills = this.findSkillsFallback(text);
      sections.summary = this.findSummaryFallback(text);
      
      console.log('Fallback sections created:');
      Object.keys(sections).forEach(key => {
        console.log(`  - ${key}: ${sections[key].length} characters`);
      });
    }
    
    return sections;
  }

  private static findContactFallback(text: string): string {
    const lines = text.split('\n').slice(0, 15); // First 15 lines likely contain contact
    return lines.join('\n');
  }

  private static findExperienceFallback(text: string): string {
    console.log('=== EXPERIENCE FALLBACK EXTRACTION ===');
    
    // Look for work-related keywords in the text
    const workKeywords = /(software engineer|full stack developer|backend developer|frontend developer|developer|engineer|analyst|specialist|coordinator|assistant|director|lead|senior|junior|intern|administrator|supervisor|consultant|architect|designer|programmer|technician|officer|representative|sales|marketing|finance|hr|human resources|accountant)/i;
    const companyKeywords = /(company|inc|llc|corp|ltd|technologies|solutions|systems|services|group|pvt|private|limited)/i;
    const dateKeywords = /(20\d{2}|19\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|current)/i;
    
    const lines = text.split('\n');
    const workRelatedLines: string[] = [];
    const experienceContext: string[] = [];
    
    // Look for experience-related content in context
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length === 0) continue;
      
      const hasWorkKeyword = workKeywords.test(line);
      const hasCompanyKeyword = companyKeywords.test(line);
      const hasDateKeyword = dateKeywords.test(line);
      const looksLikeJob = this.looksLikeJobTitle(line);
      const looksLikeWork = this.looksLikeWorkEntry(line);
      
      if (hasWorkKeyword || hasCompanyKeyword || looksLikeJob || looksLikeWork) {
        console.log(`✓ Work-related line ${i}: "${line}"`);
        console.log(`  Reasons:`, {
          hasWorkKeyword, hasCompanyKeyword, looksLikeJob, looksLikeWork
        });
        
        workRelatedLines.push(line);
        
        // Include surrounding context (previous and next few lines)
        for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 3); j++) {
          const contextLine = lines[j].trim();
          if (contextLine.length > 0 && !experienceContext.includes(contextLine)) {
            experienceContext.push(contextLine);
          }
        }
      }
    }
    
    console.log('Found', workRelatedLines.length, 'work-related lines in fallback');
    console.log('Experience context lines:', experienceContext.length);
    
    // Return the context if we found work-related content, otherwise just the work lines
    const result = experienceContext.length > workRelatedLines.length ? 
                   experienceContext.join('\n') : 
                   workRelatedLines.join('\n');
    
    console.log('Fallback experience text length:', result.length);
    console.log('First 300 chars of fallback experience:', result.substring(0, 300));
    
    return result;
  }

  private static findEducationFallback(text: string): string {
    // Look for education-related keywords
    const eduKeywords = /(university|college|school|degree|bachelor|master|phd|doctorate|education|academic|graduated|gpa|major|minor)/i;
    
    const lines = text.split('\n');
    const educationLines: string[] = [];
    
    for (const line of lines) {
      if (eduKeywords.test(line)) {
        educationLines.push(line);
      }
    }
    
    console.log('Found', educationLines.length, 'education-related lines in fallback');
    return educationLines.join('\n');
  }

  private static findSkillsFallback(text: string): string {
    // Look for technical skills and tools
    const skillKeywords = /(javascript|python|java|react|angular|vue|node|sql|mysql|mongodb|git|html|css|php|ruby|go|swift|kotlin|aws|azure|docker|kubernetes|typescript|c\+\+|programming|software|development|technical|tools|technologies|frameworks|languages)/i;
    
    const lines = text.split('\n');
    const skillLines: string[] = [];
    
    for (const line of lines) {
      if (skillKeywords.test(line)) {
        skillLines.push(line);
      }
    }
    
    console.log('Found', skillLines.length, 'skill-related lines in fallback');
    return skillLines.join('\n');
  }

  private static findSummaryFallback(text: string): string {
    // Look for summary-like content
    const summaryKeywords = /(experienced|professional|skilled|expertise|specialist|expert|proven track record|years of experience|background in|passionate about|dedicated|results-driven|motivated|accomplished|seasoned)/i;
    
    const lines = text.split('\n');
    const summaryLines: string[] = [];
    
    for (const line of lines) {
      if (line.length > 50 && summaryKeywords.test(line)) {
        summaryLines.push(line);
      }
    }
    
    console.log('Found', summaryLines.length, 'summary-related lines in fallback');
    return summaryLines.slice(0, 3).join('\n'); // Take first 3 summary-like lines
  }

  private static extractContactInfo(fullText: string, contactSection: string): ContactInfo {
    console.log('=== EXTRACTING CONTACT INFO ===');
    console.log('Contact section length:', contactSection.length);
    console.log('Contact section content:', contactSection.substring(0, 200));
    
    const textToSearch = contactSection || fullText.substring(0, 2000);
    const lines = textToSearch.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    console.log('=== CONTACT INFO DEBUG ===');
    console.log('Processing lines:', lines.length);
    console.log('First 15 lines for contact extraction:');
    lines.slice(0, 15).forEach((line, index) => {
      console.log(`Line ${index}: "${line}"`);
    });

    const contact: ContactInfo = {
      firstName: '', lastName: '', city: '', state: '', zip: '', phone: '', email: '', 
      summary: '', linkedin: '', website: ''
    };

    // Extract email with multiple patterns
    for (const pattern of this.PATTERNS.email) {
      const matches = textToSearch.match(pattern);
      if (matches && matches.length > 0) {
        contact.email = matches[0].toLowerCase();
        console.log('Found email:', contact.email);
        break;
      }
    }

    // Extract phone with multiple patterns
    for (const pattern of this.PATTERNS.phone) {
      const matches = textToSearch.match(pattern);
      if (matches && matches.length > 0) {
        contact.phone = matches[0];
        console.log('Found phone:', contact.phone);
        break;
      }
    }

    // Extract LinkedIn
    for (const pattern of this.PATTERNS.linkedin) {
      const matches = textToSearch.match(pattern);
      if (matches) {
        contact.linkedin = matches[0].startsWith('http') ? matches[0] : `https://${matches[0]}`;
        console.log('Found LinkedIn:', contact.linkedin);
        break;
      }
    }

    // Extract website
    for (const pattern of this.PATTERNS.website) {
      const matches = textToSearch.match(pattern);
      if (matches) {
        const validWebsite = matches.find(url => 
          !url.includes('@') && 
          !url.toLowerCase().includes('linkedin.com') &&
          !url.toLowerCase().includes('gmail.com') &&
          !url.toLowerCase().includes('yahoo.com') &&
          !url.toLowerCase().includes('outlook.com') &&
          !url.toLowerCase().includes('hotmail.com')
        );
        if (validWebsite) {
          contact.website = validWebsite.startsWith('http') ? validWebsite : `https://${validWebsite}`;
          console.log('Found website:', contact.website);
          break;
        }
      }
    }

    // Extract name with multiple approaches
    let nameFound = false;
    
    console.log('=== NAME EXTRACTION DEBUG ===');
    
    for (let i = 0; i < Math.min(15, lines.length) && !nameFound; i++) {
      const line = lines[i];
      
      console.log(`Testing line ${i} for name: "${line}"`);
      
      // Skip lines with obvious non-name content
      if (this.shouldSkipLineForName(line)) {
        console.log(`  Skipping line ${i} (contains non-name content)`);
        continue;
      }
      
      // Enhanced name detection - check for patterns like "NADIGADDA SHIVA SAI"
      const words = line.split(/\s+/).filter(word => word.length > 0);
      console.log(`  Line ${i} words:`, words);
      
      // If first line has 2-4 words that look like names, use it
      if (i === 0 && words.length >= 2 && words.length <= 4) {
        const allWordsLookLikeNames = words.every(word => 
          /^[A-Z][A-Z]*$/i.test(word) && // All letters
          word.length >= 2 && word.length <= 15 && // Reasonable length
          !/(mobile|phone|email|linkedin|developer|engineer|manager|analyst|consultant)/i.test(word) // Not job titles
        );
        
        if (allWordsLookLikeNames) {
          contact.firstName = this.capitalizeWord(words[0]);
          contact.lastName = words.slice(1).map(word => this.capitalizeWord(word)).join(' ');
          console.log(`✓ Found name from first line: ${contact.firstName} ${contact.lastName}`);
          nameFound = true;
          break;
        }
      }
      
      // Try original patterns
      for (let j = 0; j < this.PATTERNS.name.length; j++) {
        const pattern = this.PATTERNS.name[j];
        const nameMatch = line.match(pattern);
        console.log(`  Testing pattern ${j} on line ${i}:`, nameMatch ? 'MATCH' : 'no match');
        
        if (nameMatch) {
          const fullName = nameMatch[1] || nameMatch[0];
          const parts = fullName.trim().split(/\s+/);
          
          if (parts.length >= 2 && parts.every(part => part.length > 0)) {
            contact.firstName = this.capitalizeWord(parts[0]);
            contact.lastName = parts.slice(1).map(word => this.capitalizeWord(word)).join(' ');
            console.log(`✓ Found name with pattern ${j} in line ${i}:`, contact.firstName, contact.lastName);
            nameFound = true;
            break;
          }
        }
      }
    }
    
    // Fallback: extract name from email
    if (!nameFound && contact.email) {
      const emailName = contact.email.split('@')[0];
      const emailParts = emailName.split(/[\._\-]/);
      if (emailParts.length >= 2) {
        contact.firstName = this.capitalizeWord(emailParts[0]);
        contact.lastName = this.capitalizeWord(emailParts[1]);
        console.log('Extracted name from email:', contact.firstName, contact.lastName);
        nameFound = true;
      }
    }

    // Extract location
    for (const pattern of this.PATTERNS.location) {
      const matches = textToSearch.match(pattern);
      if (matches && matches.length > 0) {
        const match = matches[0];
        const parts = match.split(',');
        if (parts.length >= 2) {
          contact.city = parts[0].trim();
          const stateZip = parts[1].trim().split(' ');
          contact.state = stateZip[0];
          if (stateZip.length > 1) {
            contact.zip = stateZip[1];
          }
          console.log('Found location:', contact.city, contact.state, contact.zip);
          break;
        }
      }
    }

    console.log('Final contact info:', contact);
    return contact;
  }

  private static shouldSkipLineForName(line: string): boolean {
    const lowerLine = line.toLowerCase();
    return line.length > 60 || 
           lowerLine.includes('resume') || 
           lowerLine.includes('cv') ||
           lowerLine.includes('curriculum') ||
           line.includes('@') ||
           /^\d/.test(line) ||
           lowerLine.includes('phone') ||
           lowerLine.includes('email') ||
           lowerLine.includes('address') ||
           lowerLine.includes('linkedin') ||
           lowerLine.includes('website') ||
           lowerLine.includes('github') ||
           /\d{3}[\s\-\.]?\d{3}[\s\-\.]?\d{4}/.test(line);
  }

  private static capitalizeWord(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  private static extractWorkExperience(fullText: string, experienceSection: string): WorkExperience[] {
    console.log('=== EXTRACTING WORK EXPERIENCE ===');
    console.log('Experience section length:', experienceSection.length);
    console.log('Full text length:', fullText.length);
    console.log('Using experienceSection:', experienceSection.length > 0 && experienceSection.length < fullText.length);
    
    const textToSearch = experienceSection || fullText;
    const lines = textToSearch.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    console.log('Processing experience lines:', lines.length);
    console.log('=== FIRST 30 LINES FOR WORK EXPERIENCE ANALYSIS ===');
    lines.slice(0, 30).forEach((line, index) => {
      console.log(`${index}: ${line}`);
    });
    
    console.log('=== LOOKING FOR JOB-RELATED KEYWORDS ===');
    const jobKeywords = /(software engineer|developer|engineer|analyst|manager|intern|consultant|architect|designer|programmer|technician)/i;
    const companyKeywords = /(company|inc|llc|corp|ltd|technologies|solutions|systems|services|group)/i;
    
    lines.slice(0, 50).forEach((line, index) => {
      if (jobKeywords.test(line)) {
        console.log(`✓ Job keyword found at line ${index}: "${line}"`);
      }
      if (companyKeywords.test(line)) {
        console.log(`✓ Company keyword found at line ${index}: "${line}"`);
      }
    });

    const experiences: WorkExperience[] = [];
    let currentExp: WorkExperience | null = null;
    let expId = 1;
    
    // Enhanced work experience extraction strategy
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip contact info and section headers
      if (this.isContactInfoLine(line) || this.isSectionHeader(line)) {
        continue;
      }
      
      // Check if this looks like a job title/company line with enhanced patterns
      if (this.looksLikeJobTitle(line) || this.looksLikeWorkEntry(line)) {
        // Save previous experience
        if (currentExp && (currentExp.jobTitle.trim() || currentExp.employer.trim())) {
          experiences.push(currentExp);
          console.log('Added experience:', currentExp.jobTitle, 'at', currentExp.employer);
        }
        
        // Parse job title and company with enhanced logic
        const { jobTitle, employer } = this.parseJobTitleLine(line);
        currentExp = {
          id: expId++,
          jobTitle: jobTitle || line,
          employer: employer || '',
          location: '',
          remote: false,
          startDate: null,
          endDate: null,
          current: false,
          accomplishments: ''
        };
        
        console.log('Found potential job entry:', line);
        console.log('Parsed as:', { jobTitle, employer });
        
        // Look ahead for dates, location, and accomplishments
        for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
          const nextLine = lines[j];
          
          // Stop if we hit another job entry or section
          if (this.looksLikeJobTitle(nextLine) || this.looksLikeWorkEntry(nextLine) || this.isSectionHeader(nextLine)) {
            break;
          }
          
          if (this.isContactInfoLine(nextLine)) {
            continue;
          }
          
          // Check for dates with enhanced patterns
          if (this.looksLikeDateRange(nextLine) || this.containsDateInfo(nextLine)) {
            const dates = this.extractDates(nextLine);
            if (dates.start) currentExp.startDate = dates.start;
            if (dates.end) currentExp.endDate = dates.end;
            if (dates.current) currentExp.current = dates.current;
            console.log('Found dates for', currentExp.jobTitle, ':', dates);
          }
          
          // Check for company if not already found
          if (!currentExp.employer && this.looksLikeCompanyName(nextLine) && nextLine.length > 2) {
            currentExp.employer = nextLine;
            console.log('Found company:', currentExp.employer);
          }
          
          // Check for location
          if (this.looksLikeLocation(nextLine)) {
            currentExp.location = nextLine;
            console.log('Found location:', currentExp.location);
          }
          
          // Collect accomplishments/descriptions with better logic
          if (this.looksLikeAccomplishment(nextLine)) {
            const accomplishment = this.formatAccomplishment(nextLine);
            currentExp.accomplishments = currentExp.accomplishments 
              ? currentExp.accomplishments + '\n' + accomplishment
              : accomplishment;
          }
        }
        
      } else if (currentExp && this.looksLikeAccomplishment(line)) {
        // Add to accomplishments for current experience
        const accomplishment = this.formatAccomplishment(line);
        currentExp.accomplishments = currentExp.accomplishments 
          ? currentExp.accomplishments + '\n' + accomplishment
          : accomplishment;
      }
    }
    
    // Don't forget the last experience
    if (currentExp && (currentExp.jobTitle.trim() || currentExp.employer.trim())) {
      experiences.push(currentExp);
      console.log('Added final experience:', currentExp.jobTitle, 'at', currentExp.employer);
    }
    
    // If no experiences found with structured approach, try pattern-based extraction
    if (experiences.length === 0) {
      console.log('No structured experiences found, trying pattern-based extraction...');
      const patternExperiences = this.extractExperienceWithPatterns(textToSearch);
      experiences.push(...patternExperiences);
    }
    
    // Enhanced fallback: if still no experiences, try to extract from any job-related content
    if (experiences.length === 0) {
      console.log('No pattern-based experiences found, trying comprehensive fallback...');
      const fallbackExperiences = this.extractExperiencesFallback(textToSearch);
      experiences.push(...fallbackExperiences);
    }
    
    console.log('Total experiences found:', experiences.length);
    console.log('=== DETAILED EXPERIENCE ANALYSIS ===');
    experiences.forEach((exp, index) => {
      console.log(`Experience ${index + 1}:`, {
        id: exp.id,
        jobTitle: exp.jobTitle,
        employer: exp.employer,
        location: exp.location,
        remote: exp.remote,
        startDate: exp.startDate,
        endDate: exp.endDate,
        current: exp.current,
        accomplishments: exp.accomplishments.substring(0, 100) + (exp.accomplishments.length > 100 ? '...' : ''),
        accomplishments_length: exp.accomplishments.length
      });
    });
    
    // Filter out completely empty experiences before returning
    const validExperiences = experiences.filter(exp => {
      const hasContent = (exp.jobTitle && exp.jobTitle.trim()) || 
                        (exp.employer && exp.employer.trim()) || 
                        (exp.location && exp.location.trim()) ||
                        (exp.accomplishments && exp.accomplishments.trim());
      console.log('Experience validation:', {
        jobTitle: exp.jobTitle,
        employer: exp.employer, 
        location: exp.location,
        accomplishments: exp.accomplishments?.substring(0, 50),
        hasContent: hasContent
      });
      return hasContent;
    });
    
    console.log('Valid experiences after filtering:', validExperiences.length);
    
    // Only return empty experience if we truly found nothing
    const result = validExperiences.length > 0 ? validExperiences : [this.createEmptyWorkExperience()];
    console.log('=== FINAL WORK EXPERIENCES RESULT ===');
    console.log('Returning', result.length, 'work experiences');
    console.log('Final experiences:', result);
    
    return result;
  }

  private static extractEducation(fullText: string, educationSection: string): Education {
    console.log('=== EXTRACTING EDUCATION ===');
    console.log('Education section length:', educationSection.length);
    console.log('Full text length for fallback:', fullText.length);
    
    const education: Education = {
      school: '', location: '', degree: '', field: '', gradYear: '', gradMonth: ''
    };
    
    const textToSearch = educationSection || fullText;
    const lines = textToSearch.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    console.log('Processing education lines:', lines.length);
    console.log('Education text preview:', textToSearch.substring(0, 500));
    console.log('🎓 First 20 lines for education analysis:');
    lines.slice(0, 20).forEach((line, index) => {
      console.log(`  ${index}: ${line}`);
    });

    // Enhanced education extraction with better patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length < 3 || this.isContactInfoLine(line)) continue;
      
      console.log(`🔍 Processing education line ${i}: "${line}"`);
      
      // Enhanced school detection
      if (!education.school && this.looksLikeSchool(line)) {
        // Clean up school name
        let schoolName = line.replace(/^\W+|\W+$/g, '').trim();
        
        // Handle cases like "Bachelor of Science, University of XYZ"
        const universityMatch = schoolName.match(/(.*(?:University|College|Institute|School|Academy).*?)(?:\s*,|\s*$)/i);
        if (universityMatch) {
          schoolName = universityMatch[1].trim();
        }
        
        education.school = schoolName;
        console.log('✅ Found school:', education.school);
        
        // Look ahead and behind for degree information
        for (let j = Math.max(0, i - 2); j < Math.min(i + 5, lines.length); j++) {
          if (j === i) continue;
          const contextLine = lines[j];
          
          if (this.looksLikeDegree(contextLine) && !education.degree) {
            education.degree = contextLine.trim();
            console.log('✅ Found degree near school:', education.degree);
            
            // Extract field from degree line
            this.extractFieldFromDegree(education, contextLine);
          }
        }
      }
      
      // Enhanced degree detection
      if (!education.degree && this.looksLikeDegree(line)) {
        education.degree = line.trim();
        console.log('✅ Found standalone degree:', education.degree);
        
        // Extract field from degree line
        this.extractFieldFromDegree(education, line);
        
        // Look for school in nearby lines
        if (!education.school) {
          for (let j = Math.max(0, i - 3); j < Math.min(i + 3, lines.length); j++) {
            if (j === i) continue;
            if (this.looksLikeSchool(lines[j])) {
              education.school = lines[j].trim();
              console.log('✅ Found school near degree:', education.school);
              break;
            }
          }
        }
      }
      
      // Enhanced graduation date detection
      if (!education.gradYear) {
        const dateResult = this.extractEducationDates(line);
        if (dateResult.year) {
          education.gradYear = dateResult.year;
          education.gradMonth = dateResult.month || '';
          console.log('✅ Found graduation date:', education.gradYear, education.gradMonth);
        }
      }
      
      // Enhanced location detection
      if (!education.location && this.looksLikeLocation(line) && !this.looksLikeSchool(line)) {
        education.location = line.trim();
        console.log('✅ Found education location:', education.location);
      }
    }
    
    // Enhanced fallback strategies with better patterns
    this.applyEducationFallbacks(education, textToSearch);
    
    console.log('🎓 Final education result:', education);
    return education;
  }

  private static extractFieldFromDegree(education: Education, degreeLine: string): void {
    if (education.field) return; // Already found
    
    const fieldPatterns = [
      /(?:in|of|for)\s+([A-Za-z\s&,]+?)(?:\s*,|\s*$|\s+from|\s+at)/i,
      /\b(?:Bachelor|Master|BS|BA|MS|MA|PhD|Doctorate)\s+(?:of\s+)?(?:Science|Arts)\s+in\s+([A-Za-z\s&,]+)/i,
      /\b([A-Za-z\s&,]+)\s+(?:Engineering|Science|Studies|Technology|Management|Administration)/i
    ];
    
    for (const pattern of fieldPatterns) {
      const match = degreeLine.match(pattern);
      if (match && match[1]) {
        education.field = match[1].trim().replace(/\s+/g, ' ');
        console.log('✅ Extracted field:', education.field);
        break;
      }
    }
  }

  private static extractEducationDates(line: string): { year: string; month: string } {
    const result = { year: '', month: '' };
    
    // Enhanced date patterns for education
    const datePatterns = [
      /\b(19|20)\d{2}\b/g,  // Year only
      /(?:graduated|grad|graduation|class\s+of|completed)\s*:?\s*(\d{4})/gi,
      /(?:may|june|july|august|september|october|november|december)\s+(\d{4})/gi,
      /(\d{4})\s*[-–]\s*(\d{4})/g,  // Range like 2018-2022
      /(?:expected|exp\.?)\s+(\d{4})/gi // Expected graduation
    ];
    
    for (const pattern of datePatterns) {
      const matches = [...line.matchAll(pattern)];
      for (const match of matches) {
        if (match[1] || match[2]) {
          // For ranges, use the end year
          result.year = match[2] || match[1];
          
          // Extract month if present
          const monthMatch = line.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/gi);
          if (monthMatch) {
            result.month = monthMatch[0];
          }
          
          console.log('📅 Found education date:', result);
          return result;
        }
      }
    }
    
    return result;
  }

  private static applyEducationFallbacks(education: Education, textToSearch: string): void {
    console.log('🔄 Applying education fallbacks...');
    
    // School fallback with enhanced patterns
    if (!education.school) {
      const institutionPatterns = [
        /\b([A-Z][a-zA-Z\s&'.-]+(?:University|College|Institute|School|Academy)(?:\s+of\s+[A-Z][a-zA-Z\s]+)?)\b/g,
        /\b(University\s+of\s+[A-Z][a-zA-Z\s&'.-]+)\b/g,
        /\b([A-Z][a-zA-Z\s&'.-]+\s+(?:State\s+)?University)\b/g,
        /\b([A-Z][a-zA-Z\s&'.-]+\s+College)\b/g,
        /\b(IIT\s+[A-Za-z]+|Indian\s+Institute\s+of\s+Technology\s+[A-Za-z]+)\b/g, // For Indian institutes
        /\b(NIT\s+[A-Za-z]+|National\s+Institute\s+of\s+Technology\s+[A-Za-z]+)\b/g
      ];
      
      for (const pattern of institutionPatterns) {
        const matches = [...textToSearch.matchAll(pattern)];
        if (matches.length > 0) {
          // Take the first match that looks reasonable
          for (const match of matches) {
            const schoolName = match[1].trim();
            if (schoolName.length > 5 && schoolName.length < 80) {
              education.school = schoolName;
              console.log('✅ Found school via fallback:', education.school);
              break;
            }
          }
          if (education.school) break;
        }
      }
    }
    
    // Degree fallback with comprehensive patterns
    if (!education.degree) {
      const degreePatterns = [
        /\b(Bachelor\s+of\s+(?:Science|Arts|Engineering|Technology|Computer\s+Science|Business\s+Administration)[^,\n]*)/gi,
        /\b(Master\s+of\s+(?:Science|Arts|Engineering|Technology|Computer\s+Science|Business\s+Administration)[^,\n]*)/gi,
        /\b((?:Doctor\s+of\s+Philosophy|PhD|Ph\.D\.?)(?:\s+in\s+[^,\n]*)?)/gi,
        /\b(B\.?(?:S|A|E|Tech|Com)\.?(?:\s+in\s+[^,\n]*)?)/gi,
        /\b(M\.?(?:S|A|E|Tech|Com|BA)\.?(?:\s+in\s+[^,\n]*)?)/gi,
        /\b(Associate\s+(?:of\s+)?(?:Arts|Science)[^,\n]*)/gi
      ];
      
      for (const pattern of degreePatterns) {
        const matches = [...textToSearch.matchAll(pattern)];
        if (matches.length > 0) {
          education.degree = matches[0][1].trim();
          console.log('✅ Found degree via fallback:', education.degree);
          
          // Try to extract field from the degree
          this.extractFieldFromDegree(education, education.degree);
          break;
        }
      }
    }
    
    // Graduation year fallback
    if (!education.gradYear) {
      const yearMatches = [...textToSearch.matchAll(/\b(20\d{2}|19\d{2})\b/g)];
      if (yearMatches.length > 0) {
        // Take the most recent reasonable year
        const years = yearMatches.map(m => parseInt(m[1])).filter(y => y >= 1980 && y <= new Date().getFullYear() + 10);
        if (years.length > 0) {
          education.gradYear = Math.max(...years).toString();
          console.log('✅ Found graduation year via fallback:', education.gradYear);
        }
      }
    }
  }

  private static extractSkills(fullText: string, skillsSection: string): string[] {
    console.log('=== EXTRACTING SKILLS ===');
    
    const skills: string[] = [];
    const textToSearch = skillsSection || fullText;
    
    console.log('Skills section length:', skillsSection.length);
    console.log('Skills text preview:', textToSearch.substring(0, 400));
    
    // Comprehensive skill patterns with priorities
    const highPrioritySkills = [
      // Programming languages (most common)
      /\b(?:JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|PHP|Go|Swift|Kotlin|Scala|Rust|HTML|CSS|SQL|R|MATLAB|Perl|Shell|Bash|PowerShell)\b/gi,
      // Popular frameworks
      /\b(?:React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|Laravel|React Native|Flutter|jQuery|Bootstrap|Tailwind CSS|Next\.js|Nuxt\.js|Svelte)\b/gi,
      // Databases
      /\b(?:MySQL|PostgreSQL|MongoDB|Redis|SQLite|Oracle|SQL Server|Cassandra|DynamoDB|Firebase|Elasticsearch|Neo4j)\b/gi,
      // Cloud platforms
      /\b(?:AWS|Azure|Google Cloud|GCP|Heroku|Vercel|Netlify|DigitalOcean)\b/gi,
      // DevOps tools
      /\b(?:Docker|Kubernetes|Jenkins|Git|GitHub|GitLab|Terraform|Ansible|Chef|Puppet|CI\/CD)\b/gi
    ];
    
    const mediumPrioritySkills = [
      // Design tools
      /\b(?:Photoshop|Illustrator|Figma|Sketch|Adobe|InDesign|After Effects|Premiere|AutoCAD|SolidWorks|Canva)\b/gi,
      // Business tools
      /\b(?:Salesforce|HubSpot|Excel|PowerPoint|Word|Slack|Trello|Asana|Jira|Confluence|Tableau|Power BI|Notion)\b/gi,
      // Testing tools
      /\b(?:Jest|Cypress|Selenium|Postman|JUnit|PyTest|Mocha|Chai)\b/gi,
      // Mobile development
      /\b(?:iOS|Android|Xamarin|Ionic|Cordova|PhoneGap)\b/gi
    ];
    
    const emergingTechSkills = [
      // AI/ML and emerging tech
      /\b(?:Machine Learning|AI|Artificial Intelligence|Deep Learning|TensorFlow|PyTorch|Blockchain|IoT|AR|VR|Computer Vision|NLP|Neural Networks)\b/gi,
      // Data science
      /\b(?:Pandas|NumPy|Scikit-learn|Jupyter|Tableau|D3\.js|Apache Spark|Hadoop)\b/gi
    ];
    
    // Extract high priority skills first
    console.log('Extracting high priority skills...');
    for (const pattern of highPrioritySkills) {
      const matches = textToSearch.match(pattern);
      if (matches) {
        matches.forEach(skill => {
          const cleanSkill = skill.trim();
          if (cleanSkill.length > 1 && !skills.some(s => s.toLowerCase() === cleanSkill.toLowerCase())) {
            skills.push(cleanSkill);
            console.log('Found high priority skill:', cleanSkill);
          }
        });
      }
    }
    
    // Extract medium priority skills
    console.log('Extracting medium priority skills...');
    for (const pattern of mediumPrioritySkills) {
      const matches = textToSearch.match(pattern);
      if (matches) {
        matches.forEach(skill => {
          const cleanSkill = skill.trim();
          if (cleanSkill.length > 1 && !skills.some(s => s.toLowerCase() === cleanSkill.toLowerCase())) {
            skills.push(cleanSkill);
            console.log('Found medium priority skill:', cleanSkill);
          }
        });
      }
    }
    
    // Extract emerging tech skills
    console.log('Extracting emerging tech skills...');
    for (const pattern of emergingTechSkills) {
      const matches = textToSearch.match(pattern);
      if (matches) {
        matches.forEach(skill => {
          const cleanSkill = skill.trim();
          if (cleanSkill.length > 1 && !skills.some(s => s.toLowerCase() === cleanSkill.toLowerCase())) {
            skills.push(cleanSkill);
            console.log('Found emerging tech skill:', cleanSkill);
          }
        });
      }
    }
    
    // Extract from formatted lists (comma/semicolon separated)
    console.log('Extracting from formatted skill lists...');
    const lines = textToSearch.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    for (const line of lines) {
      // Skip headers and long descriptions
      if (this.shouldSkipLineForSkills(line)) {
        continue;
      }
      
      console.log('Processing skills line:', line);
      
      // Handle different separation patterns
      const separators = [',', ';', '•', '·', '|', '\t'];
      let foundSeparator = false;
      
      for (const separator of separators) {
        if (line.includes(separator)) {
          const separatedSkills = line.split(separator);
          console.log(`Found ${separator} separated skills:`, separatedSkills.length);
          
          for (const skill of separatedSkills) {
            const cleanSkill = this.cleanSkillName(skill);
            if (this.isValidSkill(cleanSkill) && 
                !skills.some(s => s.toLowerCase() === cleanSkill.toLowerCase()) &&
                skills.length < 50) { // Limit to prevent noise
              skills.push(cleanSkill);
              console.log('Added separated skill:', cleanSkill);
            }
          }
          foundSeparator = true;
          break;
        }
      }
      
      // If no separator found, try to extract individual words that look like skills
      if (!foundSeparator && line.length < 100) {
        const words = line.split(/\s+/);
        if (words.length <= 8) { // Only process short lines
          for (const word of words) {
            const cleanWord = this.cleanSkillName(word);
            if (this.looksLikeTechnicalSkill(cleanWord) && 
                !skills.some(s => s.toLowerCase() === cleanWord.toLowerCase()) &&
                skills.length < 50) {
              skills.push(cleanWord);
              console.log('Added individual skill:', cleanWord);
            }
          }
        }
      }
    }
    
    // Sort skills by relevance (put programming languages first)
    const sortedSkills = this.sortSkillsByRelevance(skills);
    
    console.log('Final extracted skills count:', sortedSkills.length);
    console.log('Final skills list:', sortedSkills);
    return sortedSkills;
  }

  private static cleanSkillName(skill: string): string {
    return skill
      .replace(/[^\w\s+#.-]/g, '') // Remove special chars except +, #, ., -
      .replace(/^\W+|\W+$/g, '') // Remove leading/trailing non-word chars
      .trim();
  }

  private static looksLikeTechnicalSkill(word: string): boolean {
    if (word.length < 2 || word.length > 25) return false;
    
    // Check for common technical patterns
    const techPatterns = [
      /^[A-Z]+$/, // All caps (HTML, CSS, SQL)
      /^[A-Z][a-z]+$/, // Capitalized (React, Python)
      /^[a-z]+\.js$/, // JavaScript libraries (node.js, vue.js)
      /\+\+$/, // C++
      /^\.NET$/i, // .NET
      /#/, // C#
    ];
    
    return techPatterns.some(pattern => pattern.test(word)) ||
           word.toLowerCase().endsWith('script') ||
           word.toLowerCase().endsWith('base') ||
           word.toLowerCase().endsWith('ware');
  }

  private static sortSkillsByRelevance(skills: string[]): string[] {
    const categories = {
      programming: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Go', 'Swift'],
      frameworks: ['React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring'],
      databases: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite'],
      cloud: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes'],
      other: []
    };
    
    const sorted: string[] = [];
    
    // Add skills in order of categories
    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        const found = skills.find(skill => skill.toLowerCase().includes(keyword.toLowerCase()));
        if (found && !sorted.includes(found)) {
          sorted.push(found);
        }
      }
    }
    
    // Add remaining skills
    for (const skill of skills) {
      if (!sorted.includes(skill)) {
        sorted.push(skill);
      }
    }
    
    return sorted;
  }

  private static extractSummary(fullText: string, summarySection: string): string {
    console.log('=== EXTRACTING SUMMARY ===');
    
    const textToSearch = summarySection || fullText.substring(0, 3000); // Increase search area
    const lines = textToSearch.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    console.log('Summary section length:', summarySection.length);
    console.log('Summary text preview:', textToSearch.substring(0, 500));
    console.log('Processing summary lines:', lines.length);
    
    // Strategy 1: Look for dedicated summary section
    if (summarySection && summarySection.length > 50) {
      const summaryLines = summarySection.split('\n')
        .map(line => line.trim())
        .filter(line => 
          line.length > 30 && 
          !this.isContactInfoLine(line) && 
          !this.isSectionHeader(line)
        );
      
      if (summaryLines.length > 0) {
        const summary = summaryLines.join(' ').trim();
        console.log('Found summary from dedicated section:', summary.substring(0, 100) + '...');
        return summary;
      }
    }
    
    // Strategy 2: Look for paragraphs that sound like professional summaries
    const summaryKeywords = [
      'experienced', 'professional', 'skilled', 'expertise', 'specialist', 'expert',
      'proven track record', 'years of experience', 'background in', 'passionate about',
      'dedicated', 'results-driven', 'motivated', 'accomplished', 'seasoned'
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip obvious non-summary content
      if (this.isContactInfoLine(line) || 
          this.isSectionHeader(line) || 
          line.length < 50 ||
          line.length > 500) {
        continue;
      }
      
      console.log(`Checking line ${i} for summary keywords:`, line.substring(0, 100));
      
      // Check if line contains summary-like keywords
      const lowerLine = line.toLowerCase();
      const keywordMatches = summaryKeywords.filter(keyword => lowerLine.includes(keyword));
      
      if (keywordMatches.length >= 2 || 
          (keywordMatches.length >= 1 && line.length > 100)) {
        console.log('Found summary with keywords:', keywordMatches);
        
        // Try to expand the summary by including next lines if they seem related
        let expandedSummary = line;
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const nextLine = lines[j];
          if (nextLine.length > 30 && 
              !this.isContactInfoLine(nextLine) &&
              !this.isSectionHeader(nextLine) &&
              !this.looksLikeJobTitle(nextLine)) {
            expandedSummary += ' ' + nextLine;
          } else {
            break;
          }
        }
        
        console.log('Found expanded summary:', expandedSummary.substring(0, 200) + '...');
        return expandedSummary.trim();
      }
    }
    
    // Strategy 3: Look for objective statements
    const objectivePatterns = [
      /(?:objective|goal|seeking|looking for|aim to|pursue|desire)[\s\S]{50,300}/i,
      /(?:career objective|professional objective|employment objective)[\s\S]{30,200}/i
    ];
    
    for (const pattern of objectivePatterns) {
      const match = textToSearch.match(pattern);
      if (match) {
        const objective = match[0].replace(/^(objective|goal|seeking|looking for|aim to|pursue|desire)[:.\s-]*/i, '').trim();
        if (objective.length > 30) {
          console.log('Found objective statement:', objective.substring(0, 100) + '...');
          return objective;
        }
      }
    }
    
    // Strategy 4: Look for the first substantial paragraph after contact info
    let contactEndIndex = 0;
    for (let i = 0; i < Math.min(15, lines.length); i++) {
      if (this.isContactInfoLine(lines[i])) {
        contactEndIndex = i + 1;
      }
    }
    
    const postContactLines = lines.slice(contactEndIndex);
    for (const line of postContactLines) {
      if (line.length > 80 && 
          line.length < 400 &&
          !this.isContactInfoLine(line) &&
          !this.isSectionHeader(line) &&
          !this.looksLikeJobTitle(line)) {
        
        // Check if it contains professional language
        const professionalWords = ['professional', 'experience', 'skills', 'expertise', 'background', 'career', 'industry'];
        const lowerLine = line.toLowerCase();
        const profWordCount = professionalWords.filter(word => lowerLine.includes(word)).length;
        
        if (profWordCount >= 2) {
          console.log('Found professional paragraph as summary:', line.substring(0, 100) + '...');
          return line;
        }
      }
    }
    
    // Strategy 5: Fallback - use first few meaningful lines
    const meaningfulLines = lines
      .filter(line => 
        line.length > 40 && 
        line.length < 300 &&
        !this.isContactInfoLine(line) && 
        !this.isSectionHeader(line) &&
        !this.looksLikeJobTitle(line)
      )
      .slice(0, 2);
    
    if (meaningfulLines.length > 0) {
      const fallbackSummary = meaningfulLines.join(' ');
      console.log('Using fallback summary:', fallbackSummary.substring(0, 100) + '...');
      return fallbackSummary;
    }
    
    console.log('No summary found');
    return '';
  }

  // Utility methods
  private static isContactInfoLine(line: string): boolean {
    const lowerLine = line.toLowerCase();
    return lowerLine.includes('phone') || 
           lowerLine.includes('email') || 
           lowerLine.includes('address') || 
           lowerLine.includes('linkedin') || 
           lowerLine.includes('website') || 
           lowerLine.includes('github') ||
           line.includes('@') ||
           /\d{3}[\s\-\.]?\d{3}[\s\-\.]?\d{4}/.test(line);
  }

  private static isSectionHeader(line: string): boolean {
    const lowerLine = line.toLowerCase();
    return lowerLine.includes('experience') || 
           lowerLine.includes('education') || 
           lowerLine.includes('skills') || 
           lowerLine.includes('summary') ||
           lowerLine.includes('objective') ||
           lowerLine.includes('profile');
  }

  private static looksLikeJobTitle(line: string): boolean {
    if (this.isContactInfoLine(line) || line.includes('@')) {
      return false;
    }
    
    const jobKeywords = /\b(manager|developer|engineer|analyst|specialist|coordinator|assistant|director|lead|senior|junior|intern|administrator|supervisor|consultant|architect|designer|programmer|technician|officer|representative|sales|marketing|finance|hr|human resources|accountant|lawyer|teacher|nurse|doctor|chef|pilot|driver|mechanic|electrician|plumber)\b/i;
    
    return (jobKeywords.test(line) && line.split(' ').length <= 10) || 
           (line.split(' ').length >= 2 && line.split(' ').length <= 8 && 
            !line.includes('University') && !line.includes('College') && !line.includes('School'));
  }

  private static looksLikeWorkEntry(line: string): boolean {
    if (this.isContactInfoLine(line) || line.includes('@') || line.length < 5) {
      return false;
    }
    
    // Enhanced patterns for work entries
    const workPatterns = [
      // Common job titles that might not have keywords
      /^[A-Z][a-zA-Z\s]+(Developer|Engineer|Manager|Analyst|Specialist|Coordinator|Assistant|Director|Lead|Consultant|Architect|Designer)$/i,
      // Title with "at" company
      /\b[A-Z][a-zA-Z\s]+\s+at\s+[A-Z][a-zA-Z\s&.,]+/i,
      // Company name patterns
      /^[A-Z][a-zA-Z\s&.,]+(Inc|LLC|Corp|Ltd|Company|Corporation|Technologies|Solutions|Systems|Services|Group)\b/i,
      // Title followed by company in brackets or parentheses
      /^[A-Z][a-zA-Z\s]+\s*[\(\[].*[\)\]]$/,
      // Lines that look like job titles (2-6 words, proper capitalization)
      /^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,5}$/,
      // Department or role patterns
      /\b(Department|Team|Division)\b/i,
      // Position levels
      /\b(Senior|Junior|Lead|Principal|Chief|Head|VP|Vice President)\b/i
    ];
    
    return workPatterns.some(pattern => pattern.test(line)) && 
           line.split(' ').length <= 12 && 
           !line.includes('University') && 
           !line.includes('College') && 
           !line.includes('School') &&
           !line.includes('Degree') &&
           !this.looksLikeDateRange(line);
  }

  private static containsDateInfo(line: string): boolean {
    const dateIndicators = [
      /\b(present|current|now)\b/i,
      /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/i,
      /\b(20\d{2}|19\d{2})\b/,
      /\d{1,2}\/\d{1,2}\/\d{2,4}/,
      /\d{4}\s*[-–]\s*\d{4}/,
      /\d{4}\s*[-–]\s*(present|current)/i
    ];
    
    return dateIndicators.some(pattern => pattern.test(line));
  }

  private static looksLikeAccomplishment(line: string): boolean {
    if (line.length < 15 || 
        this.isContactInfoLine(line) || 
        this.isSectionHeader(line) ||
        this.looksLikeDateRange(line) ||
        this.looksLikeLocation(line)) {
      return false;
    }
    
    // Lines that start with bullet points or action verbs
    return line.startsWith('•') || 
           line.startsWith('-') || 
           line.startsWith('*') ||
           line.startsWith('○') ||
           line.startsWith('▪') ||
           /^(Developed|Implemented|Managed|Led|Created|Designed|Built|Improved|Increased|Reduced|Achieved|Delivered|Collaborated|Coordinated|Executed|Optimized|Streamlined|Enhanced|Established|Maintained|Supervised|Trained|Analyzed|Researched|Resolved|Supported|Facilitated|Initiated|Oversaw|Directed|Planned|Organized|Conducted|Prepared|Presented|Authored|Published)/i.test(line);
  }

  private static formatAccomplishment(line: string): string {
    // Remove bullet points if they exist, then add consistent formatting
    const cleaned = line.replace(/^[•\-*○▪]\s*/, '').trim();
    return cleaned.length > 0 ? `• ${cleaned}` : '';
  }

  private static extractExperiencesFallback(text: string): WorkExperience[] {
    console.log('=== COMPREHENSIVE EXPERIENCE FALLBACK ===');
    const experiences: WorkExperience[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Look for any lines that might contain job information
    const jobIndicators = [
      /\b(developer|engineer|manager|analyst|designer|consultant|specialist|coordinator|assistant|director|lead|senior|junior|intern)\b/gi,
      /\b(software|web|full.?stack|front.?end|back.?end|data|product|project|marketing|sales|hr|finance)\b/gi
    ];
    
    const companyIndicators = [
      /\b(inc|llc|corp|ltd|company|corporation|technologies|solutions|systems|services|group|pvt|private|limited)\b/gi,
      /\b(tech|software|consulting|digital|media|finance|healthcare|education|retail)\b/gi
    ];
    
    let potentialExperiences: Array<{line: string, index: number, score: number}> = [];
    
    // Score each line based on job/company indicators
    lines.forEach((line, index) => {
      if (this.isContactInfoLine(line) || this.isSectionHeader(line) || line.length < 10) {
        return;
      }
      
      let score = 0;
      
      // Check for job indicators
      jobIndicators.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) score += matches.length * 2;
      });
      
      // Check for company indicators
      companyIndicators.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) score += matches.length;
      });
      
      // Bonus for proper capitalization (likely job titles)
      if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(line) && line.split(' ').length <= 5) {
        score += 1;
      }
      
      // Bonus for lines with dates nearby
      const contextLines = lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3));
      const hasDateContext = contextLines.some(contextLine => this.containsDateInfo(contextLine));
      if (hasDateContext) score += 2;
      
      if (score > 0) {
        potentialExperiences.push({ line, index, score });
      }
    });
    
    // Sort by score and take top candidates
    potentialExperiences.sort((a, b) => b.score - a.score);
    const topCandidates = potentialExperiences.slice(0, 5); // Max 5 experiences
    
    console.log('Found potential experience candidates:', topCandidates.length);
    topCandidates.forEach(candidate => {
      console.log(`  Score ${candidate.score}: "${candidate.line}"`);
    });
    
    // Convert top candidates to experiences
    topCandidates.forEach((candidate, index) => {
      const experience: WorkExperience = {
        id: index + 1,
        jobTitle: candidate.line,
        employer: '',
        location: '',
        remote: false,
        startDate: null,
        endDate: null,
        current: false,
        accomplishments: ''
      };
      
      // Try to extract more details from surrounding context
      const contextStart = Math.max(0, candidate.index - 3);
      const contextEnd = Math.min(lines.length, candidate.index + 4);
      const contextLines = lines.slice(contextStart, contextEnd);
      
      // Look for company names in context
      contextLines.forEach(contextLine => {
        if (contextLine !== candidate.line && this.looksLikeCompanyName(contextLine)) {
          if (!experience.employer) {
            experience.employer = contextLine;
          }
        }
        
        // Look for location
        if (this.looksLikeLocation(contextLine)) {
          if (!experience.location) {
            experience.location = contextLine;
          }
        }
        
        // Look for dates
        if (this.containsDateInfo(contextLine)) {
          const dates = this.extractDates(contextLine);
          if (dates.start && !experience.startDate) {
            experience.startDate = dates.start;
          }
          if (dates.end && !experience.endDate) {
            experience.endDate = dates.end;
          }
          if (dates.current) {
            experience.current = dates.current;
          }
        }
      });
      
      experiences.push(experience);
    });
    
    console.log('Created fallback experiences:', experiences.length);
    return experiences;
  }

  private static extractExperienceWithPatterns(text: string): WorkExperience[] {
    console.log('=== PATTERN-BASED EXPERIENCE EXTRACTION ===');
    const experiences: WorkExperience[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Look for patterns like "Title at Company" or "Company - Title"
    const experiencePatterns = [
      // Pattern: "Job Title at Company Name"
      /^(.+?)\s+at\s+(.+)$/i,
      // Pattern: "Company Name - Job Title"
      /^(.+?)\s*[-–]\s*(.+)$/,
      // Pattern: Company names followed by job titles
      /^([A-Z][a-zA-Z\s&.,]+(Inc|LLC|Corp|Ltd|Company|Corporation|Technologies|Solutions|Systems|Services|Group))\s*(.*)$/i
    ];
    
    let expId = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (this.isContactInfoLine(line) || this.isSectionHeader(line)) {
        continue;
      }
      
      for (const pattern of experiencePatterns) {
        const match = line.match(pattern);
        if (match && match[1] && match[2]) {
          let jobTitle = '';
          let employer = '';
          
          // Determine which part is job title vs company based on the pattern
          if (pattern.source.includes('at')) {
            // "Title at Company" format
            jobTitle = match[1].trim();
            employer = match[2].trim();
          } else if (pattern.source.includes('Inc|LLC')) {
            // Company name pattern
            employer = match[1].trim();
            jobTitle = match[3] ? match[3].trim() : '';
          } else {
            // Generic dash pattern - use heuristics
            const part1 = match[1].trim();
            const part2 = match[2].trim();
            
            if (this.looksLikeCompanyName(part1)) {
              employer = part1;
              jobTitle = part2;
            } else {
              jobTitle = part1;
              employer = part2;
            }
          }
          
          if (jobTitle.length > 0 || employer.length > 0) {
            const experience: WorkExperience = {
              id: expId++,
              jobTitle: jobTitle || 'Position',
              employer: employer || 'Company',
              location: '',
              remote: false,
              startDate: null,
              endDate: null,
              current: false,
              accomplishments: ''
            };
            
            // Look for dates and location in surrounding lines
            for (let j = Math.max(0, i - 2); j < Math.min(lines.length, i + 5); j++) {
              if (j === i) continue;
              
              const surroundingLine = lines[j];
              
              if (this.looksLikeDateRange(surroundingLine) || this.containsDateInfo(surroundingLine)) {
                const dates = this.extractDates(surroundingLine);
                if (dates.start) experience.startDate = dates.start;
                if (dates.end) experience.endDate = dates.end;
                if (dates.current) experience.current = dates.current;
              }
              
              if (this.looksLikeLocation(surroundingLine)) {
                experience.location = surroundingLine;
              }
            }
            
            experiences.push(experience);
            console.log('Pattern-extracted experience:', { jobTitle, employer });
            break;
          }
        }
      }
    }
    
    return experiences;
  }

  private static looksLikeSchool(line: string): boolean {
    return /\b(University|College|Institute|School|Academy|Seminary)\b/i.test(line);
  }

  private static looksLikeDegree(line: string): boolean {
    return /\b(Bachelor|Master|PhD|Doctorate|Associate|Certificate|Diploma|BSc|MSc|BA|MA|MBA|BEng|MEng)\b/i.test(line);
  }

  private static looksLikeCompanyName(line: string): boolean {
    return line.length > 5 && 
           !this.isContactInfoLine(line) && 
           !this.looksLikeDateRange(line) &&
           /[A-Z]/.test(line);
  }

  private static looksLikeLocation(line: string): boolean {
    return /\b[A-Z][a-z]+,\s*[A-Z]{2}\b/.test(line) || 
           /\b[A-Z][a-z]+,\s*[A-Z][a-z]+\b/.test(line);
  }

  private static looksLikeSummary(line: string): boolean {
    const lowerLine = line.toLowerCase();
    return line.length > 50 && 
           (lowerLine.includes('experienced') || 
            lowerLine.includes('professional') || 
            lowerLine.includes('skilled') || 
            lowerLine.includes('years') ||
            lowerLine.includes('specialist') ||
            lowerLine.includes('expert'));
  }

  private static shouldSkipLineForSkills(line: string): boolean {
    const lowerLine = line.toLowerCase();
    return lowerLine.includes('skills') || 
           lowerLine.includes('experience') ||
           lowerLine.includes('year') ||
           lowerLine.includes('proficient') ||
           line.length > 100 ||
           line.length < 3;
  }

  private static isValidSkill(skill: string): boolean {
    return skill.length > 1 && 
           skill.length < 30 && 
           !skill.toLowerCase().includes('skills') &&
           !skill.toLowerCase().includes('experience') &&
           !/^\d+$/.test(skill);
  }

  private static parseJobTitleLine(line: string): { jobTitle: string; employer: string } {
    // Try different separators
    const separators = [' - ', ' at ', ' | ', ' / ', ', '];
    
    for (const separator of separators) {
      if (line.includes(separator)) {
        const parts = line.split(separator);
        return { 
          jobTitle: parts[0].trim(), 
          employer: parts.slice(1).join(separator).trim() 
        };
      }
    }
    
    return { jobTitle: line.trim(), employer: '' };
  }

  private static looksLikeDateRange(line: string): boolean {
    for (const pattern of this.PATTERNS.dates) {
      if (pattern.test(line)) {
        return true;
      }
    }
    return false;
  }

  private static extractDates(line: string): { start: Date | null; end: Date | null; current: boolean } {
    console.log('🗓️ Extracting dates from line:', line);
    
    const current = /present|current|now/i.test(line);
    console.log('Current position indicator found:', current);
    
    // Enhanced date range detection
    const rangePatterns = [
      // Month YYYY - Month YYYY or Present
      /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\s*[-–—]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|Present|Current)/gi,
      // YYYY - YYYY or Present
      /(\d{4})\s*[-–—]\s*(\d{4}|Present|Current)/gi,
      // MM/YYYY - MM/YYYY
      /(\d{1,2}\/\d{4})\s*[-–—]\s*(\d{1,2}\/\d{4}|Present|Current)/gi
    ];
    
    for (const pattern of rangePatterns) {
      const matches = line.match(pattern);
      if (matches && matches.length > 0) {
        const fullMatch = matches[0];
        console.log('📅 Found date range:', fullMatch);
        
        // Split the range
        const parts = fullMatch.split(/\s*[-–—]\s*/);
        if (parts.length >= 2) {
          const startDate = this.parseDate(parts[0].trim());
          const endDate = parts[1].match(/present|current/i) ? null : this.parseDate(parts[1].trim());
          
          console.log('Parsed dates:', { start: startDate, end: endDate, current });
          return { start: startDate, end: endDate, current };
        }
      }
    }
    
    // Fallback: look for individual dates
    const allDates: Date[] = [];
    for (const pattern of this.PATTERNS.dates) {
      const matches = line.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const date = this.parseDate(match);
          if (date) allDates.push(date);
        });
      }
    }
    
    if (allDates.length > 0) {
      // Sort dates and use first as start, last as end
      allDates.sort((a, b) => a.getTime() - b.getTime());
      const start = allDates[0];
      const end = allDates.length > 1 ? allDates[allDates.length - 1] : null;
      
      console.log('Fallback date extraction:', { start, end, current });
      return { start, end, current };
    }
    
    console.log('No dates found in line');
    return { start: null, end: null, current };
  }

  private static parseDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.trim().length === 0) return null;
    
    const cleanStr = dateStr.trim();
    console.log('🔍 Parsing date string:', cleanStr);
    
    try {
      // Year only (YYYY)
      if (/^\d{4}$/.test(cleanStr)) {
        const year = parseInt(cleanStr);
        // Validate year range
        if (year < 1950 || year > new Date().getFullYear() + 10) {
          console.warn('Year out of reasonable range:', year);
          return null;
        }
        const date = new Date(year, 0, 1); // January 1st of that year
        console.log('✅ Parsed year-only date:', date);
        return date;
      }
      
      // Month Year (Jan 2020, January 2020, etc.)
      const monthYearMatch = cleanStr.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)[a-z]*\.?\s+(\d{4})$/i);
      if (monthYearMatch) {
        const monthStr = monthYearMatch[1];
        const year = parseInt(monthYearMatch[2]);
        
        const monthMap: Record<string, number> = {
          'jan': 0, 'january': 0,
          'feb': 1, 'february': 1,
          'mar': 2, 'march': 2,
          'apr': 3, 'april': 3,
          'may': 4,
          'jun': 5, 'june': 5,
          'jul': 6, 'july': 6,
          'aug': 7, 'august': 7,
          'sep': 8, 'september': 8,
          'oct': 9, 'october': 9,
          'nov': 10, 'november': 10,
          'dec': 11, 'december': 11
        };
        
        const month = monthMap[monthStr.toLowerCase().substring(0, 3)];
        if (month !== undefined) {
          const date = new Date(year, month, 1);
          console.log('✅ Parsed month-year date:', date);
          return date;
        }
      }
      
      // MM/YYYY or MM-YYYY
      const mmYyyyMatch = cleanStr.match(/^(\d{1,2})[\/\-](\d{4})$/);
      if (mmYyyyMatch) {
        const month = parseInt(mmYyyyMatch[1]) - 1; // JavaScript months are 0-indexed
        const year = parseInt(mmYyyyMatch[2]);
        const date = new Date(year, month, 1);
        console.log('✅ Parsed MM/YYYY date:', date);
        return date;
      }
      
      // YYYY/MM or YYYY-MM
      const yyyyMmMatch = cleanStr.match(/^(\d{4})[\/\-](\d{1,2})$/);
      if (yyyyMmMatch) {
        const year = parseInt(yyyyMmMatch[1]);
        const month = parseInt(yyyyMmMatch[2]) - 1; // JavaScript months are 0-indexed
        const date = new Date(year, month, 1);
        console.log('✅ Parsed YYYY/MM date:', date);
        return date;
      }
      
      // Full date formats (MM/DD/YYYY, etc.)
      const fullDateMatch = cleanStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
      if (fullDateMatch) {
        const month = parseInt(fullDateMatch[1]) - 1;
        const day = parseInt(fullDateMatch[2]);
        let year = parseInt(fullDateMatch[3]);
        
        // Convert 2-digit year to 4-digit
        if (year < 100) {
          year += year < 50 ? 2000 : 1900;
        }
        
        const date = new Date(year, month, day);
        console.log('✅ Parsed full date:', date);
        return date;
      }
      
      // Fallback: try native Date parsing
      const nativeDate = new Date(cleanStr);
      if (!isNaN(nativeDate.getTime())) {
        console.log('✅ Parsed with native Date:', nativeDate);
        return nativeDate;
      }
      
      console.warn('❌ Could not parse date string:', cleanStr);
      return null;
    } catch (error) {
      console.error('❌ Error parsing date:', cleanStr, error);
      return null;
    }
  }

  private static createEmptyWorkExperience(): WorkExperience {
    return {
      id: Math.random(),
      jobTitle: '',
      employer: '',
      location: '',
      remote: false,
      startDate: null,
      endDate: null,
      current: false,
      accomplishments: ''
    };
  }

  static convertToResumeData(parsedData: ParsedResumeData): ResumeData {
    console.log('=== CONVERTING TO RESUME DATA ===');
    console.log('Input parsedData:', parsedData);
    
    const contact: ContactInfo = {
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
    };

    console.log('Converted contact:', contact);

    console.log('=== WORK EXPERIENCE CONVERSION ===');
    console.log('parsedData.workExperiences.length:', parsedData.workExperiences.length);
    console.log('parsedData.workExperiences:', parsedData.workExperiences);
    
    let workExperiences: WorkExperience[] = [];
    
    if (parsedData.workExperiences.length > 0) {
      // Filter and convert only valid experiences
      const validParsedExperiences = parsedData.workExperiences.filter(exp => {
        const hasContent = (exp.jobTitle && exp.jobTitle.trim()) || 
                          (exp.employer && exp.employer.trim()) || 
                          (exp.location && exp.location.trim()) ||
                          (exp.accomplishments && exp.accomplishments.trim());
        console.log('Parsed experience validation:', {
          jobTitle: exp.jobTitle,
          employer: exp.employer,
          hasContent: hasContent
        });
        return hasContent;
      });
      
      if (validParsedExperiences.length > 0) {
        workExperiences = validParsedExperiences.map((exp, index) => {
          console.log(`Converting experience ${index}:`, exp);
          const converted = { 
            ...this.createEmptyWorkExperience(),
            ...exp,
            id: exp.id || Math.random()
          };
          console.log(`Converted to:`, converted);
          return converted;
        });
      } else {
        console.log('No valid parsed experiences found, creating empty experience');
        workExperiences = [this.createEmptyWorkExperience()];
      }
    } else {
      console.log('No parsed experiences, creating empty experience');
      workExperiences = [this.createEmptyWorkExperience()];
    }

    console.log('=== FINAL CONVERTED WORK EXPERIENCES ===');
    console.log('workExperiences count:', workExperiences.length);
    console.log('workExperiences:', workExperiences);

    const education: Education = {
      school: parsedData.education.school || '',
      location: parsedData.education.location || '',
      degree: parsedData.education.degree || '',
      field: parsedData.education.field || '',
      gradYear: parsedData.education.gradYear || '',
      gradMonth: parsedData.education.gradMonth || '',
    };

    console.log('Converted education:', education);
    console.log('Converted skills:', parsedData.skills);
    console.log('Converted summary:', parsedData.summary);

    const result = {
      contact: contact,
      workExperiences: workExperiences,
      education: education,
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

    console.log('=== FINAL CONVERTED RESUME DATA ===');
    console.log(result);
    return result;
  }
} 