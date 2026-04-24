/**
 * Section Classification Engine
 * 
 * This service provides intelligent section identification and classification
 * for resume parsing with enhanced pattern matching and context analysis.
 */

export interface SectionClassifier {
  patterns: RegExp[];
  keywords: string[];
  contextualRules: ContextRule[];
  confidence: number;
}

export interface ContextRule {
  type: 'before' | 'after' | 'contains' | 'structure';
  pattern: RegExp | string;
  weight: number;
  description: string;
}

export interface SectionBoundary {
  name: SectionType;
  start: number;
  end: number;
  headerLine: string;
  confidence: number;
  matchedPattern: string;
  context: string[];
}

export interface ClassificationResult {
  sections: Record<SectionType, string>;
  boundaries: SectionBoundary[];
  confidence: number;
  warnings: string[];
}

export type SectionType = 
  | 'contact' 
  | 'summary' 
  | 'objective'
  | 'experience' 
  | 'education' 
  | 'skills' 
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'volunteer'
  | 'publications'
  | 'awards'
  | 'references'
  | 'unknown';

export class SectionClassificationEngine {
  
  private static readonly SECTION_CLASSIFIERS: Record<SectionType, SectionClassifier> = {
    contact: {
      patterns: [
        /^(CONTACT|CONTACT\s+INFO|CONTACT\s+INFORMATION|PERSONAL\s+INFO|PERSONAL\s+INFORMATION)$/i,
        /^(Contact|Personal\s+Information|Contact\s+Details)$/i,
      ],
      keywords: ['email', 'phone', 'address', 'linkedin', 'website'],
      contextualRules: [
        {
          type: 'contains',
          pattern: /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
          weight: 0.8,
          description: 'Contains email address'
        },
        {
          type: 'contains', 
          pattern: /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/,
          weight: 0.7,
          description: 'Contains phone number'
        }
      ],
      confidence: 0.9
    },

    summary: {
      patterns: [
        /^(SUMMARY|PROFESSIONAL\s+SUMMARY|CAREER\s+SUMMARY|EXECUTIVE\s+SUMMARY)$/i,
        /^(PROFILE|PROFESSIONAL\s+PROFILE|CAREER\s+PROFILE)$/i,
        /^(OVERVIEW|PROFESSIONAL\s+OVERVIEW|CAREER\s+OVERVIEW)$/i,
        /^(Summary|Profile|Overview)$/i,
      ],
      keywords: ['summary', 'profile', 'overview', 'professional', 'career'],
      contextualRules: [
        {
          type: 'structure',
          pattern: 'paragraph',
          weight: 0.6,
          description: 'Typically contains paragraph text'
        },
        {
          type: 'before',
          pattern: /experience|education|skills/i,
          weight: 0.5,
          description: 'Usually appears before main sections'
        }
      ],
      confidence: 0.85
    },

    objective: {
      patterns: [
        /^(OBJECTIVE|CAREER\s+OBJECTIVE|PROFESSIONAL\s+OBJECTIVE)$/i,
        /^(GOAL|CAREER\s+GOAL|PROFESSIONAL\s+GOAL)$/i,
        /^(Objective|Career\s+Objective|Goal)$/i,
      ],
      keywords: ['objective', 'goal', 'seeking', 'looking', 'career'],
      contextualRules: [
        {
          type: 'structure',
          pattern: 'paragraph',
          weight: 0.6,
          description: 'Typically contains paragraph text'
        },
        {
          type: 'contains',
          pattern: /seeking|looking\s+for|goal|objective/i,
          weight: 0.7,
          description: 'Contains objective language'
        }
      ],
      confidence: 0.8
    },

    experience: {
      patterns: [
        // Enhanced experience patterns with comprehensive variations
        /^(PROFESSIONAL\s+EXPERIENCE|WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT\s+HISTORY)$/i,
        /^(CAREER\s+HISTORY|WORK\s+HISTORY|EMPLOYMENT|CAREER\s+EXPERIENCE)$/i,
        /^(PROFESSIONAL\s+BACKGROUND|WORK\s+BACKGROUND|JOB\s+EXPERIENCE)$/i,
        /^(Experience|Work|Employment|Career|Professional|Job\s+History)$/i,
        // Handle common typos and variations
        /^(EXPERIEN[C]?E|WORKING\s+EXPERIENCE|WORK\s+EXPERIEN[C]?E)$/i,
        /^(experien[c]?e|work|employment|career)$/i,
        // Numbered sections
        /^\d+\.\s*(EXPERIENCE|WORK|EMPLOYMENT|CAREER|EXPERIEN[C]?E)$/i,
        // With underscores or dashes
        /^(EXPERIENCE|WORK|EMPLOYMENT|CAREER)[\s_-]*$/i
      ],
      keywords: ['experience', 'work', 'employment', 'career', 'job', 'position', 'role'],
      contextualRules: [
        {
          type: 'contains',
          pattern: /\d{4}\s*[-–—]\s*(\d{4}|present|current)/i,
          weight: 0.9,
          description: 'Contains date ranges'
        },
        {
          type: 'contains',
          pattern: /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}/i,
          weight: 0.8,
          description: 'Contains month/year dates'
        },
        {
          type: 'structure',
          pattern: 'job_title_company',
          weight: 0.7,
          description: 'Contains job title and company structure'
        }
      ],
      confidence: 0.95
    },

