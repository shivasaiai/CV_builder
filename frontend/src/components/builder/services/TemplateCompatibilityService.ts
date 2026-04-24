import { ResumeData } from '../types';

export interface TemplateCompatibility {
  isCompatible: boolean;
  score: number; // 0-100
  warnings: string[];
  recommendations: string[];
  missingFeatures: string[];
  supportedFeatures: string[];
}

export interface TemplateFeatures {
  supportsProjects: boolean;
  supportsCertifications: boolean;
  supportsLanguages: boolean;
  supportsVolunteerWork: boolean;
  supportsPublications: boolean;
  supportsAwards: boolean;
  supportsReferences: boolean;
  supportsCustomColors: boolean;
  supportsMultipleExperiences: boolean;
  supportsSkillCategories: boolean;
  maxExperienceEntries: number;
  maxEducationEntries: number;
  maxSkillsCount: number;
  layoutType: 'single-column' | 'two-column' | 'multi-column' | 'creative';
  colorScheme: 'monochrome' | 'accent' | 'full-color';
  professionalLevel: 'entry' | 'mid' | 'senior' | 'executive';
}

// Template feature definitions
const TEMPLATE_FEATURES: Record<string, TemplateFeatures> = {
  "Clean Chromatic": {
    supportsProjects: true,
    supportsCertifications: true,
    supportsLanguages: true,
    supportsVolunteerWork: true,
    supportsPublications: true,
    supportsAwards: true,
    supportsReferences: true,
    supportsCustomColors: true,
    supportsMultipleExperiences: true,
    supportsSkillCategories: true,
    maxExperienceEntries: 10,
    maxEducationEntries: 5,
    maxSkillsCount: 20,
    layoutType: 'two-column',
    colorScheme: 'accent',
    professionalLevel: 'mid'
  },
  "Contemporary Contrast": {
    supportsProjects: true,
    supportsCertifications: true,
    supportsLanguages: true,
    supportsVolunteerWork: true,
    supportsPublications: true,
    supportsAwards: true,
    supportsReferences: true,
    supportsCustomColors: true,
    supportsMultipleExperiences: true,
    supportsSkillCategories: true,
    maxExperienceEntries: 8,
    maxEducationEntries: 4,
    maxSkillsCount: 15,
    layoutType: 'single-column',
    colorScheme: 'full-color',
    professionalLevel: 'senior'
  },
  "Executive Professional": {
    supportsProjects: true,
    supportsCertifications: true,
    supportsLanguages: false,
    supportsVolunteerWork: false,
    supportsPublications: true,
    supportsAwards: true,
    supportsReferences: true,
    supportsCustomColors: false,
    supportsMultipleExperiences: true,
    supportsSkillCategories: false,
    maxExperienceEntries: 12,
    maxEducationEntries: 3,
    maxSkillsCount: 10,
    layoutType: 'single-column',
    colorScheme: 'monochrome',
    professionalLevel: 'executive'
  },
  "Creative Flare": {
    supportsProjects: true,
    supportsCertifications: true,
    supportsLanguages: true,
    supportsVolunteerWork: true,
    supportsPublications: true,
    supportsAwards: true,
    supportsReferences: false,
    supportsCustomColors: true,
    supportsMultipleExperiences: true,
    supportsSkillCategories: true,
    maxExperienceEntries: 6,
    maxEducationEntries: 3,
    maxSkillsCount: 25,
    layoutType: 'creative',
    colorScheme: 'full-color',
    professionalLevel: 'mid'
  },
  "Tech Focused": {
    supportsProjects: true,
    supportsCertifications: true,
    supportsLanguages: true,
    supportsVolunteerWork: false,
    supportsPublications: true,
    supportsAwards: false,
    supportsReferences: false,
    supportsCustomColors: true,
    supportsMultipleExperiences: true,
    supportsSkillCategories: true,
    maxExperienceEntries: 8,
    maxEducationEntries: 4,
    maxSkillsCount: 30,
    layoutType: 'two-column',
    colorScheme: 'accent',
    professionalLevel: 'mid'
  }
};

