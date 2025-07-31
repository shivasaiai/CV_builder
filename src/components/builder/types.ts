// Builder Component Types

export interface ContactInfo {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  summary?: string;
  linkedin?: string;
  website?: string;
}

export interface WorkExperience {
  id: number;
  jobTitle: string;
  employer: string;
  location: string;
  remote: boolean;
  startDate: Date | null;
  endDate: Date | null;
  current: boolean;
  accomplishments: string;
}

export interface Education {
  school: string;
  location: string;
  degree: string;
  field: string;
  gradYear: string;
  gradMonth: string;
}

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface ActiveSections {
  contact: boolean;
  summary: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  projects: boolean;
  certifications: boolean;
  languages: boolean;
  volunteer: boolean;
  publications: boolean;
  awards: boolean;
  references: boolean;
}

export interface ResumeData {
  contact: ContactInfo;
  workExperiences: WorkExperience[];
  education: Education;
  skills: string[];
  summary: string;
  projects: unknown[];
  certifications: unknown[];
  languages: unknown[];
  volunteerExperiences: unknown[];
  publications: unknown[];
  awards: unknown[];
  references: unknown[];
  activeSections: ActiveSections;
}

export interface BuilderState {
  activeIndex: number;
  activeTemplate: string;
  resumeCompleteness: number;
  educationStep: number;
  experienceStep: number;
  currentWorkIndex: number;
  searchQuery: string;
  degreeSearchQuery: string;
  showDegreeDropdown: boolean;
  showTemplateSelector: boolean;
  showColorEditor: boolean;
  showWorkRec: boolean;
  showSummaryRec: boolean;
  templateColors: TemplateColors;
  scale: number;
}

export interface SectionProps {
  resumeData: ResumeData;
  builderState: BuilderState;
  updateResumeData: (data: Partial<ResumeData>) => void;
  updateBuilderState: (state: Partial<BuilderState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export type SectionType = 'Heading' | 'Experience' | 'Education' | 'Skills' | 'Summary' | 'Finalize';

export const SECTIONS: SectionType[] = [
  'Heading',
  'Experience', 
  'Education',
  'Skills',
  'Summary',
  'Finalize'
] as const; 