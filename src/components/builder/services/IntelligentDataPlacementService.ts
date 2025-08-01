/**
 * Intelligent Data Placement Service
 * 
 * This service integrates all the components of the intelligent data section placement system:
 * - Section Classification Engine
 * - Data Extraction Rules
 * - Confidence Scoring System
 * - Manual Override Interface coordination
 */

import { SectionClassificationEngine, ClassificationResult, SectionType } from './SectionClassificationEngine';
import { 
  DataExtractionRules, 
  ContactExtractionResult, 
  WorkExperienceExtractionResult, 
  EducationExtractionResult, 
  SkillsExtractionResult 
} from './DataExtractionRules';
import { 
  ConfidenceScoringSystem, 
  ConfidenceScore, 
  UncertaintyDetection, 
  PlacementDecision 
} from './ConfidenceScoringSystem';
import { WorkExperience, Education, ContactInfo, ResumeData } from '../types';

export interface IntelligentPlacementResult {
  // Classification results
  classification: ClassificationResult;
  
  // Extraction results
  extraction: {
    contact?: ContactExtractionResult;
    experience?: WorkExperienceExtractionResult;
    education?: EducationExtractionResult;
    skills?: SkillsExtractionResult;
  };
  
  // Confidence and uncertainty analysis
  confidence: ConfidenceScore;
  uncertainty: UncertaintyDetection;
  placement: PlacementDecision;
  
  // Final processed data
  processedData: Partial<ResumeData>;
  
  // Metadata
  metadata: {
    processingTime: number;
    textLength: number;
    sectionsFound: number;
    overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  };
}

export interface PlacementOptions {
  // Confidence thresholds
  autoPlacementThreshold?: number;
  manualReviewThreshold?: number;
  
  // Processing options
  enableOCRFallback?: boolean;
  strictValidation?: boolean;
  preserveOriginalFormatting?: boolean;
  
  // UI options
  showManualOverride?: boolean;
  enableDragAndDrop?: boolean;
  
  // Callbacks
  onProgress?: (progress: number, status: string) => void;
  onWarning?: (warning: string) => void;
  onError?: (error: string) => void;
}

export class IntelligentDataPlacementService {
  
  private static readonly DEFAULT_OPTIONS: Required<PlacementOptions> = {
    autoPlacementThreshold: 0.8,
    manualReviewThreshold: 0.5,
    enableOCRFallback: true,
    strictValidation: false,
    preserveOriginalFormatting: true,
    showManualOverride: true,
    enableDragAndDrop: true,
    onProgress: () => {},
    onWarning: () => {},
    onError: () => {}
  };

  /**
   * Process already imported resume data for intelligent placement
   */
  public static async processImportedData(
    importedData: Partial<ResumeData>
  ): Promise<{ processedData: Partial<ResumeData>; uncertainPlacements: any[] }> {
    console.log('🚀 === PROCESSING IMPORTED DATA ===');
    console.log('📄 Imported data:', importedData);
    
    // For now, return the data as-is with no uncertain placements
    // This can be enhanced later with more sophisticated processing
    return {
      processedData: importedData,
      uncertainPlacements: []
    };
  }

