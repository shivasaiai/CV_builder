/**
 * PDF Progress Tracking System
 * Provides detailed progress tracking for PDF processing operations
 */

export interface PDFProcessingProgress {
  currentPage: number;
  totalPages: number;
  currentPhase: PDFProcessingPhase;
  phaseProgress: number; // 0-100 within current phase
  overallProgress: number; // 0-100 overall
  estimatedTimeRemaining: number; // milliseconds
  processingRate: number; // pages per second
  status: string;
  warnings: string[];
}

export enum PDFProcessingPhase {
  INITIALIZATION = 'initialization',
  ANALYSIS = 'analysis',
  TEXT_EXTRACTION = 'text_extraction',
  OCR_PROCESSING = 'ocr_processing',
  POST_PROCESSING = 'post_processing',
  VALIDATION = 'validation',
  COMPLETE = 'complete'
}

export interface PhaseDefinition {
  phase: PDFProcessingPhase;
  name: string;
  description: string;
  estimatedDuration: number; // relative weight
  isPageBased: boolean; // whether progress is tracked per page
}

/**
 * Comprehensive PDF processing progress tracker
 */
export class PDFProgressTracker {
  private startTime: number;
  private currentPhase: PDFProcessingPhase;
  private totalPages: number;
  private currentPage: number;
  private phaseStartTime: number;
  private pagesProcessed: number;
  private warnings: string[];
  private phaseDefinitions: PhaseDefinition[];
  private onProgressCallback?: (progress: PDFProcessingProgress) => void;

  constructor(totalPages: number, onProgress?: (progress: PDFProcessingProgress) => void) {
    this.startTime = performance.now();
    this.currentPhase = PDFProcessingPhase.INITIALIZATION;
    this.totalPages = totalPages;
    this.currentPage = 0;
    this.phaseStartTime = this.startTime;
    this.pagesProcessed = 0;
    this.warnings = [];
    this.onProgressCallback = onProgress;
    
    this.phaseDefinitions = [
      {
        phase: PDFProcessingPhase.INITIALIZATION,
        name: 'Initialization',
        description: 'Loading and preparing PDF document',
        estimatedDuration: 1,
        isPageBased: false
      },
      {
        phase: PDFProcessingPhase.ANALYSIS,
        name: 'Analysis',
        description: 'Analyzing document structure and content',
        estimatedDuration: 2,
        isPageBased: true
      },
      {
        phase: PDFProcessingPhase.TEXT_EXTRACTION,
        name: 'Text Extraction',
        description: 'Extracting text from PDF pages',
        estimatedDuration: 5,
        isPageBased: true
      },
      {
        phase: PDFProcessingPhase.OCR_PROCESSING,
        name: 'OCR Processing',
        description: 'Performing optical character recognition',
        estimatedDuration: 10,
        isPageBased: true
      },
      {
        phase: PDFProcessingPhase.POST_PROCESSING,
        name: 'Post-processing',
        description: 'Cleaning and formatting extracted text',
        estimatedDuration: 1,
        isPageBased: false
      },
      {
        phase: PDFProcessingPhase.VALIDATION,
        name: 'Validation',
        description: 'Validating extracted content',
        estimatedDuration: 1,
        isPageBased: false
      }
    ];

    console.log(`📊 PDF Progress Tracker initialized for ${totalPages} pages`);
  }

  /**
   * Start a new processing phase
   */
  public startPhase(phase: PDFProcessingPhase): void {
    this.currentPhase = phase;
    this.phaseStartTime = performance.now();
    this.currentPage = 0;
    
    const phaseInfo = this.getPhaseDefinition(phase);
    console.log(`🔄 Starting phase: ${phaseInfo.name} - ${phaseInfo.description}`);
    
    this.updateProgress(0);
  }

