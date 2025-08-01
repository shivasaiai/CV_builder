import { ResumeData, TemplateColors } from '../types';
import { AVAILABLE_TEMPLATES } from '../hooks/useTemplateManager';

export interface TemplateSwitchResult {
  success: boolean;
  preservedData: ResumeData;
  warnings: string[];
  errors: string[];
  migrationNotes: string[];
}

export interface TemplateSwitchOptions {
  preserveColors: boolean;
  preserveCustomSections: boolean;
  validateCompatibility: boolean;
  showWarnings: boolean;
}

export class TemplateSwitchingService {
  private static readonly DEFAULT_OPTIONS: TemplateSwitchOptions = {
    preserveColors: true,
    preserveCustomSections: true,
    validateCompatibility: true,
    showWarnings: true
  };

  /**
   * Switches template while preserving user data
   */
  static async switchTemplate(
    fromTemplate: string,
    toTemplate: string,
    resumeData: ResumeData,
    templateColors: TemplateColors,
    options: Partial<TemplateSwitchOptions> = {}
  ): Promise<TemplateSwitchResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const result: TemplateSwitchResult = {
      success: false,
      preservedData: { ...resumeData },
      warnings: [],
      errors: [],
      migrationNotes: []
    };

    try {
      // Validate template existence
      if (!this.isValidTemplate(toTemplate)) {
        result.errors.push(`Template "${toTemplate}" does not exist`);
        return result;
      }

      // Check template compatibility
      if (opts.validateCompatibility) {
        const compatibility = await this.checkTemplateCompatibility(
          fromTemplate,
          toTemplate,
          resumeData
        );
        
        result.warnings.push(...compatibility.warnings);
        result.migrationNotes.push(...compatibility.migrationNotes);
      }

      // Preserve data based on template requirements
      result.preservedData = await this.migrateData(
        resumeData,
        fromTemplate,
        toTemplate,
        opts
      );

      // Handle color preservation
      if (opts.preserveColors) {
        result.migrationNotes.push('Colors preserved from previous template');
      }

      result.success = true;
      result.migrationNotes.push(`Successfully switched from "${fromTemplate}" to "${toTemplate}"`);

    } catch (error) {
      result.errors.push(`Failed to switch template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Validates if a template exists
   */
  private static isValidTemplate(templateName: string): boolean {
    return templateName in AVAILABLE_TEMPLATES;
  }

  /**
   * Checks compatibility between templates
   */
  private static async checkTemplateCompatibility(
    fromTemplate: string,
    toTemplate: string,
    resumeData: ResumeData
  ): Promise<{
    isCompatible: boolean;
    warnings: string[];
    migrationNotes: string[];
  }> {
    const warnings: string[] = [];
    const migrationNotes: string[] = [];

    // Check for data that might not display well in the new template
    if (this.isComplexLayoutTemplate(fromTemplate) && this.isSimpleLayoutTemplate(toTemplate)) {
      warnings.push('Switching from a complex layout to a simpler one may affect data presentation');
    }

    // Check for specific field compatibility
    if (resumeData.skills && resumeData.skills.length > 10 && this.hasLimitedSkillsDisplay(toTemplate)) {
      warnings.push('This template may not display all skills optimally');
    }

    // Check for section limits
    const sectionCount = this.countResumeSections(resumeData);
    const templateLimit = this.getTemplateSectionLimit(toTemplate);
    
    if (sectionCount > templateLimit) {
      warnings.push(`Template supports up to ${templateLimit} sections, but resume has ${sectionCount}`);
    }

    return {
      isCompatible: warnings.length === 0,
      warnings,
      migrationNotes
    };
  }

  /**
   * Migrates data between templates
   */
  private static async migrateData(
    resumeData: ResumeData,
    fromTemplate: string,
    toTemplate: string,
    options: TemplateSwitchOptions
  ): Promise<ResumeData> {
    let migratedData = { ...resumeData };

    // Handle custom sections
    if (!options.preserveCustomSections) {
      // Remove custom sections if new template doesn't support them
      if (!this.supportsCustomSections(toTemplate)) {
        // Keep only standard sections
        migratedData = this.filterStandardSections(migratedData);
      }
    }

    // Handle skills formatting
    if (this.requiresSkillsCategorization(toTemplate) && Array.isArray(migratedData.skills)) {
      migratedData.skills = this.categorizeSkills(migratedData.skills);
    }

    // Handle experience formatting
    if (this.requiresExperienceFormatting(toTemplate)) {
      migratedData.experience = this.formatExperienceForTemplate(
        migratedData.experience,
        toTemplate
      );
    }

    return migratedData;
  }

  /**
   * Helper methods for template characteristics
   */
  private static isComplexLayoutTemplate(templateName: string): boolean {
    const complexTemplates = ['Creative Edge', 'Modern Grid', 'Violet Geometric'];
    return complexTemplates.includes(templateName);
  }

  private static isSimpleLayoutTemplate(templateName: string): boolean {
    const simpleTemplates = ['Classic Timeless', 'Industry Standard', 'Professional Clean'];
    return simpleTemplates.includes(templateName);
  }

  private static hasLimitedSkillsDisplay(templateName: string): boolean {
    const limitedSkillsTemplates = ['Classic Timeless', 'Industry Standard'];
    return limitedSkillsTemplates.includes(templateName);
  }

  private static supportsCustomSections(templateName: string): boolean {
    // Most modern templates support custom sections
    const noCustomSections = ['Classic Timeless', 'Industry Standard'];
    return !noCustomSections.includes(templateName);
  }

  private static requiresSkillsCategorization(templateName: string): boolean {
    const categorizationTemplates = ['Tech Focused', 'Modern Grid'];
    return categorizationTemplates.includes(templateName);
  }

  private static requiresExperienceFormatting(templateName: string): boolean {
    const formattingTemplates = ['Creative Edge', 'Teal Professional'];
    return formattingTemplates.includes(templateName);
  }

  private static countResumeSections(resumeData: ResumeData): number {
    let count = 0;
    if (resumeData.contact) count++;
    if (resumeData.summary) count++;
    if (resumeData.experience) count++;
    if (resumeData.education) count++;
    if (resumeData.skills) count++;
    // Add custom sections count if they exist
    return count;
  }

  private static getTemplateSectionLimit(templateName: string): number {
    // Most templates support unlimited sections, but some have practical limits
    const limits: Record<string, number> = {
      'Classic Timeless': 5,
      'Industry Standard': 6,
      'Minimal Modern': 7
    };
    return limits[templateName] || 10;
  }

  private static filterStandardSections(resumeData: ResumeData): ResumeData {
    // Keep only standard resume sections
    return {
      contact: resumeData.contact,
      summary: resumeData.summary,
      experience: resumeData.experience,
      education: resumeData.education,
      skills: resumeData.skills
    };
  }

  private static categorizeSkills(skills: string[]): any {
    // Simple categorization logic
    const technical = skills.filter(skill => 
      /javascript|python|react|node|sql|html|css|java|c\+\+/i.test(skill)
    );
    const soft = skills.filter(skill => 
      /communication|leadership|teamwork|management|problem/i.test(skill)
    );
    const other = skills.filter(skill => 
      !technical.includes(skill) && !soft.includes(skill)
    );

    return {
      technical,
      soft,
      other: other.length > 0 ? other : undefined
    };
  }

  private static formatExperienceForTemplate(experience: any, templateName: string): any {
    // Template-specific experience formatting
    if (templateName === 'Creative Edge') {
      // Add timeline formatting
      return {
        ...experience,
        timeline: true,
        displayFormat: 'timeline'
      };
    }
    
    if (templateName === 'Teal Professional') {
      // Add progress indicators
      return {
        ...experience,
        showProgress: true,
        displayFormat: 'progress'
      };
    }

    return experience;
  }

  /**
   * Creates a smooth transition animation between templates
   */
  static createTransitionAnimation(
    fromTemplate: string,
    toTemplate: string
  ): {
    duration: number;
    easing: string;
    steps: string[];
  } {
    return {
      duration: 500,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      steps: [
        'fade-out-current',
        'prepare-new-template',
        'fade-in-new',
        'complete-transition'
      ]
    };
  }

  /**
   * Validates template switch before execution
   */
  static async validateTemplateSwitch(
    fromTemplate: string,
    toTemplate: string,
    resumeData: ResumeData
  ): Promise<{
    canSwitch: boolean;
    warnings: string[];
    recommendations: string[];
  }> {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check if templates are the same
    if (fromTemplate === toTemplate) {
      return {
        canSwitch: false,
        warnings: ['Template is already selected'],
        recommendations: ['Choose a different template']
      };
    }

    // Check data compatibility
    const compatibility = await this.checkTemplateCompatibility(
      fromTemplate,
      toTemplate,
      resumeData
    );

    warnings.push(...compatibility.warnings);

    if (warnings.length > 0) {
      recommendations.push('Review the warnings before switching');
      recommendations.push('Consider adjusting your resume data for better compatibility');
    }

    return {
      canSwitch: true,
      warnings,
      recommendations
    };
  }
}

export default TemplateSwitchingService;