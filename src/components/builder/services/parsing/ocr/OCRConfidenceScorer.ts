/**
 * OCR Confidence Scoring System
 * Provides advanced confidence scoring for OCR results
 */

export interface ConfidenceFactors {
  tesseractConfidence: number;
  textLength: number;
  structuredContentScore: number;
  formatConsistencyScore: number;
  languageModelScore: number;
  overallScore: number;
}

export interface ConfidenceAnalysis {
  confidence: number;
  factors: ConfidenceFactors;
  recommendations: string[];
  reliability: 'high' | 'medium' | 'low';
}

/**
 * Advanced confidence scoring for OCR results
 */
export class OCRConfidenceScorer {
  
  /**
   * Analyze OCR result confidence using multiple factors
   */
  public static analyzeConfidence(
    text: string, 
    tesseractConfidence: number,
    processingTime: number
  ): ConfidenceAnalysis {
    const factors: ConfidenceFactors = {
      tesseractConfidence,
      textLength: this.scoreTextLength(text),
      structuredContentScore: this.scoreStructuredContent(text),
      formatConsistencyScore: this.scoreFormatConsistency(text),
      languageModelScore: this.scoreLanguageModel(text),
      overallScore: 0
    };

    // Calculate weighted overall score
    factors.overallScore = this.calculateOverallScore(factors, processingTime);

    const recommendations = this.generateRecommendations(factors, text);
    const reliability = this.determineReliability(factors.overallScore);

    return {
      confidence: Math.round(factors.overallScore),
      factors,
      recommendations,
      reliability
    };
  }

  /**
   * Score based on text length (longer text usually more reliable)
   */
  private static scoreTextLength(text: string): number {
    const length = text.trim().length;
    
    if (length < 50) return 10; // Very short, likely poor OCR
    if (length < 200) return 40; // Short, may be incomplete
    if (length < 500) return 70; // Reasonable length
    if (length < 1500) return 90; // Good length for resume
    if (length < 3000) return 85; // Long but still reasonable
    return 70; // Very long, may include noise
  }

  /**
   * Score based on structured content detection
   */
  private static scoreStructuredContent(text: string): number {
    let score = 0;
    
    // Resume section indicators
    const sectionPatterns = [
      /\b(experience|work\s+experience|employment)\b/i,
      /\b(education|academic|qualifications)\b/i,
      /\b(skills|technical\s+skills|competencies)\b/i,
      /\b(contact|personal\s+information)\b/i,
      /\b(summary|objective|profile)\b/i
    ];

    const sectionMatches = sectionPatterns.filter(pattern => pattern.test(text)).length;
    score += sectionMatches * 15; // Up to 75 points for all sections

    // Contact information patterns
    const contactPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i, // Email
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Phone
      /\b(linkedin|github|portfolio)\b/i // Professional links
    ];

    const contactMatches = contactPatterns.filter(pattern => pattern.test(text)).length;
    score += contactMatches * 8; // Up to 24 points for contact info

    // Date patterns (common in resumes)
    const datePatterns = [
      /\b(19|20)\d{2}\b/, // Years
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(19|20)\d{2}\b/i, // Month Year
      /\b(Present|Current|Now)\b/i // Current employment
    ];

    const dateMatches = datePatterns.filter(pattern => pattern.test(text)).length;
    score += Math.min(dateMatches * 3, 15); // Up to 15 points for dates

