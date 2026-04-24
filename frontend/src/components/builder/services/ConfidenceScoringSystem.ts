/**
 * Confidence Scoring System
 * 
 * This service provides confidence calculation for extracted data points,
 * validation rules for data quality assessment, and uncertainty detection
 * for manual review suggestions.
 */

import { WorkExperience, Education, ContactInfo } from '../types';
import { 
  ContactExtractionResult, 
  WorkExperienceExtractionResult, 
  EducationExtractionResult, 
  SkillsExtractionResult 
} from './DataExtractionRules';
import { ClassificationResult, SectionType } from './SectionClassificationEngine';

export interface ConfidenceScore {
  overall: number;
  breakdown: {
    classification: number;
    extraction: number;
    validation: number;
    completeness: number;
  };
  details: ConfidenceDetail[];
}

export interface ConfidenceDetail {
  section: string;
  field: string;
  score: number;
  reason: string;
  suggestion?: string;
}

export interface ValidationRule {
  name: string;
  field: string;
  validator: (value: any, context?: any) => ValidationResult;
  weight: number;
  critical: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  message: string;
  suggestion?: string;
}

export interface UncertaintyDetection {
  hasUncertainty: boolean;
  uncertainFields: UncertainField[];
  recommendManualReview: boolean;
  autoPlacementSafe: boolean;
}

export interface UncertainField {
  section: string;
  field: string;
  confidence: number;
  reason: string;
  alternatives?: string[];
  suggestion: string;
}

export interface PlacementDecision {
  shouldAutoPlace: boolean;
  requiresReview: boolean;
  confidence: number;
  reasoning: string;
  alternatives?: PlacementAlternative[];
}

export interface PlacementAlternative {
  section: string;
  field: string;
  confidence: number;
  reason: string;
}

export class ConfidenceScoringSystem {
  
  // Confidence thresholds for different actions
  private static readonly THRESHOLDS = {
    AUTO_PLACEMENT: 0.8,      // Above this: auto-place without review
    MANUAL_REVIEW: 0.5,       // Below this: require manual review
    ACCEPTABLE_QUALITY: 0.6,  // Minimum acceptable data quality
    HIGH_CONFIDENCE: 0.85,    // High confidence threshold
    LOW_CONFIDENCE: 0.3       // Low confidence threshold
  };