  /**
   * Update progress within current phase
   */
  public updateProgress(phaseProgress: number, status?: string): void {
    const phaseInfo = this.getPhaseDefinition(this.currentPhase);
    
    // Calculate overall progress
    const completedPhases = this.phaseDefinitions
      .filter(p => this.getPhaseOrder(p.phase) < this.getPhaseOrder(this.currentPhase))
      .reduce((sum, p) => sum + p.estimatedDuration, 0);
    
    const totalDuration = this.phaseDefinitions
      .reduce((sum, p) => sum + p.estimatedDuration, 0);
    
    const currentPhaseContribution = (phaseProgress / 100) * phaseInfo.estimatedDuration;
    const overallProgress = Math.min(100, 
      ((completedPhases + currentPhaseContribution) / totalDuration) * 100
    );

    // Calculate processing rate and time estimates
    const elapsedTime = performance.now() - this.startTime;
    const processingRate = this.pagesProcessed > 0 ? 
      (this.pagesProcessed / (elapsedTime / 1000)) : 0;
    
    const remainingPages = Math.max(0, this.totalPages - this.pagesProcessed);
    const estimatedTimeRemaining = processingRate > 0 ? 
      (remainingPages / processingRate) * 1000 : 0;

    const progress: PDFProcessingProgress = {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      currentPhase: this.currentPhase,
      phaseProgress: Math.min(100, Math.max(0, phaseProgress)),
      overallProgress: Math.min(100, Math.max(0, overallProgress)),
      estimatedTimeRemaining,
      processingRate,
      status: status || this.getDefaultStatus(),
      warnings: [...this.warnings]
    };

    // Call progress callback if provided
    if (this.onProgressCallback) {
      this.onProgressCallback(progress);
    }

    // Log progress at key milestones
    if (phaseProgress % 25 === 0 || phaseProgress === 100) {
      console.log(`📈 ${phaseInfo.name}: ${phaseProgress}% (Overall: ${overallProgress.toFixed(1)}%)`);
    }
  }

  /**
   * Update page progress (for page-based phases)
   */
  public updatePageProgress(pageNumber: number, pageProgress: number = 100): void {
    this.currentPage = pageNumber;
    
    const phaseInfo = this.getPhaseDefinition(this.currentPhase);
    if (phaseInfo.isPageBased) {
      const pagesCompleted = pageNumber - 1 + (pageProgress / 100);
      const phaseProgress = (pagesCompleted / this.totalPages) * 100;
      
      if (pageProgress === 100) {
        this.pagesProcessed = Math.max(this.pagesProcessed, pageNumber);
      }
      
      this.updateProgress(
        phaseProgress, 
        `Processing page ${pageNumber} of ${this.totalPages}`
      );
    }
  }

  /**
   * Complete current phase and move to next
   */
  public completePhase(): void {
    const phaseInfo = this.getPhaseDefinition(this.currentPhase);
    const phaseTime = performance.now() - this.phaseStartTime;
    
    console.log(`✅ Completed phase: ${phaseInfo.name} in ${Math.round(phaseTime)}ms`);
    
    this.updateProgress(100);
  }

  /**
   * Add a warning message
   */
  public addWarning(warning: string): void {
    this.warnings.push(warning);
    console.warn(`⚠️ PDF Processing Warning: ${warning}`);
  }

  /**
   * Mark processing as complete
   */
  public complete(): void {
    this.currentPhase = PDFProcessingPhase.COMPLETE;
    const totalTime = performance.now() - this.startTime;
    
    console.log(`🎉 PDF processing completed in ${Math.round(totalTime)}ms`);
    console.log(`📊 Final stats:`, {
      totalPages: this.totalPages,
      processingRate: this.pagesProcessed / (totalTime / 1000),
      warnings: this.warnings.length
    });
    
    this.updateProgress(100, 'Processing complete');
  }

  /**
   * Get current progress snapshot
   */
  public getCurrentProgress(): PDFProcessingProgress {
    const elapsedTime = performance.now() - this.startTime;
    const processingRate = this.pagesProcessed > 0 ? 
      (this.pagesProcessed / (elapsedTime / 1000)) : 0;
    
    const remainingPages = Math.max(0, this.totalPages - this.pagesProcessed);
    const estimatedTimeRemaining = processingRate > 0 ? 
      (remainingPages / processingRate) * 1000 : 0;

    return {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      currentPhase: this.currentPhase,
      phaseProgress: 0, // Would need to track this separately
      overallProgress: (this.pagesProcessed / this.totalPages) * 100,
      estimatedTimeRemaining,
      processingRate,
      status: this.getDefaultStatus(),
      warnings: [...this.warnings]
    };
  }

