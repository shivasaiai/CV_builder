// Builder Components Barrel Export
export { default as BuilderSidebar } from './BuilderSidebar';
export { default as ResumePreview } from './ResumePreview';
export { default as SectionRenderer } from './SectionRenderer';
export { default as ResumeUpload } from './ResumeUpload';
export { default as IntegratedBuilder } from './IntegratedBuilder';

// Section Components
export { default as HeadingSection } from './sections/HeadingSection';
export { default as ExperienceSection } from './sections/ExperienceSection';
export { default as EducationSection } from './sections/EducationSection';
export { default as SkillsSection } from './sections/SkillsSection';
export { default as SummarySection } from './sections/SummarySection';
export { default as FinalizeSection } from './sections/FinalizeSection';

// Hooks
export { useBuilderState } from './hooks/useBuilderState';
export { useResumeData } from './hooks/useResumeData';
export { useTemplateManager } from './hooks/useTemplateManager';
export { useProgressTracking } from './hooks/useProgressTracking';
export { useAutoSave } from './hooks/useAutoSave';
export { useProgressiveNavigation } from './hooks/useProgressiveNavigation';
export { useScaleManager } from './hooks/useScaleManager';
export { useRealTimePreview } from './hooks/useRealTimePreview';

// Types and Constants
export type * from './types';
export { SECTIONS } from './types';

// Services
export { ResumeParser } from './services/ResumeParser';
export { EnhancedResumeParser } from './services/EnhancedResumeParser';
export type { ParsedResumeData } from './services/EnhancedResumeParser';
export { progressPersistence } from './services/ProgressPersistence';
export { TemplateCompatibilityService } from './services/TemplateCompatibilityService';
export type { TemplateCompatibility, TemplateFeatures } from './services/TemplateCompatibilityService';

// Progressive Flow Components
export * from './components/ProgressiveFlow';

// Enhanced Preview Components
export * from './components/EnhancedPreview';

// Error Management Components
export * from './components/ErrorManagement';

// User Guidance Components
export * from './components/UserGuidance'; 