  // Validation rules for different data types
  private static readonly VALIDATION_RULES: Record<string, ValidationRule[]> = {
    contact: [
      {
        name: 'email_format',
        field: 'email',
        validator: (email: string) => {
          const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
          return {
            isValid,
            confidence: isValid ? 1.0 : 0.0,
            message: isValid ? 'Valid email format' : 'Invalid email format',
            suggestion: isValid ? undefined : 'Check email format (example@domain.com)'
          };
        },
        weight: 0.3,
        critical: true
      },
      {
        name: 'phone_format',
        field: 'phone',
        validator: (phone: string) => {
          const cleaned = phone.replace(/\D/g, '');
          const isValid = cleaned.length >= 10 && cleaned.length <= 15;
          return {
            isValid,
            confidence: isValid ? 1.0 : 0.5,
            message: isValid ? 'Valid phone format' : 'Questionable phone format',
            suggestion: isValid ? undefined : 'Verify phone number format'
          };
        },
        weight: 0.2,
        critical: false
      },
      {
        name: 'name_completeness',
        field: 'name',
        validator: (contact: ContactInfo) => {
          const hasFirstName = contact.firstName && contact.firstName.length > 1;
          const hasLastName = contact.lastName && contact.lastName.length > 1;
          const isValid = hasFirstName && hasLastName;
          return {
            isValid,
            confidence: isValid ? 1.0 : (hasFirstName || hasLastName ? 0.6 : 0.0),
            message: isValid ? 'Complete name found' : 'Incomplete name information',
            suggestion: isValid ? undefined : 'Verify first and last name are correct'
          };
        },
        weight: 0.25,
        critical: true
      },
      {
        name: 'location_completeness',
        field: 'location',
        validator: (contact: ContactInfo) => {
          const hasCity = contact.city && contact.city.length > 1;
          const hasState = contact.state && contact.state.length > 1;
          const isValid = hasCity && hasState;
          return {
            isValid,
            confidence: isValid ? 1.0 : (hasCity || hasState ? 0.5 : 0.0),
            message: isValid ? 'Complete location found' : 'Incomplete location information',
            suggestion: isValid ? undefined : 'Add city and state information'
          };
        },
        weight: 0.15,
        critical: false
      }
    ],

    experience: [
      {
        name: 'job_title_quality',
        field: 'jobTitle',
        validator: (experience: WorkExperience) => {
          const title = experience.jobTitle;
          const hasTitle = title && title.length > 2;
          const isReasonableLength = title && title.length < 100;
          const hasCommonWords = title && /engineer|developer|manager|analyst|specialist|director|coordinator|assistant|lead|senior|junior/i.test(title);
          
          let confidence = 0;
          if (hasTitle) confidence += 0.4;
          if (isReasonableLength) confidence += 0.3;
          if (hasCommonWords) confidence += 0.3;
          
          return {
            isValid: hasTitle && isReasonableLength,
            confidence,
            message: hasTitle ? 'Job title found' : 'No job title found',
            suggestion: hasTitle ? undefined : 'Add or verify job title'
          };
        },
        weight: 0.3,
        critical: true
      },
      {
        name: 'employer_quality',
        field: 'employer',
        validator: (experience: WorkExperience) => {
          const employer = experience.employer;
          const hasEmployer = employer && employer.length > 1;
          const isReasonableLength = employer && employer.length < 100;
          
          return {
            isValid: hasEmployer && isReasonableLength,
            confidence: hasEmployer ? (isReasonableLength ? 1.0 : 0.7) : 0.0,
            message: hasEmployer ? 'Employer found' : 'No employer found',
            suggestion: hasEmployer ? undefined : 'Add or verify employer name'
          };
        },
        weight: 0.25,
        critical: true
      },
      {
        name: 'date_validity',
        field: 'dates',
        validator: (experience: WorkExperience) => {
          const hasStartDate = experience.startDate !== null;
          const hasEndDate = experience.endDate !== null || experience.current;
          const datesLogical = !experience.startDate || !experience.endDate || 
                              experience.startDate <= experience.endDate;
          
          let confidence = 0;
          if (hasStartDate) confidence += 0.5;
          if (hasEndDate) confidence += 0.3;
          if (datesLogical) confidence += 0.2;
          
          return {
            isValid: hasStartDate && datesLogical,
            confidence,
            message: hasStartDate ? 'Employment dates found' : 'No employment dates found',
            suggestion: hasStartDate ? undefined : 'Add start and end dates'
          };
        },
        weight: 0.2,
        critical: false
      },
      {
        name: 'accomplishments_quality',
        field: 'accomplishments',
        validator: (experience: WorkExperience) => {
          const accomplishments = experience.accomplishments;
          const hasAccomplishments = accomplishments && accomplishments.length > 10;
          const isSubstantial = accomplishments && accomplishments.length > 50;
          const hasBulletPoints = accomplishments && /[-•*]/.test(accomplishments);
          
          let confidence = 0;
          if (hasAccomplishments) confidence += 0.4;
          if (isSubstantial) confidence += 0.3;
          if (hasBulletPoints) confidence += 0.3;
          
          return {
            isValid: hasAccomplishments,
            confidence,
            message: hasAccomplishments ? 'Job accomplishments found' : 'No job accomplishments found',
            suggestion: hasAccomplishments ? undefined : 'Add job responsibilities and accomplishments'
          };
        },
        weight: 0.25,
        critical: false
      }
    ],

    education: [
      {
        name: 'degree_validity',
        field: 'degree',
        validator: (education: Education) => {
          const degree = education.degree;
          const hasDegree = degree && degree.length > 2;
          const isRecognizedDegree = degree && /bachelor|master|phd|doctorate|associate|diploma|certificate/i.test(degree);
          
          return {
            isValid: hasDegree,
            confidence: hasDegree ? (isRecognizedDegree ? 1.0 : 0.7) : 0.0,
            message: hasDegree ? 'Degree information found' : 'No degree information found',
            suggestion: hasDegree ? undefined : 'Add degree type and field of study'
          };
        },
        weight: 0.4,
        critical: true
      },
      {
        name: 'institution_validity',
        field: 'school',
        validator: (education: Education) => {
          const school = education.school;
          const hasSchool = school && school.length > 2;
          const isReasonableLength = school && school.length < 100;
          const hasInstitutionWords = school && /university|college|institute|school/i.test(school);
          
          let confidence = 0;
          if (hasSchool) confidence += 0.5;
          if (isReasonableLength) confidence += 0.2;
          if (hasInstitutionWords) confidence += 0.3;
          
          return {
            isValid: hasSchool && isReasonableLength,
            confidence,
            message: hasSchool ? 'Educational institution found' : 'No educational institution found',
            suggestion: hasSchool ? undefined : 'Add school or university name'
          };
        },
        weight: 0.35,
        critical: true
      },
      {
        name: 'graduation_year_validity',
        field: 'gradYear',
        validator: (education: Education) => {
          const year = education.gradYear;
          const hasYear = year && year.length === 4;
          const isReasonableYear = hasYear && parseInt(year) >= 1950 && parseInt(year) <= new Date().getFullYear() + 10;
          
          return {
            isValid: hasYear && isReasonableYear,
            confidence: hasYear ? (isReasonableYear ? 1.0 : 0.3) : 0.0,
            message: hasYear ? 'Graduation year found' : 'No graduation year found',
            suggestion: hasYear ? undefined : 'Add graduation year'
          };
        },
        weight: 0.25,
        critical: false
      }
    ],

    skills: [
      {
        name: 'skills_quantity',
        field: 'skills',
        validator: (skills: string[]) => {
          const count = skills.length;
          const hasSkills = count > 0;
          const hasReasonableCount = count >= 3 && count <= 50;
          
          let confidence = 0;
          if (hasSkills) confidence += 0.3;
          if (hasReasonableCount) confidence += 0.4;
          if (count >= 5) confidence += 0.3;
          
          return {
            isValid: hasSkills,
            confidence,
            message: hasSkills ? `${count} skills found` : 'No skills found',
            suggestion: hasSkills ? undefined : 'Add relevant technical and soft skills'
          };
        },
        weight: 0.4,
        critical: true
      },
      {
        name: 'skills_quality',
        field: 'skills',
        validator: (skills: string[]) => {
          const technicalSkills = skills.filter(skill => 
            /javascript|python|java|react|angular|vue|node|sql|aws|azure|docker|git/i.test(skill)
          );
          const hasTechnicalSkills = technicalSkills.length > 0;
          const hasVariety = new Set(skills.map(s => s.toLowerCase())).size === skills.length;
          
          let confidence = 0;
          if (hasTechnicalSkills) confidence += 0.5;
          if (hasVariety) confidence += 0.3;
          if (skills.every(skill => skill.length > 1 && skill.length < 30)) confidence += 0.2;
          
          return {
            isValid: skills.length > 0,
            confidence,
            message: hasTechnicalSkills ? 'Technical skills found' : 'General skills found',
            suggestion: hasTechnicalSkills ? undefined : 'Consider adding technical skills'
          };
        },
        weight: 0.6,
        critical: false
      }
    ]
  };

