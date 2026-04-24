import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { TemplateGridSystem } from './TemplateGridSystem';
import { useTemplateGrid } from '../../hooks/useTemplateGrid';
import { ResumeData } from '../../types';

interface ResponsiveTemplateGridProps {
  selectedTemplate?: string;
  onTemplateSelect: (templateName: string) => void;
  resumeData?: ResumeData;
  className?: string;
  showHeader?: boolean;
  showStats?: boolean;
  enablePersistence?: boolean;
}

export const ResponsiveTemplateGrid: React.FC<ResponsiveTemplateGridProps> = ({
  selectedTemplate,
  onTemplateSelect,
  resumeData,
  className,
  showHeader = true,
  showStats = true,
  enablePersistence = true
}) => {
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  
  const {
    state,
    actions,
    filteredTemplates,
    categories,
    gridStats
  } = useTemplateGrid({
    persistState: enablePersistence,
    storageKey: 'responsive-template-grid'
  });

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('sm');
        actions.setGridColumns(1 as any); // Force single column on mobile
      } else if (width < 768) {
        setScreenSize('md');
        actions.setGridColumns(2);
      } else if (width < 1024) {
        setScreenSize('lg');
        actions.setGridColumns(2);
      } else {
        setScreenSize('xl');
        actions.setGridColumns(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [actions]);

  // Auto-adjust view mode based on screen size
  useEffect(() => {
    if (screenSize === 'sm' && state.viewMode === 'grid') {
      actions.setViewMode('list');
    }
  }, [screenSize, state.viewMode, actions]);

  const handleTemplateSelect = useCallback((templateName: string) => {
    onTemplateSelect(templateName);
    
    // Optional: Track template selection analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'template_selected', {
        template_name: templateName,
        view_mode: state.viewMode,
        category: state.selectedCategory,
        search_query: state.searchQuery
      });
    }
  }, [onTemplateSelect, state]);

  const getOptimalGridColumns = (): 2 | 3 | 4 => {
    switch (screenSize) {
      case 'sm':
        return 1 as any; // Will be handled as single column
      case 'md':
        return 2;
      case 'lg':
        return 2;
      case 'xl':
        return 3;
      default:
        return 3;
    }
  };

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header with Stats */}
      {showHeader && (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Choose Your Resume Template
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select from our collection of professional, ATS-friendly templates. 
              You can customize colors and switch templates anytime.
            </p>
          </div>

          {/* Stats */}
          {showStats && (
            <div className="flex flex-wrap justify-center gap-6 text-center">
              <div className="group">
                <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform duration-300">
                  {gridStats.totalTemplates}
                </div>
                <div className="text-sm text-muted-foreground">Templates</div>
              </div>
              <div className="group">
                <div className="text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">
                  100%
                </div>
                <div className="text-sm text-muted-foreground">ATS Friendly</div>
              </div>
              <div className="group">
                <div className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  {categories.length - 1}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="group">
                <div className="text-2xl font-bold text-purple-600 group-hover:scale-110 transition-transform duration-300">
                  ∞
                </div>
                <div className="text-sm text-muted-foreground">Customizations</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Template Grid */}
      <TemplateGridSystem
        selectedTemplate={selectedTemplate}
        onTemplateSelect={handleTemplateSelect}
        resumeData={resumeData}
        showSearch={true}
        showFilters={true}
        gridColumns={getOptimalGridColumns()}
        viewMode={state.viewMode}
        onViewModeChange={actions.setViewMode}
      />

      {/* Mobile-specific controls */}
      {screenSize === 'sm' && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={actions.toggleViewMode}
            className="bg-primary text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Toggle view mode"
          >
            {state.viewMode === 'grid' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Results info */}
      {gridStats.hasFilters && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {gridStats.filteredCount} of {gridStats.totalTemplates} templates
          {state.searchQuery && (
            <span> matching "{state.searchQuery}"</span>
          )}
          {state.selectedCategory !== 'all' && (
            <span> in {categories.find(c => c.id === state.selectedCategory)?.name}</span>
          )}
          <button
            onClick={actions.resetFilters}
            className="ml-2 text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ResponsiveTemplateGrid;