import { useState, useEffect, useCallback } from 'react';
import { SectionProgress, SectionStatus, ProgressionState } from '../components/ProgressiveFlow/types';
import { ResumeData } from '../types';

interface UseProgressTrackingProps {
  resumeData: ResumeData;
  currentSection: number;
  sessionId?: string;
}

interface SectionValidationRule {
  sectionId: string;
  validate: (data: ResumeData) => {
    isValid: boolean;
    errors: string[];
    completionPercentage: number;
  };
  required: boolean;
}

// Define validation rules for each section
const SECTION_VALIDATION_RULES: SectionValidationRule[] = [
  {
    sectionId: 'heading',
    required: true,
    validate: (data: ResumeData) => {
      const errors: string[] = [];
      let completionPercentage = 0;
      const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
      const optionalFields = ['city', 'state', 'linkedin', 'website'];
      
      const filledRequired = requiredFields.filter(field => 
        data.contact[field as keyof typeof data.contact]?.toString().trim()
      );
      const filledOptional = optionalFields.filter(field => 
        data.contact[field as keyof typeof data.contact]?.toString().trim()
      );
      
      if (!data.contact.firstName?.trim()) errors.push('First name is required');
      if (!data.contact.lastName?.trim()) errors.push('Last name is required');
      if (!data.contact.email?.trim()) errors.push('Email is required');
      if (!data.contact.phone?.trim()) errors.push('Phone number is required');
      
      // Email validation
      if (data.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact.email)) {
        errors.push('Please enter a valid email address');
      }
      
      completionPercentage = ((filledRequired.length + filledOptional.length * 0.5) / 
        (requiredFields.length + optionalFields.length * 0.5)) * 100;
      
      return {
        isValid: errors.length === 0,
        errors,
        completionPercentage: Math.round(completionPercentage)
      };
    }
  },
  {
    sectionId: 'experience',
    required: true,
    validate: (data: ResumeData) => {
      const errors: string[] = [];
      let completionPercentage = 0;
      
      if (!data.workExperiences || data.workExperiences.length === 0) {
        errors.push('At least one work experience is required');
        return { isValid: false, errors, completionPercentage: 0 };
      }
      
      const validExperiences = data.workExperiences.filter(exp => 
        exp.jobTitle?.trim() && 
        exp.employer?.trim() && 
        exp.accomplishments?.trim()
      );
      
      if (validExperiences.length === 0) {
        errors.push('Please complete at least one work experience');
      }
      
      data.workExperiences.forEach((exp, index) => {
        if (!exp.jobTitle?.trim()) errors.push(`Job title is required for experience ${index + 1}`);
        if (!exp.employer?.trim()) errors.push(`Company name is required for experience ${index + 1}`);
        if (!exp.accomplishments?.trim()) errors.push(`Job description is required for experience ${index + 1}`);
      });
      
      completionPercentage = (validExperiences.length / Math.max(1, data.workExperiences.length)) * 100;
      
      return {
        isValid: errors.length === 0,
        errors,
        completionPercentage: Math.round(completionPercentage)
      };
    }
  },
  {
    sectionId: 'education',
    required: true,
    validate: (data: ResumeData) => {
      const errors: string[] = [];
      let completionPercentage = 0;
      const requiredFields = ['school', 'degree', 'field'];
      const optionalFields = ['location', 'gradYear', 'gradMonth'];
      
      const filledRequired = requiredFields.filter(field => 
        data.education[field as keyof typeof data.education]?.toString().trim()
      );
      const filledOptional = optionalFields.filter(field => 
        data.education[field as keyof typeof data.education]?.toString().trim()
      );
      
      if (!data.education.school?.trim()) errors.push('School name is required');
      if (!data.education.degree?.trim()) errors.push('Degree is required');
      if (!data.education.field?.trim()) errors.push('Field of study is required');
      
      completionPercentage = ((filledRequired.length + filledOptional.length * 0.3) / 
        (requiredFields.length + optionalFields.length * 0.3)) * 100;
      
      return {
        isValid: errors.length === 0,
        errors,
        completionPercentage: Math.round(completionPercentage)
      };
    }
  },
  {
    sectionId: 'skills',
    required: true,
    validate: (data: ResumeData) => {
      const errors: string[] = [];
      let completionPercentage = 0;
      
      if (!data.skills || data.skills.length === 0) {
        errors.push('At least 3 skills are recommended');
        return { isValid: false, errors, completionPercentage: 0 };
      }
      
      const validSkills = data.skills.filter(skill => skill.trim());
      
      if (validSkills.length < 3) {
        errors.push('At least 3 skills are recommended');
      }
      
      completionPercentage = Math.min(100, (validSkills.length / 5) * 100);
      
      return {
        isValid: validSkills.length >= 3,
        errors,
        completionPercentage: Math.round(completionPercentage)
      };
    }
  },
  {
    sectionId: 'summary',
    required: false,
    validate: (data: ResumeData) => {
      const errors: string[] = [];
      let completionPercentage = 0;
      
      if (!data.summary?.trim()) {
        return { isValid: true, errors: [], completionPercentage: 0 };
      }
      
      const wordCount = data.summary.trim().split(/\s+/).length;
      
      if (wordCount < 20) {
        errors.push('Summary should be at least 20 words');
      }
      
      if (wordCount > 150) {
        errors.push('Summary should be less than 150 words');
      }
      
      completionPercentage = Math.min(100, (wordCount / 75) * 100);
      
      return {
        isValid: wordCount >= 20 && wordCount <= 150,
        errors,
        completionPercentage: Math.round(completionPercentage)
      };
    }
  },
  {
    sectionId: 'finalize',
    required: true,
    validate: (data: ResumeData) => {
      // Finalize section is complete when all other required sections are valid
      const otherRules = SECTION_VALIDATION_RULES.filter(rule => 
        rule.sectionId !== 'finalize' && rule.required
      );
      
      const allValid = otherRules.every(rule => rule.validate(data).isValid);
      
      return {
        isValid: allValid,
        errors: allValid ? [] : ['Complete all required sections first'],
        completionPercentage: allValid ? 100 : 0
      };
    }
  }
];

export const useProgressTracking = ({ 
  resumeData, 
  currentSection, 
  sessionId 
}: UseProgressTrackingProps) => {
  const [progressState, setProgressState] = useState<ProgressionState>({
    sections: [],
    currentSection,
    completionPercentage: 0,
    visualState: {
      animationsEnabled: true,
      showConnectingLines: true,
      theme: 'light'
    }
  });

  // Initialize sections
  const initializeSections = useCallback(() => {
    const sectionNames = ['Heading', 'Experience', 'Education', 'Skills', 'Summary', 'Finalize'];
    
    const sections: SectionProgress[] = sectionNames.map((name, index) => {
      const rule = SECTION_VALIDATION_RULES.find(r => 
        r.sectionId.toLowerCase() === name.toLowerCase()
      );
      
      const validation = rule ? rule.validate(resumeData) : {
        isValid: true,
        errors: [],
        completionPercentage: 100
      };
      
      let status: SectionStatus = 'not_started';
      if (validation.isValid) {
        status = 'completed';
      } else if (validation.completionPercentage > 0) {
        status = 'in_progress';
      }
      
      return {
        id: name.toLowerCase(),
        name,
        status,
        required: rule?.required ?? false,
        validationErrors: validation.errors,
        completionPercentage: validation.completionPercentage
      };
    });
    
    return sections;
  }, [resumeData]);

  // Update sections when resume data changes
  useEffect(() => {
    const sections = initializeSections();
    const completedSections = sections.filter(s => s.status === 'completed').length;
    const overallCompletion = (completedSections / sections.length) * 100;
    
    setProgressState(prev => ({
      ...prev,
      sections,
      currentSection,
      completionPercentage: Math.round(overallCompletion)
    }));
  }, [resumeData, currentSection, initializeSections]);

  // Persistence layer
  useEffect(() => {
    if (sessionId) {
      const storageKey = `resume_progress_${sessionId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        currentSection,
        timestamp: Date.now(),
        completionPercentage: progressState.completionPercentage
      }));
    }
  }, [sessionId, currentSection, progressState.completionPercentage]);

  // Load saved progress
  useEffect(() => {
    if (sessionId) {
      const storageKey = `resume_progress_${sessionId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Only restore if it's recent (within 24 hours)
          if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            // Progress restoration would be handled by parent component
            console.log('Saved progress found:', parsed);
          }
        } catch (error) {
          console.error('Error loading saved progress:', error);
        }
      }
    }
  }, [sessionId]);

  const getSectionStatus = useCallback((sectionIndex: number): SectionStatus => {
    return progressState.sections[sectionIndex]?.status || 'not_started';
  }, [progressState.sections]);

  const getSectionValidation = useCallback((sectionIndex: number) => {
    const section = progressState.sections[sectionIndex];
    return {
      isValid: section?.validationErrors.length === 0,
      errors: section?.validationErrors || [],
      completionPercentage: section?.completionPercentage || 0
    };
  }, [progressState.sections]);

  const canNavigateToSection = useCallback((targetIndex: number): boolean => {
    if (targetIndex < 0 || targetIndex >= progressState.sections.length) {
      return false;
    }
    
    const targetSection = progressState.sections[targetIndex];
    const currentSectionData = progressState.sections[currentSection];
    
    // Can always navigate to completed sections
    if (targetSection.status === 'completed') return true;
    
    // Can navigate to current section
    if (targetIndex === currentSection) return true;
    
    // Can navigate to next section if current is completed
    if (targetIndex === currentSection + 1 && currentSectionData?.status === 'completed') {
      return true;
    }
    
    // Can navigate backwards
    if (targetIndex < currentSection) return true;
    
    return false;
  }, [progressState.sections, currentSection]);

  const getNextIncompleteSection = useCallback((): number | null => {
    const incompleteIndex = progressState.sections.findIndex(
      section => section.status !== 'completed' && section.required
    );
    return incompleteIndex !== -1 ? incompleteIndex : null;
  }, [progressState.sections]);

  return {
    progressState,
    getSectionStatus,
    getSectionValidation,
    canNavigateToSection,
    getNextIncompleteSection,
    updateVisualState: (visualState: Partial<typeof progressState.visualState>) => {
      setProgressState(prev => ({
        ...prev,
        visualState: { ...prev.visualState, ...visualState }
      }));
    }
  };
};