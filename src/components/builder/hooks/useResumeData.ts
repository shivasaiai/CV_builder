import { useState, useCallback, useEffect, useMemo } from 'react';
import { ResumeData, ContactInfo, WorkExperience, Education, ActiveSections } from '../types';

const initialResumeData: ResumeData = {
  contact: {
    firstName: "",
    lastName: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: ""
  },
  workExperiences: [{
    id: 1,
    jobTitle: "",
    employer: "",
    location: "",
    remote: false,
    startDate: null,
    endDate: null,
    current: false,
    accomplishments: "",
  }],
  education: {
    school: "",
    location: "",
    degree: "",
    field: "",
    gradYear: "",
    gradMonth: ""
  },
  skills: [],
  summary: "",
  projects: [],
  certifications: [],
  languages: [],
  volunteerExperiences: [],
  publications: [],
  awards: [],
  references: [],
  activeSections: {
    contact: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: false,
    certifications: false,
    languages: false,
    volunteer: false,
    publications: false,
    awards: false,
    references: false
  },
  theme: {
    template: 'MinimalModern',
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#007BFF',
      background: '#FFFFFF',
      text: '#333333'
    },
    font: 'sans-serif'
  }
};

export const useResumeData = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);

  const updateResumeData = useCallback((updates: Partial<ResumeData>) => {
    setResumeData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateContact = useCallback((contact: Partial<ContactInfo>) => {
    setResumeData(prev => ({
      ...prev,
      contact: { ...prev.contact, ...contact }
    }));
  }, []);

  const updateWorkExperience = useCallback((index: number, experience: Partial<WorkExperience>) => {
    setResumeData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.map((exp, i) => 
        i === index ? { ...exp, ...experience } : exp
      )
    }));
  }, []);

  const addWorkExperience = useCallback(() => {
    const newId = Math.max(...resumeData.workExperiences.map(exp => exp.id)) + 1;
    const newExperience: WorkExperience = {
      id: newId,
      jobTitle: "",
      employer: "",
      location: "",
      remote: false,
      startDate: null,
      endDate: null,
      current: false,
      accomplishments: "",
    };
    
    setResumeData(prev => ({
      ...prev,
      workExperiences: [...prev.workExperiences, newExperience]
    }));
    
    return resumeData.workExperiences.length; // Return new index
  }, [resumeData.workExperiences]);

  const removeWorkExperience = useCallback((id: number) => {
    setResumeData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.filter(exp => exp.id !== id)
    }));
  }, []);

  const updateEducation = useCallback((education: Partial<Education>) => {
    setResumeData(prev => ({
      ...prev,
      education: { ...prev.education, ...education }
    }));
  }, []);

  const updateSkills = useCallback((skills: string[]) => {
    setResumeData(prev => ({
      ...prev,
      skills
    }));
  }, []);

  const addSkill = useCallback((skill: string) => {
    if (!resumeData.skills.includes(skill)) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  }, [resumeData.skills]);

  const removeSkill = useCallback((skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  }, []);

  const updateTheme = useCallback((theme: Partial<ResumeData['theme']>) => {
    setResumeData(prev => ({
      ...prev,
      theme: { ...prev.theme, ...theme }
    }));
  }, []);

  const updateSummary = useCallback((summary: string) => {
    setResumeData(prev => ({
      ...prev,
      summary
    }));
  }, []);

  const updateActiveSections = useCallback((activeSections: Partial<ActiveSections>) => {
    setResumeData(prev => ({
      ...prev,
      activeSections: { ...prev.activeSections, ...activeSections }
    }));
  }, []);

  const importResumeData = useCallback((importedData: Partial<ResumeData>) => {
    console.log('=== useResumeData.importResumeData ===');
    console.log('Importing data:', importedData);
    
    setResumeData(prev => {
      console.log('Current resumeData before import:', prev);
      
      // Enhanced work experience merging logic
      let mergedWorkExperiences = prev.workExperiences;
      
      if (importedData.workExperiences && importedData.workExperiences.length > 0) {
        console.log('=== VALIDATING IMPORTED WORK EXPERIENCES ===');
        console.log('importedData.workExperiences:', importedData.workExperiences);
        
        // Enhanced validation - check each experience in detail
        const validImportedExperiences = importedData.workExperiences.filter((exp, index) => {
          console.log(`Checking experience ${index}:`, exp);
          
          const hasJobTitle = exp.jobTitle && exp.jobTitle.toString().trim().length > 0;
          const hasEmployer = exp.employer && exp.employer.toString().trim().length > 0;
          const hasLocation = exp.location && exp.location.toString().trim().length > 0;
          const hasAccomplishments = exp.accomplishments && exp.accomplishments.toString().trim().length > 0;
          
          console.log(`  - Has jobTitle: ${hasJobTitle} ("${exp.jobTitle}")`);
          console.log(`  - Has employer: ${hasEmployer} ("${exp.employer}")`);
          console.log(`  - Has location: ${hasLocation} ("${exp.location}")`);
          console.log(`  - Has accomplishments: ${hasAccomplishments} (${exp.accomplishments?.length || 0} chars)`);
          
          // Consider valid if it has ANY meaningful content
          const isValid = hasJobTitle || hasEmployer || hasLocation || hasAccomplishments;
          console.log(`  - Experience ${index} is valid: ${isValid}`);
          
          return isValid;
        });
        
        console.log('Valid experiences after filtering:', validImportedExperiences.length);
        
        if (validImportedExperiences.length > 0) {
          console.log('Found valid imported work experiences:', validImportedExperiences.length);
          // Replace with imported experiences if they have actual data
          mergedWorkExperiences = validImportedExperiences.map((exp, index) => ({
            ...exp,
            id: exp.id || Date.now() + index, // Ensure unique IDs
          }));
          console.log('Merged work experiences:', mergedWorkExperiences);
        } else {
          console.log('No valid work experiences found in import, keeping existing');
          // Keep existing if imported are empty
        }
      } else {
        console.log('No work experiences in imported data, keeping existing');
      }
      
      // Enhanced education merging logic
      let mergedEducation = { ...prev.education };
      
      if (importedData.education) {
        // Only merge fields that have actual values
        Object.keys(importedData.education).forEach(key => {
          const value = importedData.education[key as keyof typeof importedData.education];
          if (value && value.toString().trim()) {
            mergedEducation[key as keyof typeof mergedEducation] = value;
          }
        });
        console.log('Merged education:', mergedEducation);
      }
      
      // Enhanced skills merging
      let mergedSkills = prev.skills;
      if (importedData.skills && importedData.skills.length > 0) {
        // Combine existing and imported skills, removing duplicates
        const combinedSkills = [...prev.skills, ...importedData.skills];
        mergedSkills = [...new Set(combinedSkills)]; // Remove duplicates
        console.log('Merged skills:', mergedSkills.length, 'total skills');
      }
      
      const newData = {
        ...prev,
        contact: {
          ...prev.contact,
          ...importedData.contact,
        },
        education: mergedEducation,
        workExperiences: mergedWorkExperiences,
        skills: mergedSkills,
        summary: importedData.summary && importedData.summary.trim() 
          ? importedData.summary 
          : prev.summary,
      };
      
      console.log('=== FINAL MERGED DATA ===');
      console.log('Work Experiences:', newData.workExperiences.length);
      console.log('Education:', newData.education);
      console.log('Skills:', newData.skills.length);
      console.log('Summary length:', newData.summary.length);
      
      return newData;
    });
  }, []);

  // Calculate resume completeness
  const resumeCompleteness = useMemo(() => {
    let completed = 0;
    const { contact, workExperiences, education, skills, summary } = resumeData;
    
    if (contact.firstName && contact.lastName) completed++;
    if (workExperiences.length > 0 && workExperiences[0].jobTitle && workExperiences[0].employer) completed++;
    if (education.school && education.degree) completed++;
    if (skills.length > 0) completed++;
    if (summary) completed++;
    
    return Math.round((completed / 5) * 100);
  }, [resumeData]);

  // Section validation functions
  const validateSection = useCallback((sectionIndex: number): boolean => {
    const sectionNames = ['heading', 'experience', 'education', 'skills', 'summary', 'finalize'];
    const sectionName = sectionNames[sectionIndex];
    
    switch (sectionName) {
      case 'heading':
        return !!(resumeData.contact.firstName && resumeData.contact.lastName && 
                 resumeData.contact.email && resumeData.contact.phone);
      case 'experience':
        return resumeData.workExperiences.length > 0 && 
               resumeData.workExperiences.some(exp => exp.jobTitle && exp.employer);
      case 'education':
        return !!(resumeData.education.school && resumeData.education.degree);
      case 'skills':
        return resumeData.skills.length >= 3;
      case 'summary':
        return true; // Summary is optional
      case 'finalize':
        return validateSection(0) && validateSection(1) && validateSection(2) && validateSection(3);
      default:
        return true;
    }
  }, [resumeData]);

  const getValidationErrors = useCallback((sectionIndex: number): string[] => {
    const sectionNames = ['heading', 'experience', 'education', 'skills', 'summary', 'finalize'];
    const sectionName = sectionNames[sectionIndex];
    const errors: string[] = [];
    
    switch (sectionName) {
      case 'heading':
        if (!resumeData.contact.firstName) errors.push('First name is required');
        if (!resumeData.contact.lastName) errors.push('Last name is required');
        if (!resumeData.contact.email) errors.push('Email is required');
        if (!resumeData.contact.phone) errors.push('Phone number is required');
        break;
      case 'experience':
        if (resumeData.workExperiences.length === 0) {
          errors.push('At least one work experience is required');
        } else if (!resumeData.workExperiences.some(exp => exp.jobTitle && exp.employer)) {
          errors.push('Please complete at least one work experience');
        }
        break;
      case 'education':
        if (!resumeData.education.school) errors.push('School name is required');
        if (!resumeData.education.degree) errors.push('Degree is required');
        break;
      case 'skills':
        if (resumeData.skills.length < 3) errors.push('At least 3 skills are recommended');
        break;
      case 'finalize':
        if (!validateSection(0)) errors.push('Complete the heading section');
        if (!validateSection(1)) errors.push('Complete the experience section');
        if (!validateSection(2)) errors.push('Complete the education section');
        if (!validateSection(3)) errors.push('Complete the skills section');
        break;
    }
    
    return errors;
  }, [resumeData, validateSection]);

  return {
    resumeData,
    resumeCompleteness,
    updateResumeData,
    updateContact,
    updateWorkExperience,
    addWorkExperience,
    removeWorkExperience,
    updateEducation,
    updateSkills,
    addSkill,
    removeSkill,
    updateTheme,
    updateSummary,
    updateActiveSections,
    importResumeData,
    validateSection,
    getValidationErrors,
  };
}; 