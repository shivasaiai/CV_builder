import React, { useState, useEffect, useCallback } from 'react';
import { ResumeData, TemplateColors } from '../../types';

interface LayoutConfig {
  previewPosition: 'top' | 'side';
  previewWidth: string;
  previewHeight: string;
  defaultZoom: number;
  builderPosition: 'bottom' | 'side';
  builderWidth: string;
  showSidebar: boolean;
  sidebarWidth: string;
}

interface ResponsiveLayoutManagerProps {
  children: React.ReactNode;
  previewComponent: React.ReactNode;
  sidebarComponent: React.ReactNode;
  layoutPreference?: 'top' | 'side';
  onLayoutChange?: (layout: 'top' | 'side') => void;
  className?: string;
}

const ResponsiveLayoutManager: React.FC<ResponsiveLayoutManagerProps> = ({
  children,
  previewComponent,
  sidebarComponent,
  layoutPreference = 'top',
  onLayoutChange,
  className = ''
}) => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    previewPosition: 'top',
    previewWidth: '100%',
    previewHeight: '500px',
    defaultZoom: 0.4,
    builderPosition: 'bottom',
    builderWidth: '100%',
    showSidebar: true,
    sidebarWidth: '320px'
  });

  // Detect screen size changes
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Update layout configuration based on screen size and preference
  useEffect(() => {
    const getOptimalLayout = (): LayoutConfig => {
      const baseConfig: LayoutConfig = {
        previewPosition: layoutPreference,
        previewWidth: '100%',
        previewHeight: '500px',
        defaultZoom: 0.4,
        builderPosition: layoutPreference === 'top' ? 'bottom' : 'side',
        builderWidth: '100%',
        showSidebar: true,
        sidebarWidth: '320px'
      };

      switch (screenSize) {
        case 'mobile':
          return {
            ...baseConfig,
            previewPosition: 'top', // Force top on mobile
            previewHeight: '400px',
            defaultZoom: 0.3,
            showSidebar: false, // Hide sidebar on mobile
            sidebarWidth: '0px'
          };

        case 'tablet':
          return {
            ...baseConfig,
            previewPosition: layoutPreference === 'side' ? 'top' : 'top', // Prefer top on tablet
            previewHeight: '450px',
            defaultZoom: 0.35,
            sidebarWidth: '280px'
          };

        case 'desktop':
          return {
            ...baseConfig,
            previewPosition: layoutPreference,
            previewHeight: layoutPreference === 'top' ? '500px' : '100vh',
            previewWidth: layoutPreference === 'side' ? '50%' : '100%',
            builderWidth: layoutPreference === 'side' ? '50%' : '100%',
            defaultZoom: 0.4,
            sidebarWidth: '320px'
          };

        default:
          return baseConfig;
      }
    };

    setLayoutConfig(getOptimalLayout());
  }, [screenSize, layoutPreference]);

  const handleLayoutToggle = useCallback(() => {
    const newLayout = layoutPreference === 'top' ? 'side' : 'top';
    onLayoutChange?.(newLayout);
  }, [layoutPreference, onLayoutChange]);

  // Top-positioned layout
  if (layoutConfig.previewPosition === 'top') {
    return (
      <div className={`flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 transition-all duration-300 ${className}`}>
        {/* Sidebar */}
        {layoutConfig.showSidebar && (
          <aside 
            className="flex-shrink-0 flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl z-10"
            style={{ width: layoutConfig.sidebarWidth }}
          >
            {sidebarComponent}
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col transition-all duration-300">
          {/* Top-positioned Preview */}
          <div 
            className="flex-shrink-0 border-b border-gray-200 bg-white"
            style={{ height: layoutConfig.previewHeight }}
          >
            <div className="h-full p-4">
              {previewComponent}
            </div>
          </div>

          {/* Builder Content Below */}
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Side-positioned layout (fallback to original layout)
  return (
    <div className={`flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 transition-all duration-300 ${className}`}>
      {/* Sidebar */}
      {layoutConfig.showSidebar && (
        <aside 
          className="flex-shrink-0 flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl z-10"
          style={{ width: layoutConfig.sidebarWidth }}
        >
          {sidebarComponent}
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 p-8 flex transition-all duration-300 gap-8">
        <div 
          className="flex-1 max-w-2xl"
          style={{ width: layoutConfig.builderWidth }}
        >
          {children}
        </div>

        {/* Side Preview */}
        <div 
          className="transform transition-all duration-300"
          style={{ width: layoutConfig.previewWidth === '50%' ? '400px' : '384px' }}
        >
          {previewComponent}
        </div>
      </main>
    </div>
  );
};

export default ResponsiveLayoutManager;