// Default features for templates not explicitly defined
const DEFAULT_FEATURES: TemplateFeatures = {
  supportsProjects: true,
  supportsCertifications: true,
  supportsLanguages: true,
  supportsVolunteerWork: true,
  supportsPublications: true,
  supportsAwards: true,
  supportsReferences: true,
  supportsCustomColors: true,
  supportsMultipleExperiences: true,
  supportsSkillCategories: true,
  maxExperienceEntries: 10,
  maxEducationEntries: 5,
  maxSkillsCount: 20,
  layoutType: 'two-column',
  colorScheme: 'accent',
  professionalLevel: 'mid'
};

export class TemplateCompatibilityService {
  static getTemplateFeatures(templateName: string): TemplateFeatures {
    return TEMPLATE_FEATURES[templateName] || DEFAULT_FEATURES;
  }

  static checkCompatibility(templateName: string, resumeData: ResumeData): TemplateCompatibility {
    const features = this.getTemplateFeatures(templateName);
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const missingFeatures: string[] = [];
    const supportedFeatures: string[] = [];
    let score = 100;

    // Check each section compatibility
    if (resumeData.projects && resumeData.projects.length > 0) {
      if (features.supportsProjects) {
        supportedFeatures.push('Projects');
      } else {
        missingFeatures.push('Projects');
        warnings.push('This template does not display project information');
        score -= 15;
      }
    }

    if (resumeData.certifications && resumeData.certifications.length > 0) {
      if (features.supportsCertifications) {
        supportedFeatures.push('Certifications');
      } else {
        missingFeatures.push('Certifications');
        warnings.push('Certifications may not be prominently displayed');
        score -= 10;
      }
    }

    if (resumeData.languages && resumeData.languages.length > 0) {
      if (features.supportsLanguages) {
        supportedFeatures.push('Languages');
      } else {
        missingFeatures.push('Languages');
        warnings.push('Language skills may not be displayed');
        score -= 8;
      }
    }

    if (resumeData.volunteerExperiences && resumeData.volunteerExperiences.length > 0) {
      if (features.supportsVolunteerWork) {
        supportedFeatures.push('Volunteer Experience');
      } else {
        missingFeatures.push('Volunteer Experience');
        warnings.push('Volunteer experience may not be included');
        score -= 10;
      }
    }

    if (resumeData.publications && resumeData.publications.length > 0) {
      if (features.supportsPublications) {
        supportedFeatures.push('Publications');
      } else {
        missingFeatures.push('Publications');
        warnings.push('Publications section may not be displayed');
        score -= 12;
      }
    }

    if (resumeData.awards && resumeData.awards.length > 0) {
      if (features.supportsAwards) {
        supportedFeatures.push('Awards');
      } else {
        missingFeatures.push('Awards');
        warnings.push('Awards and achievements may not be highlighted');
        score -= 8;
      }
    }

    if (resumeData.references && resumeData.references.length > 0) {
      if (features.supportsReferences) {
        supportedFeatures.push('References');
      } else {
        missingFeatures.push('References');
        warnings.push('References section may not be included');
        score -= 5;
      }
    }

    // Check experience count
    const experienceCount = resumeData.workExperiences?.length || 0;
    if (experienceCount > features.maxExperienceEntries) {
      warnings.push(`This template works best with ${features.maxExperienceEntries} or fewer work experiences. You have ${experienceCount}.`);
      score -= Math.min(20, (experienceCount - features.maxExperienceEntries) * 3);
      recommendations.push('Consider consolidating similar roles or removing older positions');
    }

    // Check education count
    const educationCount = resumeData.education?.length || 0;
    if (educationCount > features.maxEducationEntries) {
      warnings.push(`This template displays up to ${features.maxEducationEntries} education entries effectively. You have ${educationCount}.`);
      score -= Math.min(10, (educationCount - features.maxEducationEntries) * 2);
    }

    // Check skills count
    const skillsCount = resumeData.skills?.length || 0;
    if (skillsCount > features.maxSkillsCount) {
      warnings.push(`This template works best with ${features.maxSkillsCount} or fewer skills. You have ${skillsCount}.`);
      score -= Math.min(15, (skillsCount - features.maxSkillsCount) * 1);
      recommendations.push('Consider grouping similar skills or removing less relevant ones');
    }

    // Add positive recommendations based on template strengths
    if (features.layoutType === 'creative' && supportedFeatures.includes('Projects')) {
      recommendations.push('This creative template will showcase your projects beautifully');
    }

    if (features.professionalLevel === 'executive' && experienceCount >= 5) {
      recommendations.push('This executive template is perfect for your extensive experience');
    }

    if (features.supportsSkillCategories && skillsCount > 10) {
      recommendations.push('This template can organize your skills into categories effectively');
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    return {
      isCompatible: score >= 60,
      score,
      warnings,
      recommendations,
      missingFeatures,
      supportedFeatures
    };
  }

  static getBestTemplateRecommendations(resumeData: ResumeData, availableTemplates: string[]): Array<{
    templateName: string;
    compatibility: TemplateCompatibility;
    reason: string;
  }> {
    const recommendations = availableTemplates.map(templateName => {
      const compatibility = this.checkCompatibility(templateName, resumeData);
      const features = this.getTemplateFeatures(templateName);
      
      let reason = '';
      if (compatibility.score >= 90) {
        reason = 'Excellent match for your profile';
      } else if (compatibility.score >= 80) {
        reason = 'Great fit with minor adjustments needed';
      } else if (compatibility.score >= 70) {
        reason = 'Good option with some limitations';
      } else if (compatibility.score >= 60) {
        reason = 'Workable but may not showcase all content';
      } else {
        reason = 'Not recommended for your current content';
      }

      // Add specific reasons based on features
      if (features.professionalLevel === 'executive' && (resumeData.workExperiences?.length || 0) >= 5) {
        reason += ' - Perfect for senior professionals';
      } else if (features.layoutType === 'creative' && resumeData.projects && resumeData.projects.length > 0) {
        reason += ' - Great for showcasing creative work';
      } else if (features.supportsSkillCategories && (resumeData.skills?.length || 0) > 15) {
        reason += ' - Excellent for technical professionals';
      }

      return {
        templateName,
        compatibility,
        reason
      };
    });

    // Sort by compatibility score
    return recommendations.sort((a, b) => b.compatibility.score - a.compatibility.score);
  }

  static validateTemplateSwitch(
    fromTemplate: string, 
    toTemplate: string, 
    resumeData: ResumeData
  ): {
    canSwitch: boolean;
    dataLoss: string[];
    improvements: string[];
    warnings: string[];
  } {
    const fromFeatures = this.getTemplateFeatures(fromTemplate);
    const toFeatures = this.getTemplateFeatures(toTemplate);
    
    const dataLoss: string[] = [];
    const improvements: string[] = [];
    const warnings: string[] = [];

    // Check for potential data loss
    if (fromFeatures.supportsProjects && !toFeatures.supportsProjects && resumeData.projects?.length) {
      dataLoss.push('Projects section may not be displayed');
    }

    if (fromFeatures.supportsLanguages && !toFeatures.supportsLanguages && resumeData.languages?.length) {
      dataLoss.push('Languages section may be hidden');
    }

    if (fromFeatures.supportsVolunteerWork && !toFeatures.supportsVolunteerWork && resumeData.volunteerExperiences?.length) {
      dataLoss.push('Volunteer experience may not be shown');
    }

    // Check for improvements
    if (!fromFeatures.supportsCustomColors && toFeatures.supportsCustomColors) {
      improvements.push('New template supports custom color themes');
    }

    if (fromFeatures.maxExperienceEntries < toFeatures.maxExperienceEntries) {
      improvements.push('New template can display more work experiences');
    }

    if (fromFeatures.layoutType !== toFeatures.layoutType) {
      improvements.push(`Layout will change from ${fromFeatures.layoutType} to ${toFeatures.layoutType}`);
    }

    // Add warnings for significant changes
    if (fromFeatures.professionalLevel !== toFeatures.professionalLevel) {
      warnings.push(`Template style will change from ${fromFeatures.professionalLevel} to ${toFeatures.professionalLevel} level`);
    }

    return {
      canSwitch: dataLoss.length === 0,
      dataLoss,
      improvements,
      warnings
    };
  }
}