    education: {
      patterns: [
        // Enhanced education patterns with comprehensive variations
        /^(EDUCATION|ACADEMIC\s+BACKGROUND|QUALIFICATIONS|EDUCATIONAL\s+BACKGROUND)$/i,
        /^(ACADEMICS|SCHOOLING|LEARNING|STUDIES|UNIVERSITY|COLLEGE)$/i,
        /^(Education|Academics|Schooling|Learning|Studies|University|College)$/i,
        /^(Academic\s+Background|Educational\s+Background)$/i,
        // Handle common typos
        /^(EDUCATON|EDUCTION|EDUCATN)$/i,
        /^(education|academics|schooling|learning|studies)$/i,
        // Numbered sections
        /^\d+\.\s*(EDUCATION|ACADEMICS|SCHOOLING|LEARNING|STUDIES)$/i,
        // With underscores or dashes
        /^(EDUCATION|ACADEMICS|SCHOOLING)[\s_-]*$/i
      ],
      keywords: ['education', 'degree', 'university', 'college', 'school', 'bachelor', 'master', 'phd'],
      contextualRules: [
        {
          type: 'contains',
          pattern: /(bachelor|master|phd|doctorate|associate|diploma|certificate)/i,
          weight: 0.9,
          description: 'Contains degree types'
        },
        {
          type: 'contains',
          pattern: /(university|college|school|institute)/i,
          weight: 0.8,
          description: 'Contains educational institutions'
        },
        {
          type: 'contains',
          pattern: /\d{4}|\b(19|20)\d{2}\b/,
          weight: 0.7,
          description: 'Contains graduation years'
        }
      ],
      confidence: 0.9
    },

    skills: {
      patterns: [
        /^(SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|EXPERTISE)$/i,
        /^(TECHNICAL\s+EXPERTISE|COMPETENCIES|TECHNOLOGIES|PROFICIENCIES)$/i,
        /^(Skills|Technical\s+Skills|Technologies|Competencies)$/i,
        /^(CORE\s+SKILLS|KEY\s+SKILLS|RELEVANT\s+SKILLS)$/i,
      ],
      keywords: ['skills', 'technologies', 'competencies', 'expertise', 'proficient', 'experienced'],
      contextualRules: [
        {
          type: 'structure',
          pattern: 'bullet_list',
          weight: 0.8,
          description: 'Often formatted as bullet points or lists'
        },
        {
          type: 'contains',
          pattern: /(javascript|python|java|react|angular|vue|node|sql|aws|azure|docker)/i,
          weight: 0.7,
          description: 'Contains common technical skills'
        }
      ],
      confidence: 0.85
    },

    projects: {
      patterns: [
        /^(PROJECTS|PERSONAL\s+PROJECTS|PROFESSIONAL\s+PROJECTS|KEY\s+PROJECTS)$/i,
        /^(PORTFOLIO|WORK\s+SAMPLES|NOTABLE\s+PROJECTS)$/i,
        /^(Projects|Portfolio|Work\s+Samples)$/i,
      ],
      keywords: ['projects', 'portfolio', 'developed', 'built', 'created', 'designed'],
      contextualRules: [
        {
          type: 'contains',
          pattern: /(github|gitlab|portfolio|demo|live)/i,
          weight: 0.7,
          description: 'Contains project links or repositories'
        },
        {
          type: 'structure',
          pattern: 'project_description',
          weight: 0.6,
          description: 'Contains project descriptions'
        }
      ],
      confidence: 0.8
    },

