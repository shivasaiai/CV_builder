import { useState, useCallback } from 'react';
import { BuilderState, TemplateColors } from '../types';
import { DEFAULT_TEMPLATE_COLORS } from '../constants';

const initialBuilderState: BuilderState = {
  activeIndex: 0,
  activeTemplate: "Clean Chromatic",
  resumeCompleteness: 0,
  educationStep: 1,
  experienceStep: 1,
  currentWorkIndex: 0,
  searchQuery: "",
  degreeSearchQuery: "",
  showDegreeDropdown: false,
  showTemplateSelector: false,
  showColorEditor: false,
  showWorkRec: false,
  showSummaryRec: false,
  templateColors: DEFAULT_TEMPLATE_COLORS,
  scale: 1,
};

export const useBuilderState = () => {
  const [builderState, setBuilderState] = useState<BuilderState>(initialBuilderState);

  const updateBuilderState = useCallback((updates: Partial<BuilderState>) => {
    setBuilderState(prev => ({ ...prev, ...updates }));
  }, []);

  const setActiveSection = useCallback((index: number) => {
    setBuilderState(prev => ({ ...prev, activeIndex: index }));
  }, []);

  const setActiveTemplate = useCallback((template: string) => {
    setBuilderState(prev => ({ ...prev, activeTemplate: template }));
  }, []);

  const setTemplateColors = useCallback((colors: TemplateColors) => {
    setBuilderState(prev => ({ ...prev, templateColors: colors }));
  }, []);

  const goToNextSection = useCallback(() => {
    setBuilderState(prev => ({
      ...prev,
      activeIndex: Math.min(prev.activeIndex + 1, 5) // 5 is max section index
    }));
  }, []);

  const goToPreviousSection = useCallback(() => {
    setBuilderState(prev => ({
      ...prev,
      activeIndex: Math.max(prev.activeIndex - 1, 0)
    }));
  }, []);

  const toggleWorkRecommendations = useCallback(() => {
    setBuilderState(prev => ({ ...prev, showWorkRec: !prev.showWorkRec }));
  }, []);

  const toggleSummaryRecommendations = useCallback(() => {
    setBuilderState(prev => ({ ...prev, showSummaryRec: !prev.showSummaryRec }));
  }, []);

  const toggleTemplateSelector = useCallback(() => {
    setBuilderState(prev => ({ ...prev, showTemplateSelector: !prev.showTemplateSelector }));
  }, []);

  const toggleColorEditor = useCallback(() => {
    setBuilderState(prev => ({ ...prev, showColorEditor: !prev.showColorEditor }));
  }, []);

  return {
    builderState,
    updateBuilderState,
    setActiveSection,
    setActiveTemplate,
    setTemplateColors,
    goToNextSection,
    goToPreviousSection,
    toggleWorkRecommendations,
    toggleSummaryRecommendations,
    toggleTemplateSelector,
    toggleColorEditor,
  };
}; 