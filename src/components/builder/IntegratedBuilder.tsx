import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ResumeData, TemplateColors } from './types';

// Enhanced Components - Lazy loaded for better performance
import BuilderSidebar from './BuilderSidebar';

const SimpleProgressFlow = lazy(() => import('./components/ProgressiveFlow/SimpleProgressFlow'));
const SimpleResumePreview = lazy(() => import('./components/EnhancedPreview/SimpleResumePreview'));
import TopPositionedPreview from './components/EnhancedPreview/TopPositionedPreview';
const ResponsiveLayoutManager = lazy(() => import('./components/Layout/ResponsiveLayoutManager'));
const ManualOverrideInterface = lazy(() => import('./components/ManualOverrideInterface'));

// Core Components
import ErrorBoundary from './components/ErrorManagement/ErrorBoundary';
import UserGuidanceProvider from './components/UserGuidance/UserGuidanceProvider';
import SectionRenderer from './SectionRenderer';
import ResumeUpload from './ResumeUpload';

// Enhanced Hooks
import { useBuilderState } from './hooks/useBuilderState';
import { useResumeData } from './hooks/useResumeData';
import { useTemplateManager } from './hooks/useTemplateManager';
import { useProgressTracking } from './hooks/useProgressTracking';
import { useAutoSave } from './hooks/useAutoSave';
import { useErrorHandler } from './hooks/useErrorHandler';
import { useUserGuidance } from './hooks/useUserGuidance';
import { useLayoutManager } from './hooks/useLayoutManager';

// Services
import { IntelligentDataPlacementService } from './services/IntelligentDataPlacementService';
import { TemplateCompatibilityService } from './services/TemplateCompatibilityService';
import { progressPersistence } from './services/ProgressPersistence';

// Performance utilities
import { usePerformanceMonitor, debounce } from './utils/performance';

interface IntegratedBuilderProps {
  sessionId?: string;
}