    certifications: {
      patterns: [
        /^(CERTIFICATIONS|CERTIFICATES|PROFESSIONAL\s+CERTIFICATIONS)$/i,
        /^(LICENSES|CREDENTIALS|QUALIFICATIONS)$/i,
        /^(Certifications|Certificates|Licenses)$/i,
      ],
      keywords: ['certification', 'certificate', 'license', 'credential', 'certified', 'licensed'],
      contextualRules: [
        {
          type: 'contains',
          pattern: /(certified|license|credential|aws|microsoft|google|oracle)/i,
          weight: 0.8,
          description: 'Contains certification keywords'
        }
      ],
      confidence: 0.85
    },

    languages: {
      patterns: [
        /^(LANGUAGES|LANGUAGE\s+SKILLS|FOREIGN\s+LANGUAGES)$/i,
        /^(LINGUISTIC\s+SKILLS|MULTILINGUAL\s+ABILITIES)$/i,
        /^(Languages|Language\s+Skills)$/i,
      ],
      keywords: ['languages', 'fluent', 'native', 'conversational', 'proficient'],
      contextualRules: [
        {
          type: 'contains',
          pattern: /(english|spanish|french|german|chinese|japanese|fluent|native|conversational)/i,
          weight: 0.8,
          description: 'Contains language names or proficiency levels'
        }
      ],
      confidence: 0.8
    },

    volunteer: {
      patterns: [
        /^(VOLUNTEER\s+EXPERIENCE|VOLUNTEER\s+WORK|COMMUNITY\s+SERVICE)$/i,
        /^(VOLUNTEER\s+ACTIVITIES|COMMUNITY\s+INVOLVEMENT|CIVIC\s+ENGAGEMENT)$/i,
        /^(Volunteer|Community\s+Service|Volunteer\s+Work)$/i,
      ],
      keywords: ['volunteer', 'community', 'service', 'nonprofit', 'charity', 'civic'],
      contextualRules: [
        {
          type: 'contains',
          pattern: /(volunteer|community|nonprofit|charity|service)/i,
          weight: 0.8,
          description: 'Contains volunteer-related keywords'
        }
      ],
      confidence: 0.8
    },

    publications: {
      patterns: [
        /^(PUBLICATIONS|RESEARCH|PAPERS|ARTICLES)$/i,
        /^(PUBLISHED\s+WORKS|ACADEMIC\s+PUBLICATIONS|RESEARCH\s+PAPERS)$/i,
        /^(Publications|Research|Papers)$/i,
      ],
      keywords: ['publications', 'research', 'paper', 'article', 'journal', 'conference'],
      contextualRules: [
        {
          type: 'contains',
          pattern: /(journal|conference|paper|article|research|published)/i,
          weight: 0.8,
          description: 'Contains publication-related keywords'
        }
      ],
      confidence: 0.8
    },

    awards: {
      patterns: [
        /^(AWARDS|HONORS|ACHIEVEMENTS|RECOGNITION)$/i,
        /^(HONORS\s+AND\s+AWARDS|ACHIEVEMENTS\s+AND\s+AWARDS)$/i,
        /^(Awards|Honors|Achievements|Recognition)$/i,
      ],
      keywords: ['award', 'honor', 'achievement', 'recognition', 'winner', 'recipient'],
      contextualRules: [
        {
          type: 'contains',
          pattern: /(award|honor|achievement|recognition|winner|recipient)/i,
          weight: 0.8,
          description: 'Contains award-related keywords'
        }
      ],
      confidence: 0.8
    },

    references: {
      patterns: [
        /^(REFERENCES|PROFESSIONAL\s+REFERENCES|PERSONAL\s+REFERENCES)$/i,
        /^(RECOMMENDATIONS|REFEREES)$/i,
        /^(References|Professional\s+References)$/i,
      ],
      keywords: ['references', 'available', 'upon', 'request', 'contact', 'referee'],
      contextualRules: [
        {
          type: 'contains',
          pattern: /(available\s+upon\s+request|references\s+available|contact\s+information)/i,
          weight: 0.9,
          description: 'Contains reference availability statements'
        }
      ],
      confidence: 0.85
    },

