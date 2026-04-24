// Progressive Flow Types

export type SectionStatus = 'not_started' | 'in_progress' | 'completed';

export interface SectionProgress {
  id: string;
  name: string;
  status: SectionStatus;
  required: boolean;
  validationErrors: string[];
  completionPercentage: number;
}

export interface ProgressionState {
  sections: SectionProgress[];
  currentSection: number;
  completionPercentage: number;
  visualState: VisualFlowState;
}

export interface VisualFlowState {
  animationsEnabled: boolean;
  showConnectingLines: boolean;
  theme: 'light' | 'dark';
}

export interface ProgressFlowProps {
  sections: SectionProgress[];
  currentSection: number;
  onSectionClick: (index: number) => void;
  showConnectingLines?: boolean;
  animationEnabled?: boolean;
  className?: string;
}

export interface SectionIndicatorProps {
  section: SectionProgress;
  index: number;
  isActive: boolean;
  isClickable: boolean;
  onClick: (index: number) => void;
  showConnectingLine?: boolean;
  isLastSection?: boolean;
}