  /**
   * Calculates comprehensive confidence score for all extracted data
   */
  public static calculateOverallConfidence(
    classificationResult: ClassificationResult,
    extractionResults: {
      contact?: ContactExtractionResult;
      experience?: WorkExperienceExtractionResult;
      education?: EducationExtractionResult;
      skills?: SkillsExtractionResult;
    }
  ): ConfidenceScore {
    console.log('📊 === CONFIDENCE SCORING START ===');
    
    const details: ConfidenceDetail[] = [];
    
    // Classification confidence (25% weight)
    const classificationScore = classificationResult.confidence;
    details.push({
      section: 'classification',
      field: 'section_identification',
      score: classificationScore,
      reason: `Identified ${Object.keys(classificationResult.sections).length} sections`,
      suggestion: classificationScore < 0.7 ? 'Some sections may need manual verification' : undefined
    });
    
    // Extraction confidence (35% weight)
    let extractionScore = 0;
    let extractionCount = 0;
    
    Object.entries(extractionResults).forEach(([section, result]) => {
      if (result) {
        extractionScore += result.confidence;
        extractionCount++;
        details.push({
          section,
          field: 'data_extraction',
          score: result.confidence,
          reason: `Extracted ${section} data`,
          suggestion: result.confidence < 0.6 ? `Review ${section} data for accuracy` : undefined
        });
      }
    });
    
    extractionScore = extractionCount > 0 ? extractionScore / extractionCount : 0;
    
    // Validation confidence (25% weight)
    const validationScore = this.calculateValidationScore(extractionResults, details);
    
    // Completeness confidence (15% weight)
    const completenessScore = this.calculateCompletenessScore(extractionResults, details);
    
    // Calculate weighted overall score
    const overall = (
      classificationScore * 0.25 +
      extractionScore * 0.35 +
      validationScore * 0.25 +
      completenessScore * 0.15
    );
    
    const confidenceScore: ConfidenceScore = {
      overall,
      breakdown: {
        classification: classificationScore,
        extraction: extractionScore,
        validation: validationScore,
        completeness: completenessScore
      },
      details
    };
    
    console.log('📊 Confidence scoring complete:', {
      overall: Math.round(overall * 100) + '%',
      classification: Math.round(classificationScore * 100) + '%',
      extraction: Math.round(extractionScore * 100) + '%',
      validation: Math.round(validationScore * 100) + '%',
      completeness: Math.round(completenessScore * 100) + '%'
    });
    
    return confidenceScore;
  }