    unknown: {
      patterns: [],
      keywords: [],
      contextualRules: [],
      confidence: 0.0
    }
  };

  /**
   * Classifies text into resume sections using enhanced pattern matching
   */
  public static classifySections(text: string): ClassificationResult {
    console.log('🔍 === SECTION CLASSIFICATION START ===');
    console.log('📄 Text length:', text.length);
    
    const lines = this.preprocessText(text);
    console.log('📝 Preprocessed lines:', lines.length);
    
    const boundaries = this.identifySectionBoundaries(lines);
    console.log('🎯 Section boundaries found:', boundaries.length);
    
    const sections = this.extractSectionContent(lines, boundaries);
    const overallConfidence = this.calculateOverallConfidence(boundaries);
    const warnings = this.generateWarnings(boundaries, sections);
    
    console.log('✅ === SECTION CLASSIFICATION COMPLETE ===');
    console.log('📊 Results:', {
      sectionsFound: Object.keys(sections).length,
      overallConfidence: Math.round(overallConfidence * 100) + '%',
      warnings: warnings.length
    });
    
    return {
      sections,
      boundaries,
      confidence: overallConfidence,
      warnings
    };
  }

  /**
   * Preprocesses text for better section identification
   */
  private static preprocessText(text: string): string[] {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  /**
   * Identifies section boundaries using enhanced pattern matching
   */
  private static identifySectionBoundaries(lines: string[]): SectionBoundary[] {
    console.log('🔍 Scanning for section headers...');
    const boundaries: SectionBoundary[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip very short lines that are unlikely to be headers
      if (line.length < 3) continue;
      
      for (const [sectionName, classifier] of Object.entries(this.SECTION_CLASSIFIERS)) {
        if (sectionName === 'unknown') continue;
        
        const matchResult = this.matchSectionHeader(line, classifier, lines, i);
        
        if (matchResult.isMatch) {
          // Check for duplicates
          const existingBoundary = boundaries.find(b => b.name === sectionName as SectionType);
          if (existingBoundary) {
            console.log(`⚠️ Duplicate ${sectionName} section found, keeping first occurrence`);
            continue;
          }
          
          const boundary: SectionBoundary = {
            name: sectionName as SectionType,
            start: i,
            end: lines.length,
            headerLine: line,
            confidence: matchResult.confidence,
            matchedPattern: matchResult.matchedPattern,
            context: this.extractContext(lines, i)
          };
          
          boundaries.push(boundary);
          console.log(`✓ Found ${sectionName} section at line ${i}: "${line}" (confidence: ${Math.round(matchResult.confidence * 100)}%)`);
          break;
        }
      }
    }
    
    // Sort boundaries by line number and set end boundaries
    boundaries.sort((a, b) => a.start - b.start);
    for (let i = 0; i < boundaries.length - 1; i++) {
      boundaries[i].end = boundaries[i + 1].start;
    }
    
    return boundaries;
  }

  /**
   * Matches a line against section classifier patterns and rules
   */
  private static matchSectionHeader(
    line: string, 
    classifier: SectionClassifier, 
    lines: string[], 
    lineIndex: number
  ): { isMatch: boolean; confidence: number; matchedPattern: string } {
    let confidence = 0;
    let matchedPattern = '';
    
    // Check direct pattern matches
    for (const pattern of classifier.patterns) {
      if (pattern.test(line)) {
        confidence = classifier.confidence;
        matchedPattern = pattern.toString();
        break;
      }
    }
    
    // If no direct pattern match, check contextual rules
    if (confidence === 0) {
      const contextualMatch = this.evaluateContextualRules(line, classifier.contextualRules, lines, lineIndex);
      if (contextualMatch.confidence > 0.5) {
        confidence = contextualMatch.confidence;
        matchedPattern = 'contextual_rules';
      }
    }
    
    // Boost confidence if keywords are present
    const keywordBoost = this.calculateKeywordBoost(line, classifier.keywords);
    confidence = Math.min(1.0, confidence + keywordBoost);
    
    return {
      isMatch: confidence > 0.6, // Threshold for section identification
      confidence,
      matchedPattern
    };
  }

  /**
   * Evaluates contextual rules for section identification
   */
  private static evaluateContextualRules(
    line: string, 
    rules: ContextRule[], 
    lines: string[], 
    lineIndex: number
  ): { confidence: number } {
    let totalWeight = 0;
    let matchedWeight = 0;
    
    for (const rule of rules) {
      totalWeight += rule.weight;
      
      switch (rule.type) {
        case 'contains':
          if (typeof rule.pattern === 'string') {
            if (line.toLowerCase().includes(rule.pattern.toLowerCase())) {
              matchedWeight += rule.weight;
            }
          } else if (rule.pattern instanceof RegExp) {
            if (rule.pattern.test(line)) {
              matchedWeight += rule.weight;
            }
          }
          break;
          
        case 'before':
          // Check if pattern appears in subsequent lines
          const nextLines = lines.slice(lineIndex + 1, Math.min(lineIndex + 10, lines.length));
          const beforeText = nextLines.join(' ');
          if (rule.pattern instanceof RegExp && rule.pattern.test(beforeText)) {
            matchedWeight += rule.weight;
          }
          break;
          
        case 'after':
          // Check if pattern appears in previous lines
          const prevLines = lines.slice(Math.max(0, lineIndex - 10), lineIndex);
          const afterText = prevLines.join(' ');
          if (rule.pattern instanceof RegExp && rule.pattern.test(afterText)) {
            matchedWeight += rule.weight;
          }
          break;
          
        case 'structure':
          // Evaluate structural patterns (simplified for now)
          if (rule.pattern === 'paragraph' && line.length > 50) {
            matchedWeight += rule.weight;
          } else if (rule.pattern === 'bullet_list' && /^[-•*]\s/.test(line)) {
            matchedWeight += rule.weight;
          }
          break;
      }
    }
    
    const confidence = totalWeight > 0 ? matchedWeight / totalWeight : 0;
    return { confidence };
  }

  /**
   * Calculates keyword boost for section identification
   */
  private static calculateKeywordBoost(line: string, keywords: string[]): number {
    const lowerLine = line.toLowerCase();
    const matchedKeywords = keywords.filter(keyword => 
      lowerLine.includes(keyword.toLowerCase())
    );
    
    return Math.min(0.3, matchedKeywords.length * 0.1); // Max 30% boost
  }

  /**
   * Extracts context around a section header
   */
  private static extractContext(lines: string[], lineIndex: number): string[] {
    const contextSize = 3;
    const start = Math.max(0, lineIndex - contextSize);
    const end = Math.min(lines.length, lineIndex + contextSize + 1);
    
    return lines.slice(start, end);
  }

  /**
   * Extracts content for each identified section
   */
  private static extractSectionContent(
    lines: string[], 
    boundaries: SectionBoundary[]
  ): Record<SectionType, string> {
    const sections: Record<string, string> = {};
    
    for (const boundary of boundaries) {
      const sectionLines = lines.slice(boundary.start + 1, boundary.end);
      const content = sectionLines.join('\n').trim();
      
      sections[boundary.name] = content;
      
      console.log(`📄 ${boundary.name} section content:`, {
        lines: sectionLines.length,
        characters: content.length,
        preview: content.substring(0, 100) + (content.length > 100 ? '...' : '')
      });
    }
    
    return sections as Record<SectionType, string>;
  }

  /**
   * Calculates overall confidence score
   */
  private static calculateOverallConfidence(boundaries: SectionBoundary[]): number {
    if (boundaries.length === 0) return 0;
    
    const totalConfidence = boundaries.reduce((sum, boundary) => sum + boundary.confidence, 0);
    return totalConfidence / boundaries.length;
  }

  /**
   * Generates warnings for classification issues
   */
  private static generateWarnings(
    boundaries: SectionBoundary[], 
    sections: Record<SectionType, string>
  ): string[] {
    const warnings: string[] = [];
    
    // Check for missing essential sections
    const essentialSections: SectionType[] = ['contact', 'experience', 'education'];
    for (const section of essentialSections) {
      if (!sections[section] || sections[section].length < 10) {
        warnings.push(`Missing or insufficient ${section} section`);
      }
    }
    
    // Check for low confidence sections
    const lowConfidenceSections = boundaries.filter(b => b.confidence < 0.7);
    if (lowConfidenceSections.length > 0) {
      warnings.push(`Low confidence in identifying: ${lowConfidenceSections.map(s => s.name).join(', ')}`);
    }
    
    // Check for very short sections
    const shortSections = Object.entries(sections).filter(([_, content]) => content.length < 20);
    if (shortSections.length > 0) {
      warnings.push(`Very short sections detected: ${shortSections.map(([name]) => name).join(', ')}`);
    }
    
    return warnings;
  }

  /**
   * Gets section boundaries for debugging and manual override
   */
  public static getSectionBoundaries(text: string): SectionBoundary[] {
    const lines = this.preprocessText(text);
    return this.identifySectionBoundaries(lines);
  }

  /**
   * Validates section classification results
   */
  public static validateClassification(result: ClassificationResult): boolean {
    // Must have at least contact or experience section
    const hasEssentialSection = result.sections.contact || result.sections.experience;
    
    // Overall confidence should be reasonable
    const hasReasonableConfidence = result.confidence > 0.3;
    
    // Should not have too many warnings
    const hasAcceptableWarnings = result.warnings.length < 5;
    
    return hasEssentialSection && hasReasonableConfidence && hasAcceptableWarnings;
  }
}