const IntegratedBuilder: React.FC<IntegratedBuilderProps> = ({ sessionId }) => {
  const { sessionId: urlSessionId } = useParams();
  const [searchParams] = useSearchParams();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showManualOverride, setShowManualOverride] = useState(false);
  const [uncertainPlacements, setUncertainPlacements] = useState<any[]>([]);

  const effectiveSessionId = sessionId || urlSessionId;
  const userType = searchParams.get('userType') || 'experienced';
  const allowResumeUpload = userType !== 'fresher';

  // Layout Management
  const {
    layoutPreference,
    changeLayoutPreference,
    layoutConfig,
    isTopLayout,
    canSwitchLayout,
    getBreakpointInfo
  } = useLayoutManager({
    initialLayout: 'top',
    sessionId: effectiveSessionId,
    persistPreferences: true
  });

  // Enhanced State Management
  const {
    builderState,
    updateBuilderState,
    setActiveSection,
    setActiveTemplate,
    setTemplateColors,
    goToNextSection,
    goToPreviousSection,
    toggleColorEditor,
  } = useBuilderState();

  const {
    resumeData,
    resumeCompleteness,
    updateResumeData,
    importResumeData,
    validateSection,
    getValidationErrors,
    updateTheme,
  } = useResumeData();

  const { templateNames, templateFeatures } = useTemplateManager(
    builderState.activeTemplate,
    setActiveTemplate
  );

  // Progress Tracking
  const {
    progressState,
    updateSectionProgress,
    markSectionComplete,
    getSectionStatus,
    getOverallProgress,
  } = useProgressTracking({
    resumeData,
    currentSection: builderState.activeIndex,
    sessionId: effectiveSessionId
  });

  // Auto-save functionality
  useAutoSave({
    sessionId: effectiveSessionId || '',
    resumeData,
    builderState,
    progressState
  });

  // Error handling
  const { handleError, clearErrors, errors } = useErrorHandler();

  // User guidance
  const { 
    showGuidance, 
    currentGuidance, 
    dismissGuidance,
    requestGuidance 
  } = useUserGuidance();

  // Performance monitoring
  const { startMeasure, endMeasure, measureAsync } = usePerformanceMonitor();

  // Handle URL parameters on mount
  useEffect(() => {
    const colorParam = searchParams.get('color');
    const templateParam = searchParams.get('template');
    
    if (colorParam) {
      const decodedColor = decodeURIComponent(colorParam);
      setTemplateColors({
        ...builderState.templateColors,
        primary: decodedColor
      });
    }
    
    if (templateParam) {
      const decodedTemplate = decodeURIComponent(templateParam);
      if (templateNames.includes(decodedTemplate)) {
        setActiveTemplate(decodedTemplate);
      }
    }
  }, [searchParams, templateNames, builderState.templateColors, setTemplateColors, setActiveTemplate]);

  // Load saved progress on mount
  useEffect(() => {
    if (effectiveSessionId) {
      const savedProgress = progressPersistence.loadProgress(effectiveSessionId);
      if (savedProgress) {
        // For now, just log that progress was found
        // The actual restoration logic can be implemented later
        console.log('Saved progress found:', savedProgress);
      }
    }
  }, [effectiveSessionId]);

  // Navigation handlers with enhanced validation
  const handleSectionClick = useCallback((index: number) => {
    const currentSectionValid = validateSection(builderState.activeIndex);
    if (!currentSectionValid) {
      const errors = getValidationErrors(builderState.activeIndex);
      handleError({
        type: 'validation',
        message: 'Please complete the current section before proceeding',
        details: errors
      });
      return;
    }
    
    setActiveSection(index);
    updateSectionProgress(index, 'in_progress');
  }, [builderState.activeIndex, validateSection, getValidationErrors, handleError, setActiveSection, updateSectionProgress]);

  const handleTemplateChange = useCallback(debounce((template: string) => {
    startMeasure('template-change');
    
    // Check template compatibility
    const compatibility = TemplateCompatibilityService.checkCompatibility(template, resumeData);
    
    if (!compatibility.isCompatible) {
      handleError({
        type: 'template_compatibility',
        message: 'This template may not display all your data correctly',
        details: compatibility.warnings
      });
    }
    
    setActiveTemplate(template);
    endMeasure('template-change');
  }, 300), [resumeData, handleError, setActiveTemplate, startMeasure, endMeasure]);

  const handleNext = useCallback(() => {
    const currentSectionValid = validateSection(builderState.activeIndex);
    if (currentSectionValid) {
      markSectionComplete(builderState.activeIndex);
      goToNextSection();
    } else {
      const errors = getValidationErrors(builderState.activeIndex);
      handleError({
        type: 'validation',
        message: 'Please complete all required fields',
        details: errors
      });
    }
  }, [builderState.activeIndex, validateSection, markSectionComplete, goToNextSection, getValidationErrors, handleError]);

  const handleBack = useCallback(() => {
    goToPreviousSection();
  }, [goToPreviousSection]);

  const handleUploadClick = useCallback(() => {
    setShowUploadModal(true);
  }, []);

  const handleResumeUploaded = useCallback(async (importedData: Partial<ResumeData>) => {
    try {
      console.log('=== IntegratedBuilder.handleResumeUploaded ===');
      console.log('Received importedData:', importedData);

      // Use intelligent data placement service with performance monitoring
      const placementResult = await measureAsync('data-placement', async () => {
        return await IntelligentDataPlacementService.processImportedData(importedData);
      });
      
      if (placementResult.uncertainPlacements.length > 0) {
        setUncertainPlacements(placementResult.uncertainPlacements);
        setShowManualOverride(true);
      }

      // Import the processed data
      importResumeData(placementResult.processedData);
      setShowUploadModal(false);
      
      // Navigate to first section to review imported data
      setActiveSection(0);
      updateSectionProgress(0, 'in_progress');
      
      console.log('Successfully processed and imported resume data');
    } catch (error) {
      handleError({
        type: 'import',
        message: 'Failed to process uploaded resume',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [importResumeData, setActiveSection, updateSectionProgress, handleError, measureAsync]);

  const handleCloseUpload = useCallback(() => {
    setShowUploadModal(false);
  }, []);

  const handleManualOverrideComplete = useCallback((finalData: Partial<ResumeData>) => {
    importResumeData(finalData);
    setShowManualOverride(false);
    setUncertainPlacements([]);
  }, [importResumeData]);

  const handleManualOverrideCancel = useCallback(() => {
    setShowManualOverride(false);
    setUncertainPlacements([]);
  }, []);

  // Render sidebar component
  const sidebarComponent = (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    }>
      <BuilderSidebar
        activeIndex={builderState.activeIndex}
        resumeCompleteness={resumeCompleteness}
        resumeData={resumeData}
        finalizeCompleted={!!builderState.finalizeCompleted}
        onSectionClick={handleSectionClick}
        onThemeChange={updateTheme}
        onUploadClick={allowResumeUpload ? handleUploadClick : undefined}
        errors={errors}
        showGuidance={showGuidance}
        onRequestGuidance={requestGuidance}
        useProgressiveFlow={true}
        sections={progressState.sections.map(s => ({ name: s.name, status: s.status }))}
      />
    </Suspense>
  );

  // Render preview component
  const previewComponent = (
    <TopPositionedPreview
      resumeData={resumeData}
      activeTemplate={builderState.activeTemplate}
      templateColors={builderState.templateColors}
      showColorEditor={builderState.showColorEditor}
      onTemplateChange={handleTemplateChange}
      onColorChange={setTemplateColors}
      onToggleColorEditor={toggleColorEditor}
      className="h-full"
      errors={errors}
      onError={handleError}
      layoutPreference={layoutPreference}
      onLayoutChange={canSwitchLayout ? changeLayoutPreference : undefined}
      sessionId={effectiveSessionId}
    />
  );

  // Main builder content
  const builderContent = (
    <>
      <div className="mb-8">
        <button 
          onClick={handleBack} 
          className={`text-blue-500 hover:text-blue-600 transition-all duration-200 transform hover:scale-105 ${
            builderState.activeIndex === 0 
              ? 'opacity-50 cursor-not-allowed hover:scale-100' 
              : 'hover:translate-x-1'
          }`}
          disabled={builderState.activeIndex === 0}
        >
          ← Go Back
        </button>
      </div>

      <div className="animate-fadeIn">
        <SectionRenderer
          activeSection={progressState.sections[builderState.activeIndex]}
          resumeData={resumeData}
          builderState={builderState}
          updateResumeData={updateResumeData}
          updateBuilderState={updateBuilderState}
          onNext={handleNext}
          onBack={handleBack}
          onUploadClick={allowResumeUpload ? handleUploadClick : undefined}
          validationErrors={getValidationErrors(builderState.activeIndex)}
          sectionStatus={getSectionStatus(builderState.activeIndex)}
          onSectionComplete={() => markSectionComplete(builderState.activeIndex)}
        />
      </div>
    </>
  );

  try {
    console.log('IntegratedBuilder rendering...', { effectiveSessionId, builderState, resumeData });
  } catch (e) {
    console.error('IntegratedBuilder pre-render error:', e);
  }

  return (
    <ErrorBoundary onError={handleError}>
      <UserGuidanceProvider>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading resume builder...</p>
            </div>
          </div>
        }>
          <ResponsiveLayoutManager
            previewComponent={previewComponent}
            sidebarComponent={sidebarComponent}
            layoutPreference={layoutPreference}
            onLayoutChange={canSwitchLayout ? changeLayoutPreference : undefined}
          >
            {builderContent}
          </ResponsiveLayoutManager>
        </Suspense>

        {/* Resume Upload Modal */}
        <ResumeUpload
          isOpen={showUploadModal}
          onResumeUploaded={handleResumeUploaded}
          onClose={handleCloseUpload}
        />

        {/* Manual Override Interface */}
        {showManualOverride && (
          <Suspense fallback={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            </div>
          }>
            <ManualOverrideInterface
              uncertainFields={uncertainPlacements}
              extractedData={resumeData}
              onDataUpdate={updateResumeData}
              onConfirm={() => handleManualOverrideComplete(resumeData)}
              onCancel={handleManualOverrideCancel}
              isVisible={showManualOverride}
            />
          </Suspense>
        )}

        {/* User Guidance Overlay */}
        {showGuidance && currentGuidance && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guidance-title"
            aria-describedby="guidance-description"
          >
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 animate-bounceIn shadow-2xl">
              <h3 
                id="guidance-title" 
                className="text-lg font-semibold mb-2 text-gray-900"
              >
                {currentGuidance.title}
              </h3>
              <p 
                id="guidance-description" 
                className="text-gray-600 mb-4"
              >
                {currentGuidance.message}
              </p>
              {currentGuidance.actions && (
                <div className="flex space-x-2 mb-4">
                  {currentGuidance.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        action.handler();
                        dismissGuidance();
                      }}
                      className={`px-4 py-2 rounded transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        action.primary 
                          ? 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500' 
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500'
                      }`}
                      autoFocus={action.primary}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
        <button
          onClick={dismissGuidance}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded px-2 py-1"
          aria-label="Dismiss guidance"
        >
          Dismiss
        </button>
      </div>
    </div>
  )}
      </UserGuidanceProvider>
    </ErrorBoundary>
  );
};

export default IntegratedBuilder;