  /**
   * Detects uncertainty in extracted data and recommends manual review
   */
  public static detectUncertainty(
    confidenceScore: ConfidenceScore,
    extractionResults: {
      contact?: ContactExtractionResult;
      experience?: WorkExperienceExtractionResult;
      education?: EducationExtractionResult;
      skills?: SkillsExtractionResult;
    }
  ): UncertaintyDetection {
    console.log('🔍 === UNCERTAINTY DETECTION START ===');
    
    const uncertainFields: UncertainField[] = [];
    
    // Check each section for uncertainty
    Object.entries(extractionResults).forEach(([section, result]) => {
      if (result && result.confidence < this.THRESHOLDS.MANUAL_REVIEW) {
        uncertainFields.push({
          section,
          field: 'overall',
          confidence: result.confidence,
          reason: `Low confidence in ${section} extraction`,
          suggestion: `Review and verify ${section} information`
        });
      }
      
      // Add warnings as uncertain fields
      if (result && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          uncertainFields.push({
            section,
            field: 'warning',
            confidence: result.confidence,
            reason: warning,
            suggestion: `Address: ${warning}`
          });
        });
      }
    });
    
    // Check confidence details for low scores
    confidenceScore.details.forEach(detail => {
      if (detail.score < this.THRESHOLDS.MANUAL_REVIEW) {
        uncertainFields.push({
          section: detail.section,
          field: detail.field,
          confidence: detail.score,
          reason: detail.reason,
          suggestion: detail.suggestion || `Review ${detail.field} in ${detail.section}`
        });
      }
    });
    
    const hasUncertainty = uncertainFields.length > 0;
    const recommendManualReview = confidenceScore.overall < this.THRESHOLDS.MANUAL_REVIEW || 
                                 uncertainFields.length > 3;
    const autoPlacementSafe = confidenceScore.overall >= this.THRESHOLDS.AUTO_PLACEMENT && 
                             uncertainFields.length === 0;
    
    console.log('🔍 Uncertainty detection complete:', {
      hasUncertainty,
      uncertainFields: uncertainFields.length,
      recommendManualReview,
      autoPlacementSafe
    });
    
    return {
      hasUncertainty,
      uncertainFields,
      recommendManualReview,
      autoPlacementSafe
    };
  }

  /**
   * Makes placement decision based on confidence scores
   */
  public static makePlacementDecision(
    confidenceScore: ConfidenceScore,
    uncertaintyDetection: UncertaintyDetection
  ): PlacementDecision {
    console.log('🎯 === PLACEMENT DECISION START ===');
    
    const confidence = confidenceScore.overall;
    let shouldAutoPlace = false;
    let requiresReview = false;
    let reasoning = '';
    const alternatives: PlacementAlternative[] = [];
    
    if (confidence >= this.THRESHOLDS.AUTO_PLACEMENT && !uncertaintyDetection.hasUncertainty) {
      shouldAutoPlace = true;
      requiresReview = false;
      reasoning = 'High confidence in all extracted data - safe for automatic placement';
    } else if (confidence >= this.THRESHOLDS.ACCEPTABLE_QUALITY && uncertaintyDetection.uncertainFields.length <= 2) {
      shouldAutoPlace = true;
      requiresReview = true;
      reasoning = 'Good confidence with minor uncertainties - auto-place with review recommended';
    } else if (confidence >= this.THRESHOLDS.MANUAL_REVIEW) {
      shouldAutoPlace = false;
      requiresReview = true;
      reasoning = 'Moderate confidence - manual review required before placement';
    } else {
      shouldAutoPlace = false;
      requiresReview = true;
      reasoning = 'Low confidence - extensive manual review and correction required';
      
      // Suggest alternatives for low confidence sections
      uncertaintyDetection.uncertainFields.forEach(field => {
        if (field.confidence < this.THRESHOLDS.LOW_CONFIDENCE) {
          alternatives.push({
            section: field.section,
            field: field.field,
            confidence: field.confidence,
            reason: `Consider manual entry for ${field.field}`
          });
        }
      });
    }
    
    const decision: PlacementDecision = {
      shouldAutoPlace,
      requiresReview,
      confidence,
      reasoning,
      alternatives: alternatives.length > 0 ? alternatives : undefined
    };
    
    console.log('🎯 Placement decision complete:', {
      shouldAutoPlace,
      requiresReview,
      confidence: Math.round(confidence * 100) + '%',
      reasoning
    });
    
    return decision;
  }

  /**
   * Validates extracted data using predefined rules
   */
  public static validateExtractedData(
    extractionResults: {
      contact?: ContactExtractionResult;
      experience?: WorkExperienceExtractionResult;
      education?: EducationExtractionResult;
      skills?: SkillsExtractionResult;
    }
  ): { isValid: boolean; validationScore: number; issues: ValidationResult[] } {
    console.log('✅ === DATA VALIDATION START ===');
    
    const issues: ValidationResult[] = [];
    let totalWeight = 0;
    let validWeight = 0;
    
    // Validate each section
    Object.entries(extractionResults).forEach(([section, result]) => {
      if (result && this.VALIDATION_RULES[section]) {
        const rules = this.VALIDATION_RULES[section];
        
        rules.forEach(rule => {
          totalWeight += rule.weight;
          
          let validationResult: ValidationResult;
          
          if (section === 'contact' && result.data) {
            validationResult = rule.validator(result.data, result);
          } else if (section === 'experience' && result.data && Array.isArray(result.data)) {
            // Validate first experience entry as representative
            const firstExp = result.data[0];
            if (firstExp) {
              validationResult = rule.validator(firstExp, result);
            } else {
              validationResult = {
                isValid: false,
                confidence: 0,
                message: 'No experience data to validate'
              };
            }
          } else if (section === 'education' && result.data) {
            validationResult = rule.validator(result.data, result);
          } else if (section === 'skills' && result.data) {
            validationResult = rule.validator(result.data, result);
          } else {
            validationResult = {
              isValid: false,
              confidence: 0,
              message: 'No data to validate'
            };
          }
          
          if (validationResult.isValid) {
            validWeight += rule.weight * validationResult.confidence;
          }
          
          if (!validationResult.isValid || validationResult.confidence < 0.7) {
            issues.push(validationResult);
          }
        });
      }
    });
    
    const validationScore = totalWeight > 0 ? validWeight / totalWeight : 0;
    const isValid = validationScore >= this.THRESHOLDS.ACCEPTABLE_QUALITY && 
                   issues.filter(issue => !issue.isValid).length === 0;
    
    console.log('✅ Data validation complete:', {
      isValid,
      validationScore: Math.round(validationScore * 100) + '%',
      issues: issues.length
    });
    
    return {
      isValid,
      validationScore,
      issues
    };
  }

  // Private helper methods

  private static calculateValidationScore(
    extractionResults: {
      contact?: ContactExtractionResult;
      experience?: WorkExperienceExtractionResult;
      education?: EducationExtractionResult;
      skills?: SkillsExtractionResult;
    },
    details: ConfidenceDetail[]
  ): number {
    const validation = this.validateExtractedData(extractionResults);
    
    details.push({
      section: 'validation',
      field: 'data_quality',
      score: validation.validationScore,
      reason: `${validation.issues.length} validation issues found`,
      suggestion: validation.issues.length > 0 ? 'Review and correct validation issues' : undefined
    });
    
    return validation.validationScore;
  }

  private static calculateCompletenessScore(
    extractionResults: {
      contact?: ContactExtractionResult;
      experience?: WorkExperienceExtractionResult;
      education?: EducationExtractionResult;
      skills?: SkillsExtractionResult;
    },
    details: ConfidenceDetail[]
  ): number {
    const expectedSections = ['contact', 'experience', 'education', 'skills'];
    const foundSections = Object.keys(extractionResults).filter(key => extractionResults[key as keyof typeof extractionResults]);
    
    const completenessRatio = foundSections.length / expectedSections.length;
    
    // Bonus for having substantial data in each section
    let qualityBonus = 0;
    foundSections.forEach(section => {
      const result = extractionResults[section as keyof typeof extractionResults];
      if (result && result.confidence > 0.7) {
        qualityBonus += 0.1;
      }
    });
    
    const completenessScore = Math.min(1.0, completenessRatio + qualityBonus);
    
    details.push({
      section: 'completeness',
      field: 'section_coverage',
      score: completenessScore,
      reason: `Found ${foundSections.length}/${expectedSections.length} expected sections`,
      suggestion: foundSections.length < expectedSections.length ? 'Some resume sections may be missing' : undefined
    });
    
    return completenessScore;
  }

  /**
   * Gets confidence threshold values for external use
   */
  public static getThresholds() {
    return { ...this.THRESHOLDS };
  }

  /**
   * Provides human-readable confidence interpretation
   */
  public static interpretConfidence(confidence: number): {
    level: 'high' | 'good' | 'moderate' | 'low' | 'very_low';
    description: string;
    recommendation: string;
  } {
    if (confidence >= this.THRESHOLDS.HIGH_CONFIDENCE) {
      return {
        level: 'high',
        description: 'Excellent data quality with high confidence',
        recommendation: 'Safe for automatic processing'
      };
    } else if (confidence >= this.THRESHOLDS.AUTO_PLACEMENT) {
      return {
        level: 'good',
        description: 'Good data quality with reliable extraction',
        recommendation: 'Suitable for automatic placement'
      };
    } else if (confidence >= this.THRESHOLDS.ACCEPTABLE_QUALITY) {
      return {
        level: 'moderate',
        description: 'Acceptable data quality with some uncertainties',
        recommendation: 'Review recommended before use'
      };
    } else if (confidence >= this.THRESHOLDS.LOW_CONFIDENCE) {
      return {
        level: 'low',
        description: 'Low data quality with significant uncertainties',
        recommendation: 'Manual review required'
      };
    } else {
      return {
        level: 'very_low',
        description: 'Very low data quality with major extraction issues',
        recommendation: 'Extensive manual correction needed'
      };
    }
  }
}