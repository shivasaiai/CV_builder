/**
 * Core interfaces for the multi-strategy parsing architecture
 */

export interface ProgressCallback {
  (progress: number, total: number, status: string): void;
}

export interface ParsedResumeData {
  contact: ContactInfo;
  workExperiences: WorkExperience[];
  education: Education;
  skills: string[];
  summary: string;
  metadata: ParsingMetadata;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

export interface WorkExperience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  location?: string;
}

export interface Education {
  school: string;
  degree: string;
  gradYear: string;
  gpa?: string;
  location?: string;
}

export interface ParsingMetadata {
  sourceFile: FileMetadata;
  parsingMethod: string;
  confidence: number;
  processingTime: number;
  warnings: string[];
  errors: string[];
}

export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  lastModified: Date;
  extension: string;
}

export interface ParsingStrategy {
  readonly name: string;
  readonly priority: number;
  readonly supportedTypes: string[];
  
  canHandle(file: File): boolean;
  parse(file: File, onProgress?: ProgressCallback): Promise<string>;
  getConfidenceScore(file: File): number;
}

export interface ParsingResult {
  text: string;
  confidence: number;
  method: string;
  processingTime: number;
  warnings: string[];
  errors: string[];
}

export interface FallbackOption {
  name: string;
  strategy: ParsingStrategy;
  condition: (error: Error, file: File) => boolean;
  priority: number;
}

export interface ParserConfiguration {
  strategies: ParsingStrategy[];
  fallbackOptions: FallbackOption[];
  maxRetries: number;
  timeoutMs: number;
  enableOCR: boolean;
  ocrSettings: OCRConfiguration;
  validationRules: ValidationRule[];
}

export interface OCRConfiguration {
  engine: 'tesseract';
  language: string;
  ocrEngineMode: number;
  pageSegMode: number;
  preserveInterwordSpaces: boolean;
  whitelist?: string;
  blacklist?: string;
  dpi?: number;
}

export interface ValidationRule {
  name: string;
  validate: (data: ParsedResumeData) => ValidationResult;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  suggestions?: string[];
}

export interface ParsingError extends Error {
  code: string;
  strategy?: string;
  recoverable: boolean;
  suggestions: string[];
}