import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnhancedResumePreview } from '@/components/builder/components/EnhancedPreview/EnhancedResumePreview';
import { PreviewContainer } from '@/components/builder/components/EnhancedPreview/PreviewContainer';
import { TemplateSelector } from '@/components/builder/components/EnhancedPreview/TemplateSelector';

// Mock resume data
const mockResumeData = {
  contact: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/johndoe',
    website: 'johndoe.dev'
  },
  workExperiences: [
    {
      jobTitle: 'Senior Software Engineer',
      company: 'Tech Corp',
      startDate: '2021-01',
      endDate: 'Present',
      description: 'Led development of web applications',
      location: 'San Francisco, CA'
    }
  ],
  education: {
    school: 'University of Technology',
    degree: 'Bachelor of Science in Computer Science',
    gradYear: '2020',
    gpa: '3.8',
    location: 'California'
  },
  skills: ['JavaScript', 'React', 'Node.js', 'Python'],
  summary: 'Experienced software engineer with expertise in web development'
};

const mockTemplates = [
  { id: 'modern', name: 'Modern', category: 'professional' },
  { id: 'classic', name: 'Classic', category: 'traditional' },
  { id: 'creative', name: 'Creative', category: 'design' }
];

describe('EnhancedResumePreview Component', () => {
  const mockOnTemplateChange = vi.fn();
  const mockOnScaleChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render preview container with resume content', () => {
      render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      expect(screen.getByTestId('enhanced-preview-container')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@email.com')).toBeInTheDocument();
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    });

    it('should render with correct template styling', () => {
      render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      const previewContent = screen.getByTestId('preview-content');
      expect(previewContent).toHaveClass('template-modern');
    });

    it('should apply correct scale transformation', () => {
      render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={0.8}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      const previewContent = screen.getByTestId('preview-content');
      expect(previewContent).toHaveStyle('transform: scale(0.8)');
    });

    it('should show loading state during template switching', async () => {
      const { rerender } = render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      // Simulate template change
      rerender(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="classic"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
          isLoading={true}
        />
      );

      expect(screen.getByTestId('preview-loading')).toBeInTheDocument();
      expect(screen.getByText('Switching template...')).toBeInTheDocument();
    });
  });

  describe('zoom and scale controls', () => {
    it('should render zoom controls', () => {
      render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      expect(screen.getByTestId('zoom-controls')).toBeInTheDocument();
      expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
      expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
      expect(screen.getByLabelText('Reset zoom')).toBeInTheDocument();
    });

    it('should handle zoom in action', async () => {
      const user = userEvent.setup();
      
      render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      const zoomInButton = screen.getByLabelText('Zoom in');
      await user.click(zoomInButton);

      expect(mockOnScaleChange).toHaveBeenCalledWith(1.1);
    });

    it('should handle zoom out action', async () => {
      const user = userEvent.setup();
      
      render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      const zoomOutButton = screen.getByLabelText('Zoom out');
      await user.click(zoomOutButton);

      expect(mockOnScaleChange).toHaveBeenCalledWith(0.9);
    });

    it('should handle reset zoom action', async () => {
      const user = userEvent.setup();
      
      render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1.5}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      const resetZoomButton = screen.getByLabelText('Reset zoom');
      await user.click(resetZoomButton);

      expect(mockOnScaleChange).toHaveBeenCalledWith(1);
    });

    it('should disable zoom in at maximum scale', () => {
      render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={2} // Maximum scale
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      const zoomInButton = screen.getByLabelText('Zoom in');
      expect(zoomInButton).toBeDisabled();
    });

    it('should disable zoom out at minimum scale', () => {
      render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={0.5} // Minimum scale
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      const zoomOutButton = screen.getByLabelText('Zoom out');
      expect(zoomOutButton).toBeDisabled();
    });
  });

  describe('template switching', () => {
    it('should render template selector', () => {
      render(
        <TemplateSelector
          templates={mockTemplates}
          selectedTemplate="modern"
          onTemplateChange={mockOnTemplateChange}
        />
      );

      expect(screen.getByTestId('template-selector')).toBeInTheDocument();
      expect(screen.getByText('Modern')).toBeInTheDocument();
      expect(screen.getByText('Classic')).toBeInTheDocument();
      expect(screen.getByText('Creative')).toBeInTheDocument();
    });

    it('should highlight selected template', () => {
      render(
        <TemplateSelector
          templates={mockTemplates}
          selectedTemplate="modern"
          onTemplateChange={mockOnTemplateChange}
        />
      );

      const modernTemplate = screen.getByTestId('template-option-modern');
      expect(modernTemplate).toHaveClass('selected');
    });

    it('should handle template selection', async () => {
      const user = userEvent.setup();
      
      render(
        <TemplateSelector
          templates={mockTemplates}
          selectedTemplate="modern"
          onTemplateChange={mockOnTemplateChange}
        />
      );

      const classicTemplate = screen.getByTestId('template-option-classic');
      await user.click(classicTemplate);

      expect(mockOnTemplateChange).toHaveBeenCalledWith('classic');
    });

    it('should show template preview thumbnails', () => {
      render(
        <TemplateSelector
          templates={mockTemplates}
          selectedTemplate="modern"
          onTemplateChange={mockOnTemplateChange}
        />
      );

      mockTemplates.forEach(template => {
        const thumbnail = screen.getByTestId(`template-thumbnail-${template.id}`);
        expect(thumbnail).toBeInTheDocument();
      });
    });
  });

  describe('responsive behavior', () => {
    it('should adapt preview container to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <PreviewContainer scale={1} isLoading={false}>
          <div>Preview content</div>
        </PreviewContainer>
      );

      const container = screen.getByTestId('preview-container');
      expect(container).toHaveClass('mobile-preview');
    });

    it('should adjust scale for mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      const previewContent = screen.getByTestId('preview-content');
      // Should apply mobile-specific scaling
      expect(previewContent).toHaveStyle('transform: scale(0.7)');
    });

    it('should hide zoom controls on very small screens', () => {
      // Mock very small viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      const zoomControls = screen.queryByTestId('zoom-controls');
      expect(zoomControls).not.toBeInTheDocument();
    });
  });

  describe('scrolling and overflow handling', () => {
    it('should handle vertical overflow with scrolling', () => {
      render(
        <PreviewContainer scale={1} isLoading={false}>
          <div style={{ height: '2000px' }}>Very tall content</div>
        </PreviewContainer>
      );

      const container = screen.getByTestId('preview-container');
      expect(container).toHaveStyle('overflow-y: auto');
    });

    it('should maintain scroll position during template changes', async () => {
      const { rerender } = render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      const container = screen.getByTestId('preview-container');
      
      // Simulate scrolling
      fireEvent.scroll(container, { target: { scrollTop: 100 } });
      expect(container.scrollTop).toBe(100);

      // Change template
      rerender(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="classic"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      // Scroll position should be maintained
      expect(container.scrollTop).toBe(100);
    });
  });

  describe('real-time updates', () => {
    it('should update preview when resume data changes', async () => {
      const { rerender } = render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();

      // Update resume data
      const updatedResumeData = {
        ...mockResumeData,
        contact: {
          ...mockResumeData.contact,
          firstName: 'Jane',
          lastName: 'Smith'
        }
      };

      rerender(
        <EnhancedResumePreview
          resumeData={updatedResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });

    it('should debounce rapid updates', async () => {
      const { rerender } = render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      // Simulate rapid updates
      for (let i = 0; i < 5; i++) {
        const updatedData = {
          ...mockResumeData,
          summary: `Updated summary ${i}`
        };

        rerender(
          <EnhancedResumePreview
            resumeData={updatedData}
            selectedTemplate="modern"
            scale={1}
            onTemplateChange={mockOnTemplateChange}
            onScaleChange={mockOnScaleChange}
          />
        );
      }

      // Should only show the final update
      await waitFor(() => {
        expect(screen.getByText('Updated summary 4')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should display error boundary when preview fails', () => {
      const ThrowError = () => {
        throw new Error('Preview rendering failed');
      };

      render(
        <PreviewContainer scale={1} isLoading={false}>
          <ThrowError />
        </PreviewContainer>
      );

      expect(screen.getByTestId('preview-error-boundary')).toBeInTheDocument();
      expect(screen.getByText('Preview temporarily unavailable')).toBeInTheDocument();
    });

    it('should provide error recovery options', async () => {
      const user = userEvent.setup();
      const mockOnRetry = vi.fn();

      const ThrowError = () => {
        throw new Error('Preview rendering failed');
      };

      render(
        <PreviewContainer scale={1} isLoading={false} onRetry={mockOnRetry}>
          <ThrowError />
        </PreviewContainer>
      );

      const retryButton = screen.getByText('Try Again');
      await user.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for zoom controls', () => {
      render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
      expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
      expect(screen.getByLabelText('Reset zoom')).toBeInTheDocument();
    });

    it('should announce scale changes to screen readers', async () => {
      const user = userEvent.setup();
      
      render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={mockOnTemplateChange}
          onScaleChange={mockOnScaleChange}
        />
      );

      const zoomInButton = screen.getByLabelText('Zoom in');
      await user.click(zoomInButton);

      await waitFor(() => {
        const announcement = screen.getByRole('status');
        expect(announcement).toHaveTextContent('Zoom level: 110%');
      });
    });

    it('should support keyboard navigation for template selection', async () => {
      const user = userEvent.setup();
      
      render(
        <TemplateSelector
          templates={mockTemplates}
          selectedTemplate="modern"
          onTemplateChange={mockOnTemplateChange}
        />
      );

      const firstTemplate = screen.getByTestId('template-option-modern');
      firstTemplate.focus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByTestId('template-option-classic')).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(mockOnTemplateChange).toHaveBeenCalledWith('classic');
    });
  });
});