  /**
   * Get processing statistics
   */
  public getStatistics(): {
    totalTime: number;
    averagePageTime: number;
    processingRate: number;
    warningsCount: number;
    phaseTimes: Record<string, number>;
  } {
    const totalTime = performance.now() - this.startTime;
    const averagePageTime = this.pagesProcessed > 0 ? totalTime / this.pagesProcessed : 0;
    const processingRate = this.pagesProcessed / (totalTime / 1000);

    return {
      totalTime,
      averagePageTime,
      processingRate,
      warningsCount: this.warnings.length,
      phaseTimes: {} // Would need to track phase times separately
    };
  }

  /**
   * Get phase definition by phase enum
   */
  private getPhaseDefinition(phase: PDFProcessingPhase): PhaseDefinition {
    return this.phaseDefinitions.find(p => p.phase === phase) || this.phaseDefinitions[0];
  }

  /**
   * Get phase order for progress calculation
   */
  private getPhaseOrder(phase: PDFProcessingPhase): number {
    const order = {
      [PDFProcessingPhase.INITIALIZATION]: 0,
      [PDFProcessingPhase.ANALYSIS]: 1,
      [PDFProcessingPhase.TEXT_EXTRACTION]: 2,
      [PDFProcessingPhase.OCR_PROCESSING]: 3,
      [PDFProcessingPhase.POST_PROCESSING]: 4,
      [PDFProcessingPhase.VALIDATION]: 5,
      [PDFProcessingPhase.COMPLETE]: 6
    };
    return order[phase] || 0;
  }

  /**
   * Get default status message for current phase
   */
  private getDefaultStatus(): string {
    const phaseInfo = this.getPhaseDefinition(this.currentPhase);
    
    if (phaseInfo.isPageBased && this.currentPage > 0) {
      return `${phaseInfo.description} - Page ${this.currentPage}/${this.totalPages}`;
    } else {
      return phaseInfo.description;
    }
  }

  /**
   * Create a progress callback that updates external progress indicators
   */
  public static createProgressCallback(
    externalCallback?: (progress: number, total: number, status: string) => void
  ): (progress: PDFProcessingProgress) => void {
    return (progress: PDFProcessingProgress) => {
      if (externalCallback) {
        externalCallback(
          progress.overallProgress,
          100,
          progress.status
        );
      }
    };
  }

  /**
   * Estimate processing time based on document characteristics
   */
  public static estimateProcessingTime(
    pageCount: number,
    isImageBased: boolean,
    layoutComplexity: 'simple' | 'moderate' | 'complex'
  ): {
    estimatedSeconds: number;
    breakdown: Record<string, number>;
    factors: string[];
  } {
    let baseTimePerPage = 0.5; // seconds per page for simple text extraction
    const factors: string[] = [];

    // Adjust for image-based content
    if (isImageBased) {
      baseTimePerPage *= 8; // OCR is much slower
      factors.push('Image-based content requires OCR processing');
    }

    // Adjust for layout complexity
    switch (layoutComplexity) {
      case 'moderate':
        baseTimePerPage *= 1.5;
        factors.push('Moderate layout complexity');
        break;
      case 'complex':
        baseTimePerPage *= 2.5;
        factors.push('Complex layout requires additional processing');
        break;
    }

    // Adjust for page count (efficiency improves with more pages)
    const pageCountFactor = Math.max(0.7, 1 - (pageCount / 100));
    baseTimePerPage *= pageCountFactor;

    const estimatedSeconds = Math.ceil(pageCount * baseTimePerPage);

    const breakdown = {
      initialization: Math.ceil(estimatedSeconds * 0.05),
      analysis: Math.ceil(estimatedSeconds * 0.1),
      extraction: Math.ceil(estimatedSeconds * 0.7),
      postProcessing: Math.ceil(estimatedSeconds * 0.1),
      validation: Math.ceil(estimatedSeconds * 0.05)
    };

    return {
      estimatedSeconds,
      breakdown,
      factors
    };
  }
}