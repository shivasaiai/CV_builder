import { ParserConfiguration, FallbackOption, ValidationRule, OCRConfiguration } from './interfaces';

/**
 * Default OCR configuration optimized for resume parsing
 */
export const DefaultOCRConfiguration: OCRConfiguration = {
  engine: 'tesseract',
  language: 'eng',
  ocrEngineMode: 1, // Neural net LSTM engine
  pageSegMode: 3, // Fully automatic page segmentation
  preserveInterwordSpaces: true,
  dpi: 300
};

/**
 * Default validation rules for parsed resume data
 */
export const DefaultValidationRules: ValidationRule[] = [
  {
    name: 'contact_info_validation',
    severity: 'warning',
    validate: (data) => {
      const issues: string[] = [];
      
      if (!data.contact.firstName && !data.contact.lastName) {
        issues.push('No name found');
      }
      if (!data.contact.email) {
        issues.push('No email address found');
      }
      if (!data.contact.phone) {
        issues.push('No phone number found');
      }
      
      return {
        isValid: issues.length === 0,
        message: issues.length > 0 ? `Contact info issues: ${issues.join(', ')}` : 'Contact info valid',
        suggestions: issues.length > 0 ? [
          'Check if contact information is clearly formatted',
          'Ensure email and phone are in standard formats'
        ] : undefined
      };
    }
  },
  {
    name: 'work_experience_validation',
    severity: 'warning',
    validate: (data) => {
      if (data.workExperiences.length === 0) {
        return {
          isValid: false,
          message: 'No work experience found',
          suggestions: [
            'Check if work experience section is clearly labeled',
            'Ensure job titles and companies are properly formatted'
          ]
        };
      }
      
      const validExperiences = data.workExperiences.filter(exp => 
        exp.jobTitle && exp.jobTitle.trim() && exp.company && exp.company.trim()
      );
      
      if (validExperiences.length === 0) {
        return {
          isValid: false,
          message: 'No valid work experience entries found',
          suggestions: [
            'Ensure job titles and company names are clearly stated',
            'Check formatting of work experience section'
          ]
        };
      }
      
      return {
        isValid: true,
        message: `Found ${validExperiences.length} valid work experience entries`
      };
    }
  },
  {
    name: 'education_validation',
    severity: 'info',
    validate: (data) => {
      if (!data.education.school && !data.education.degree) {
        return {
          isValid: false,
          message: 'No education information found',
          suggestions: [
            'Check if education section is clearly labeled',
            'Ensure school names and degrees are properly formatted'
          ]
        };
      }
      
      return {
        isValid: true,
        message: 'Education information found'
      };
    }
  },
  {
    name: 'skills_validation',
    severity: 'info',
    validate: (data) => {
      if (data.skills.length === 0) {
        return {
          isValid: false,
          message: 'No skills found',
          suggestions: [
            'Check if skills section is clearly labeled',
            'Ensure skills are listed in a recognizable format'
          ]
        };
      }
      
      if (data.skills.length > 100) {
        return {
          isValid: false,
          message: 'Too many skills detected, may include noise',
          suggestions: [
            'Review extracted skills for accuracy',
            'Check if non-skill content was incorrectly identified'
          ]
        };
      }
      
      return {
        isValid: true,
        message: `Found ${data.skills.length} skills`
      };
    }
  }
];

/**
 * Create default fallback options with proper strategy references
 * This function will be called by StrategyFactory to set up fallbacks
 */
export function createDefaultFallbackOptions(): Omit<FallbackOption, 'strategy'>[] {
  return [
    {
      name: 'pdf_to_ocr_fallback',
      priority: 100,
      condition: (error: Error, file: File) => {
        return file.type.includes('pdf') && (
          error.message.includes('text') ||
          error.message.includes('extract') ||
          error.message.includes('empty') ||
          error.message.includes('image-based')
        );
      }
    },
    {
      name: 'docx_to_text_fallback',
      priority: 90,
      condition: (error: Error, file: File) => {
        return file.type.includes('word') && (
          error.message.includes('corrupt') ||
          error.message.includes('format') ||
          error.message.includes('zip')
        );
      }
    },
    {
      name: 'image_to_ocr_fallback',
      priority: 80,
      condition: (error: Error, file: File) => {
        return file.type.includes('image') || 
          file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/);
      }
    },
    {
      name: 'generic_ocr_fallback',
      priority: 70,
      condition: (error: Error, file: File) => {
        // Try OCR as last resort for any file type, but not if OCR already failed
        return !error.message.includes('OCR') && 
               !error.message.includes('tesseract') &&
               !error.message.includes('recognition');
      }
    }
  ];
}

/**
 * Default parser configuration
 */
export const DefaultParserConfiguration: ParserConfiguration = {
  strategies: [], // Will be populated by StrategyFactory
  fallbackOptions: [], // Will be populated by StrategyFactory using createDefaultFallbackOptions
  maxRetries: 3,
  timeoutMs: 60000, // 60 seconds
  enableOCR: true,
  ocrSettings: DefaultOCRConfiguration,
  validationRules: DefaultValidationRules
};

/**
 * Configuration presets for different use cases
 */
export const ConfigurationPresets = {
  /**
   * Fast parsing with minimal fallbacks
   */
  fast: {
    ...DefaultParserConfiguration,
    maxRetries: 1,
    timeoutMs: 30000,
    enableOCR: false
  } as Partial<ParserConfiguration>,

  /**
   * Comprehensive parsing with all fallbacks
   */
  comprehensive: {
    ...DefaultParserConfiguration,
    maxRetries: 5,
    timeoutMs: 120000,
    enableOCR: true
  } as Partial<ParserConfiguration>,

  /**
   * OCR-focused configuration for image-heavy documents
   */
  ocrFocused: {
    ...DefaultParserConfiguration,
    maxRetries: 2,
    timeoutMs: 90000,
    enableOCR: true,
    ocrSettings: {
      ...DefaultOCRConfiguration,
      pageSegMode: 6, // Uniform block of text
      dpi: 400
    }
  } as Partial<ParserConfiguration>,

  /**
   * Production configuration with balanced performance and reliability
   */
  production: {
    ...DefaultParserConfiguration,
    maxRetries: 3,
    timeoutMs: 60000,
    enableOCR: true
  } as Partial<ParserConfiguration>
};