  /**
   * Main entry point for intelligent data placement
   */
  public static async processResumeText(
    text: string, 
    options: PlacementOptions = {}
  ): Promise<IntelligentPlacementResult> {
    const startTime = performance.now();
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    console.log('🚀 === INTELLIGENT DATA PLACEMENT START ===');
    console.log('📄 Input text length:', text.length);
    
    try {
      opts.onProgress(10, 'Classifying resume sections...');
      
      // Step 1: Classify sections
      const classification = SectionClassificationEngine.classifySections(text);
      console.log('✅ Section classification complete:', {
        sectionsFound: Object.keys(classification.sections).length,
        confidence: Math.round(classification.confidence * 100) + '%'
      });
      
      opts.onProgress(30, 'Extracting data from sections...');
      
      // Step 2: Extract data from classified sections
      const extraction = await this.extractDataFromSections(classification, text, opts);
      console.log('✅ Data extraction complete');
      
      opts.onProgress(60, 'Calculating confidence scores...');
      
      // Step 3: Calculate confidence scores
      const confidence = ConfidenceScoringSystem.calculateOverallConfidence(
        classification, 
        extraction
      );
      console.log('✅ Confidence scoring complete:', Math.round(confidence.overall * 100) + '%');
      
      opts.onProgress(80, 'Analyzing uncertainty and placement decisions...');
      
      // Step 4: Detect uncertainty and make placement decisions
      const uncertainty = ConfidenceScoringSystem.detectUncertainty(confidence, extraction);
      const placement = ConfidenceScoringSystem.makePlacementDecision(confidence, uncertainty);
      
      console.log('✅ Uncertainty analysis complete:', {
        hasUncertainty: uncertainty.hasUncertainty,
        recommendManualReview: uncertainty.recommendManualReview,
        shouldAutoPlace: placement.shouldAutoPlace
      });
      
      opts.onProgress(90, 'Processing final data...');
      
      // Step 5: Process final data
      const processedData = this.processExtractedData(extraction, opts);
      
      // Step 6: Generate metadata and recommendations
      const processingTime = performance.now() - startTime;
      const metadata = this.generateMetadata(
        classification, 
        extraction, 
        confidence, 
        processingTime, 
        text.length
      );
      
      opts.onProgress(100, 'Processing complete!');
      
      const result: IntelligentPlacementResult = {
        classification,
        extraction,
        confidence,
        uncertainty,
        placement,
        processedData,
        metadata
      };
      
      console.log('🎉 === INTELLIGENT DATA PLACEMENT COMPLETE ===');
      console.log('📊 Final results:', {
        processingTime: Math.round(processingTime) + 'ms',
        overallQuality: metadata.overallQuality,
        sectionsFound: metadata.sectionsFound,
        recommendations: metadata.recommendations.length
      });
      
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Intelligent data placement failed:', errorMessage);
      opts.onError(errorMessage);
      throw error;
    }
  }

  /**
   * Extracts data from classified sections
   */
  private static async extractDataFromSections(
    classification: ClassificationResult,
    fullText: string,
    options: Required<PlacementOptions>
  ): Promise<{
    contact?: ContactExtractionResult;
    experience?: WorkExperienceExtractionResult;
    education?: EducationExtractionResult;
    skills?: SkillsExtractionResult;
  }> {
    const extraction: any = {};
    
    // Extract contact information
    if (classification.sections.contact) {
      try {
        extraction.contact = DataExtractionRules.extractContactInfo(
          fullText, 
          classification.sections.contact
        );
        console.log('📞 Contact extraction:', {
          confidence: Math.round(extraction.contact.confidence * 100) + '%',
          warnings: extraction.contact.warnings.length
        });
      } catch (error) {
        console.warn('⚠️ Contact extraction failed:', error);
        options.onWarning('Failed to extract contact information');
      }
    }
    
    // Extract work experience
    if (classification.sections.experience) {
      try {
        extraction.experience = DataExtractionRules.extractWorkExperience(
          fullText, 
          classification.sections.experience
        );
        console.log('💼 Experience extraction:', {
          experiencesFound: extraction.experience.data.length,
          confidence: Math.round(extraction.experience.confidence * 100) + '%',
          warnings: extraction.experience.warnings.length
        });
      } catch (error) {
        console.warn('⚠️ Experience extraction failed:', error);
        options.onWarning('Failed to extract work experience');
      }
    }
    
    // Extract education
    if (classification.sections.education) {
      try {
        extraction.education = DataExtractionRules.extractEducation(
          fullText, 
          classification.sections.education
        );
        console.log('🎓 Education extraction:', {
          confidence: Math.round(extraction.education.confidence * 100) + '%',
          warnings: extraction.education.warnings.length
        });
      } catch (error) {
        console.warn('⚠️ Education extraction failed:', error);
        options.onWarning('Failed to extract education information');
      }
    }
    
    // Extract skills
    if (classification.sections.skills) {
      try {
        extraction.skills = DataExtractionRules.extractSkills(
          fullText, 
          classification.sections.skills
        );
        console.log('🛠️ Skills extraction:', {
          skillsFound: extraction.skills.data.length,
          confidence: Math.round(extraction.skills.confidence * 100) + '%',
          warnings: extraction.skills.warnings.length
        });
      } catch (error) {
        console.warn('⚠️ Skills extraction failed:', error);
        options.onWarning('Failed to extract skills');
      }
    }
    
    return extraction;
  }

