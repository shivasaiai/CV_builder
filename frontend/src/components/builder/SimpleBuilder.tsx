import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Palette, LayoutGrid, Download, Upload, ChevronDown } from 'lucide-react';
import BuilderSidebar from './BuilderSidebar';
import SectionRenderer from './SectionRenderer';
import ResumeUpload from './ResumeUpload';
import TopPositionedPreview from './components/EnhancedPreview/TopPositionedPreview';
import SimpleTemplateModal from './components/SimpleTemplateModal';
import SimpleColorPicker from './components/SimpleColorPicker';
import { useBuilderState } from './hooks/useBuilderState';
import { useResumeData } from './hooks/useResumeData';
import { useTemplateManager } from './hooks/useTemplateManager';
import { ResumeData } from './types';
import { SECTIONS } from './types';

interface SimpleBuilderProps {
    sessionId?: string;
}

const SimpleBuilder: React.FC<SimpleBuilderProps> = ({ sessionId }) => {
    const { sessionId: urlSessionId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showTemplateGrid, setShowTemplateGrid] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showValidationErrors, setShowValidationErrors] = useState(false);
    const [isTemplateChanging, setIsTemplateChanging] = useState(false);
    const previewPanelRef = useRef<HTMLDivElement>(null);
    const [previewHeight, setPreviewHeight] = useState<number>(700);

    const userType = searchParams.get('userType') || 'experienced';
    const allowResumeUpload = userType !== 'fresher';

    const effectiveSessionId = sessionId || urlSessionId || 'default';

    // State management
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
    } = useResumeData();

    const { templateNames } = useTemplateManager(
        builderState.activeTemplate,
        setActiveTemplate
    );

    // Auto-fit preview height to the available panel space
    useEffect(() => {
        const recalc = () => {
            if (!previewPanelRef.current) return;
            const rect = previewPanelRef.current.getBoundingClientRect();
            // subtract the preview header (~56px) + internal padding
            setPreviewHeight(Math.max(480, rect.height - 16));
        };
        recalc();
        const ro = new ResizeObserver(recalc);
        if (previewPanelRef.current) ro.observe(previewPanelRef.current);
        window.addEventListener('resize', recalc);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', recalc);
        };
    }, []);

    // Handle resume upload
    const handleResumeUploaded = useCallback(async (uploadedData: Partial<ResumeData>) => {
        try {
            await importResumeData(uploadedData);
            setShowUploadModal(false);
        } catch (error) {
            console.error('Error importing resume data:', error);
        }
    }, [importResumeData]);

    // Navigation handlers
    const handleSectionClick = useCallback((index: number) => {
        const currentIndex = builderState.activeIndex;
        if (index <= currentIndex) {
            setShowValidationErrors(false);
            setActiveSection(index);
            return;
        }
        const canAdvanceFromCurrent = validateSection(currentIndex);
        if (!canAdvanceFromCurrent || index !== currentIndex + 1) {
            setShowValidationErrors(true);
            return;
        }
        setShowValidationErrors(false);
        setActiveSection(index);
    }, [builderState.activeIndex, setActiveSection, validateSection]);

    const handleNext = useCallback(() => {
        const currentIndex = builderState.activeIndex;
        const canAdvanceFromCurrent = validateSection(currentIndex);
        if (!canAdvanceFromCurrent) {
            setShowValidationErrors(true);
            return;
        }
        setShowValidationErrors(false);
        goToNextSection();
    }, [builderState.activeIndex, goToNextSection, validateSection]);

    const handleBack = useCallback(() => {
        setShowValidationErrors(false);
        goToPreviousSection();
    }, [goToPreviousSection]);

    // Theme change handler
    const handleThemeChange = useCallback((theme: Partial<ResumeData['theme']>) => {
        if (theme.colors) {
            setTemplateColors(theme.colors);
        }
        if (theme.template) {
            setActiveTemplate(theme.template);
        }
    }, [setTemplateColors, setActiveTemplate]);

    // Template change handler with smooth transition
    const handleTemplateChange = useCallback((templateId: string) => {
        setIsTemplateChanging(true);
        setActiveTemplate(templateId);
        setTimeout(() => setIsTemplateChanging(false), 400);
    }, [setActiveTemplate]);

    const currentSection = SECTIONS[builderState.activeIndex];
    const stepNumber = builderState.activeIndex + 1;
    const totalSteps = SECTIONS.length;

    // Close color picker when clicking outside
    useEffect(() => {
        if (!showColorPicker) return;
        const handler = (e: MouseEvent) => {
            const t = e.target as HTMLElement;
            if (!t.closest('[data-color-picker]') && !t.closest('[data-color-trigger]')) {
                setShowColorPicker(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showColorPicker]);

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                        <ResumeUpload
                            onResumeUploaded={handleResumeUploaded}
                            onClose={() => setShowUploadModal(false)}
                            isOpen={showUploadModal}
                        />
                    </div>
                </div>
            )}

            {/* Template picker modal */}
            <SimpleTemplateModal
                isOpen={showTemplateGrid}
                onClose={() => setShowTemplateGrid(false)}
                currentTemplate={builderState.activeTemplate}
                resumeData={resumeData}
                templateColors={builderState.templateColors}
                onTemplateSelect={handleTemplateChange}
            />

            {/* Top toolbar */}
            <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">
                        Step <span className="font-semibold text-gray-900">{stepNumber}</span> of{' '}
                        <span className="font-semibold text-gray-900">{totalSteps}</span>
                    </div>
                    <div className="hidden md:block h-5 w-px bg-gray-200" />
                    <div className="hidden md:flex items-center gap-2">
                        <span className="text-sm text-gray-500">Template:</span>
                        <button
                            onClick={() => setShowTemplateGrid(true)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm font-medium text-gray-800 transition"
                        >
                            {builderState.activeTemplate}
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {allowResumeUpload && (
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                            <Upload className="w-4 h-4" /> Upload resume
                        </button>
                    )}

                    {/* Colors */}
                    <div className="relative">
                        <button
                            data-color-trigger
                            onClick={() => setShowColorPicker((v) => !v)}
                            className={
                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition ' +
                                (showColorPicker
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50')
                            }
                        >
                            <Palette className="w-4 h-4" /> Colors
                        </button>
                        {showColorPicker && (
                            <div
                                data-color-picker
                                className="absolute right-0 top-11 z-40"
                            >
                                <SimpleColorPicker
                                    resumeData={resumeData}
                                    onThemeChange={handleThemeChange}
                                    onClose={() => setShowColorPicker(false)}
                                    className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64"
                                />
                            </div>
                        )}
                    </div>

                    {/* Template gallery */}
                    <button
                        onClick={() => setShowTemplateGrid(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                    >
                        <LayoutGrid className="w-4 h-4" /> Template
                    </button>

                    {/* Download */}
                    <button
                        onClick={() => {
                            // Jump to finalize section (last)
                            setActiveSection(SECTIONS.length - 1);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Download
                    </button>
                </div>
            </header>

            {/* Main 3-column layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left sidebar */}
                <aside className="w-64 bg-slate-900 text-white flex-shrink-0 overflow-y-auto">
                    <BuilderSidebar
                        activeIndex={builderState.activeIndex}
                        resumeCompleteness={resumeCompleteness}
                        resumeData={resumeData}
                        finalizeCompleted={!!builderState.finalizeCompleted}
                        onSectionClick={handleSectionClick}
                        onThemeChange={handleThemeChange}
                        onUploadClick={allowResumeUpload ? () => setShowUploadModal(true) : undefined}
                    />
                </aside>

                {/* Form area */}
                <main className="flex-1 bg-white overflow-y-auto">
                    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-8">
                        <SectionRenderer
                            activeSection={currentSection}
                            resumeData={resumeData}
                            builderState={builderState}
                            updateResumeData={updateResumeData}
                            updateBuilderState={updateBuilderState}
                            onNext={handleNext}
                            onBack={handleBack}
                            onUploadClick={allowResumeUpload ? () => setShowUploadModal(true) : undefined}
                            validationErrors={showValidationErrors ? getValidationErrors(builderState.activeIndex) : []}
                        />
                    </div>
                </main>

                {/* Right preview panel */}
                <aside className="hidden lg:flex w-[520px] xl:w-[580px] bg-gray-100 border-l border-gray-200 flex-col flex-shrink-0">
                    {/* Preview header */}
                    <div className="h-10 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-xs font-medium text-gray-700">Live Preview</span>
                        </div>
                        <span className="text-[11px] text-gray-500 truncate max-w-[200px]">
                            {builderState.activeTemplate}
                        </span>
                    </div>

                    {/* Preview canvas */}
                    <div ref={previewPanelRef} className="flex-1 p-3 overflow-hidden">
                        <div className="h-full relative">
                            {isTemplateChanging && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                                    <div className="flex flex-col items-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
                                        <p className="text-sm text-gray-600">Switching template...</p>
                                    </div>
                                </div>
                            )}
                            <div className={`h-full transition-opacity duration-300 ${isTemplateChanging ? 'opacity-30' : 'opacity-100'}`}>
                                <TopPositionedPreview
                                    resumeData={resumeData}
                                    activeTemplate={builderState.activeTemplate}
                                    templateColors={builderState.templateColors}
                                    onTemplateChange={setActiveTemplate}
                                    className="h-full"
                                    fixedHeight={previewHeight}
                                    key={builderState.activeTemplate}
                                />
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default SimpleBuilder;
