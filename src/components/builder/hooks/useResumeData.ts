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
    setResumeData(prev => {
      const newData = {
        ...prev,
        contact: {
          ...prev.contact,
          ...importedData.contact,
        },
        education: {
          ...prev.education,
          ...importedData.education,
        },
        workExperiences: importedData.workExperiences && importedData.workExperiences.length > 0 
          ? importedData.workExperiences 
          : [{
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
        skills: importedData.skills ? importedData.skills : prev.skills,
        summary: importedData.summary !== undefined ? importedData.summary : prev.summary,
      };
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
    updateSummary,
    updateActiveSections,
    importResumeData,
  };
}; 