  /**
   * Processes extracted data into final resume format
   */
  private static processExtractedData(
    extraction: {
      contact?: ContactExtractionResult;
      experience?: WorkExperienceExtractionResult;
      education?: EducationExtractionResult;
      skills?: SkillsExtractionResult;
    },
    options: Required<PlacementOptions>
  ): Partial<ResumeData> {
    const processedData: Partial<ResumeData> = {};
    
    // Process contact information
    if (extraction.contact) {
      processedData.contact = extraction.contact.data;
    }
    
    // Process work experiences
    if (extraction.experience) {
      processedData.workExperiences = extraction.experience.data;
    }
    
    // Process education
    if (extraction.education) {
      processedData.education = extraction.education.data;
    }
    
    // Process skills
    if (extraction.skills) {
      processedData.skills = extraction.skills.data;
    }
    
    // Set active sections based on what was found
    processedData.activeSections = {
      contact: !!extraction.contact,
      summary: false, // Will be handled separately
      experience: !!extraction.experience && extraction.experience.data.length > 0,
      education: !!extraction.education,
      skills: !!extraction.skills && extraction.skills.data.length > 0,
      projects: false,
      certifications: false,
      languages: false,
      volunteer: false,
      publications: false,
      awards: false,
      references: false
    };
    
    return processedData;
  }

  /**
   * Generates metadata and recommendations
   */
  private static generateMetadata(
    classification: ClassificationResult,
    extraction: any,
    confidence: ConfidenceScore,
    processingTime: number,
    textLength: number
  ): IntelligentPlacementResult['metadata'] {
    const sectionsFound = Object.keys(classification.sections).length;
    const recommendations: string[] = [];
    
    // Determine overall quality
    let overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
    if (confidence.overall >= 0.85) {
      overallQuality = 'excellent';
    } else if (confidence.overall >= 0.7) {
      overallQuality = 'good';
    } else if (confidence.overall >= 0.5) {
      overallQuality = 'fair';
    } else {
      overallQuality = 'poor';
    }
    
    // Generate recommendations based on analysis
    if (confidence.breakdown.classification < 0.7) {
      recommendations.push('Some resume sections may not have been identified correctly. Review section placement.');
    }
    
    if (confidence.breakdown.extraction < 0.6) {
      recommendations.push('Data extraction confidence is low. Verify extracted information for accuracy.');
    }
    
    if (confidence.breakdown.validation < 0.7) {
      recommendations.push('Some extracted data failed validation checks. Review and correct as needed.');
    }
    
    if (confidence.breakdown.completeness < 0.8) {
      recommendations.push('Resume appears to be missing some standard sections. Consider adding missing information.');
    }
    
    if (!extraction.contact || extraction.contact.confidence < 0.6) {
      recommendations.push('Contact information extraction had issues. Verify name, email, and phone number.');
    }
    
    if (!extraction.experience || extraction.experience.data.length === 0) {
      recommendations.push('No work experience was found. Ensure your resume includes employment history.');
    }
    
    if (!extraction.education || extraction.education.confidence < 0.6) {
      recommendations.push('Education information may be incomplete. Verify degree and institution details.');
    }
    
    if (!extraction.skills || extraction.skills.data.length < 3) {
      recommendations.push('Very few skills were detected. Consider adding more relevant technical and soft skills.');
    }
    
    if (classification.warnings.length > 0) {
      recommendations.push('Classification warnings detected. Some sections may need manual verification.');
    }
    
    // Performance recommendations
    if (processingTime > 5000) {
      recommendations.push('Processing took longer than expected. Consider using a simpler resume format.');
    }
    
    if (textLength < 500) {
      recommendations.push('Resume appears to be very short. Consider adding more detailed information.');
    }
    
    return {
      processingTime,
      textLength,
      sectionsFound,
      overallQuality,
      recommendations
    };
  }