    return Math.min(score, 100);
  }

  /**
   * Score based on format consistency
   */
  private static scoreFormatConsistency(text: string): number {
    let score = 80; // Start with high score, deduct for issues

    // Check for excessive OCR artifacts
    const ocrArtifacts = [
      /[|]{2,}/g, // Multiple pipes
      /[0O]{3,}/g, // Multiple zeros/Os
      /[1l]{3,}/g, // Multiple 1s/ls
      /[@]{2,}/g, // Multiple @s
      /[^\x20-\x7E\n\r\t]/g // Non-printable characters
    ];

    ocrArtifacts.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        score -= matches.length * 5; // Deduct for each artifact
      }
    });

    // Check for reasonable line structure
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const averageLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
    
    if (averageLineLength < 10) {
      score -= 20; // Very short lines, likely fragmented
    } else if (averageLineLength > 200) {
      score -= 10; // Very long lines, may lack structure
    }

    // Check for reasonable word structure
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    if (averageWordLength < 3 || averageWordLength > 15) {
      score -= 15; // Unusual word lengths
    }

    return Math.max(0, Math.min(score, 100));
  }

  /**
   * Score based on language model (basic grammar and word patterns)
   */
  private static scoreLanguageModel(text: string): number {
    let score = 50; // Base score

    // Check for common English words
    const commonWords = [
      'the', 'and', 'to', 'of', 'a', 'in', 'for', 'is', 'on', 'that',
      'by', 'this', 'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const commonWordCount = words.filter(word => commonWords.includes(word)).length;
    const commonWordRatio = commonWordCount / words.length;

    if (commonWordRatio > 0.1) {
      score += 30; // Good ratio of common words
    } else if (commonWordRatio > 0.05) {
      score += 15; // Reasonable ratio
    }

    // Check for proper capitalization patterns
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let properCapitalization = 0;

    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.length > 0 && /^[A-Z]/.test(trimmed)) {
        properCapitalization++;
      }
    });

    if (sentences.length > 0) {
      const capitalizationRatio = properCapitalization / sentences.length;
      if (capitalizationRatio > 0.7) {
        score += 20; // Good capitalization
      } else if (capitalizationRatio > 0.4) {
        score += 10; // Reasonable capitalization
      }
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate overall weighted score
   */
  private static calculateOverallScore(factors: ConfidenceFactors, processingTime: number): number {
    const weights = {
      tesseractConfidence: 0.3,
      textLength: 0.15,
      structuredContent: 0.25,
      formatConsistency: 0.2,
      languageModel: 0.1
    };

    let weightedScore = 
      factors.tesseractConfidence * weights.tesseractConfidence +
      factors.textLength * weights.textLength +
      factors.structuredContentScore * weights.structuredContent +
      factors.formatConsistencyScore * weights.formatConsistency +
      factors.languageModelScore * weights.languageModel;

    // Apply processing time penalty for very slow OCR (may indicate poor quality)
    if (processingTime > 60000) { // 60 seconds
      weightedScore *= 0.9;
    } else if (processingTime > 30000) { // 30 seconds
      weightedScore *= 0.95;
    }

    return Math.max(0, Math.min(weightedScore, 100));
  }

  /**
   * Generate recommendations based on confidence factors
   */
  private static generateRecommendations(factors: ConfidenceFactors, text: string): string[] {
    const recommendations: string[] = [];

    if (factors.tesseractConfidence < 50) {
      recommendations.push('Low OCR engine confidence - consider improving image quality');
    }

    if (factors.textLength < 40) {
      recommendations.push('Very little text extracted - verify the document contains readable text');
    }

    if (factors.structuredContentScore < 30) {
      recommendations.push('Limited resume structure detected - manual review recommended');
    }

    if (factors.formatConsistencyScore < 50) {
      recommendations.push('Format inconsistencies detected - text may need manual cleanup');
    }

    if (factors.languageModelScore < 40) {
      recommendations.push('Unusual language patterns detected - verify text accuracy');
    }

    // Check for specific issues
    if (text.length > 0) {
      const ocrArtifactRatio = (text.match(/[|@0O1l]{2,}/g) || []).length / text.length;
      if (ocrArtifactRatio > 0.01) {
        recommendations.push('High OCR artifact density - consider using a different image or OCR settings');
      }

      if (!/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text)) {
        recommendations.push('No email address detected - verify contact information extraction');
      }

      if (!/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(text)) {
        recommendations.push('No phone number detected - verify contact information extraction');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('OCR quality appears good - minimal manual review needed');
    }

    return recommendations;
  }

  /**
   * Determine reliability level based on overall score
   */
  private static determineReliability(score: number): 'high' | 'medium' | 'low' {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  /**
   * Get confidence threshold recommendations
   */
  public static getConfidenceThresholds(): {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
  } {
    return {
      excellent: 85, // Minimal manual review needed
      good: 70,      // Light manual review recommended
      acceptable: 50, // Thorough manual review recommended
      poor: 30       // Consider re-processing or manual entry
    };
  }
}