import { useEffect } from 'react';
import CleanChromatic from "@/components/resume-templates/CleanChromatic";
import ContemporaryContrast from "@/components/resume-templates/ContemporaryContrast";
import TranquilChroma from "@/components/resume-templates/TranquilChroma";
import CreativeFlare from "@/components/resume-templates/CreativeFlare";
import ExecutiveProfessional from "@/components/resume-templates/ExecutiveProfessional";
import MinimalModern from "@/components/resume-templates/MinimalModern";
import ClassicTimeless from "@/components/resume-templates/ClassicTimeless";
import TechFocused from "@/components/resume-templates/TechFocused";
import CorporateElite from "@/components/resume-templates/CorporateElite";
import ModernGrid from "@/components/resume-templates/ModernGrid";
import CreativeEdge from "@/components/resume-templates/CreativeEdge";
import ProfessionalClean from "@/components/resume-templates/ProfessionalClean";
import IndustryStandard from "@/components/resume-templates/IndustryStandard";
import ModernMinimal from "@/components/resume-templates/ModernMinimal";
import Design7Template from "@/components/resume-templates/Design7Template";
import Design8Template from "@/components/resume-templates/Design8Template";
import Design9Template from "@/components/resume-templates/Design9Template";

export const AVAILABLE_TEMPLATES = {
  "Clean Chromatic": CleanChromatic,
  "Contemporary Contrast": ContemporaryContrast,
  "Tranquil Chroma": TranquilChroma,
  "Creative Flare": CreativeFlare,
  "Executive Professional": ExecutiveProfessional,
  "Minimal Modern": MinimalModern,
  "Classic Timeless": ClassicTimeless,
  "Tech Focused": TechFocused,
  "Corporate Elite": CorporateElite,
  "Modern Grid": ModernGrid,
  "Creative Edge": CreativeEdge,
  "Professional Clean": ProfessionalClean,
  "Industry Standard": IndustryStandard,
  "Modern Minimal": ModernMinimal,
  "Teal Professional": Design7Template,
  "Rose Circular": Design8Template,
  "Violet Geometric": Design9Template,
} as const;

export const useTemplateManager = (
  activeTemplate: string, 
  setActiveTemplate: (template: string) => void
) => {
  const templateNames = Object.keys(AVAILABLE_TEMPLATES);

  // Get selected template from URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const templateParam = urlParams.get('template');
    if (templateParam) {
      const decodedTemplate = decodeURIComponent(templateParam);
      if (AVAILABLE_TEMPLATES[decodedTemplate as keyof typeof AVAILABLE_TEMPLATES]) {
        setActiveTemplate(decodedTemplate);
      }
    }
  }, [setActiveTemplate]);

  const getTemplateComponent = (templateName: string) => {
    return AVAILABLE_TEMPLATES[templateName as keyof typeof AVAILABLE_TEMPLATES] || CleanChromatic;
  };

  const isValidTemplate = (templateName: string): boolean => {
    return templateName in AVAILABLE_TEMPLATES;
  };

  return {
    templateNames,
    getTemplateComponent,
    isValidTemplate,
    availableTemplates: AVAILABLE_TEMPLATES
  };
}; 