  /**
   * Validates the placement result
   */
  public static validatePlacementResult(result: IntelligentPlacementResult): {
    isValid: boolean;
    criticalIssues: string[];
    warnings: string[];
  } {
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    
    // Check for critical issues
    if (result.confidence.overall < 0.3) {
      criticalIssues.push('Overall confidence is very low - extensive manual review required');
    }
    
    if (!result.processedData.contact) {
      criticalIssues.push('No contact information was extracted');
    }
    
    if (!result.processedData.workExperiences || result.processedData.workExperiences.length === 0) {
      warnings.push('No work experience was extracted');
    }
    
    if (!result.processedData.education) {
      warnings.push('No education information was extracted');
    }
    
    if (!result.processedData.skills || result.processedData.skills.length === 0) {
      warnings.push('No skills were extracted');
    }
    
    // Check uncertainty levels
    if (result.uncertainty.uncertainFields.length > 5) {
      warnings.push('Many fields have uncertainty - manual review recommended');
    }
    
    // Check classification quality
    if (result.classification.confidence < 0.5) {
      warnings.push('Section classification confidence is low');
    }
    
    const isValid = criticalIssues.length === 0 && result.confidence.overall > 0.3;
    
    return {
      isValid,
      criticalIssues,
      warnings
    };
  }

  /**
   * Gets human-readable summary of the placement result
   */
  public static getPlacementSummary(result: IntelligentPlacementResult): {
    title: string;
    description: string;
    status: 'success' | 'warning' | 'error';
    details: string[];
  } {
    const confidence = Math.round(result.confidence.overall * 100);
    const sectionsFound = result.metadata.sectionsFound;
    const hasUncertainty = result.uncertainty.hasUncertainty;
    
    let title: string;
    let description: string;
    let status: 'success' | 'warning' | 'error';
    
    if (result.metadata.overallQuality === 'excellent') {
      title = 'Excellent Results';
      description = `Resume processed successfully with ${confidence}% confidence. ${sectionsFound} sections identified.`;
      status = 'success';
    } else if (result.metadata.overallQuality === 'good') {
      title = 'Good Results';
      description = `Resume processed with ${confidence}% confidence. ${sectionsFound} sections identified with minor issues.`;
      status = hasUncertainty ? 'warning' : 'success';
    } else if (result.metadata.overallQuality === 'fair') {
      title = 'Fair Results';
      description = `Resume processed with ${confidence}% confidence. Some manual review recommended.`;
      status = 'warning';
    } else {
      title = 'Poor Results';
      description = `Resume processing had significant issues (${confidence}% confidence). Manual review required.`;
      status = 'error';
    }
    
    const details: string[] = [
      `Processing time: ${Math.round(result.metadata.processingTime)}ms`,
      `Sections found: ${sectionsFound}`,
      `Uncertain fields: ${result.uncertainty.uncertainFields.length}`,
      `Recommendations: ${result.metadata.recommendations.length}`
    ];
    
    return {
      title,
      description,
      status,
      details
    };
  }

  /**
   * Exports placement result for debugging or analysis
   */
  public static exportPlacementResult(result: IntelligentPlacementResult): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      confidence: result.confidence,
      uncertainty: result.uncertainty,
      placement: result.placement,
      metadata: result.metadata,
      sectionsFound: Object.keys(result.classification.sections),
      extractionSummary: {
        contact: result.extraction.contact ? {
          confidence: result.extraction.contact.confidence,
          warnings: result.extraction.contact.warnings.length
        } : null,
        experience: result.extraction.experience ? {
          count: result.extraction.experience.data.length,
          confidence: result.extraction.experience.confidence,
          warnings: result.extraction.experience.warnings.length
        } : null,
        education: result.extraction.education ? {
          confidence: result.extraction.education.confidence,
          warnings: result.extraction.education.warnings.length
        } : null,
        skills: result.extraction.skills ? {
          count: result.extraction.skills.data.length,
          confidence: result.extraction.skills.confidence,
          warnings: result.extraction.skills.warnings.length
        } : null
      }
    }, null, 2);
  }
}