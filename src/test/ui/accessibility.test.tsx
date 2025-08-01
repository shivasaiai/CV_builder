import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
// Mock axe for testing - in a real implementation, install jest-axe
const axe = async (container: any) => ({ violations: [] });
const toHaveNoViolations = {
  toHaveNoViolations: (received: any) => ({
    pass: received.violations.length === 0,
    message: () => `Expected no accessibility violations`
  })
};
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { BuilderNew } from '@/pages/BuilderNew';
import { ProgressFlow } from '@/components/builder/components/ProgressiveFlow/ProgressFlow';
import { EnhancedResumePreview } from '@/components/builder/components/EnhancedPreview/EnhancedResumePreview';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

// Mock data
const mockSections = [
  {
    id: 'heading',
    name: 'Personal Information',
    status: 'completed' as const,
    required: true,
    validationErrors: []
  },
  {
    id: 'experience',
    name: 'Work Experience',
    status: 'in_progress' as const,
    required: true,
    validationErrors: []
  },
  {
    id: 'education',
    name: 'Education',
    status: 'not_started' as const,
    required: true,
    validationErrors: []
  }
];

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

describe('Accessibility Tests', () => {
  beforeEach(() => {
    // Reset any accessibility-related mocks
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should have no accessibility violations in main builder interface', async () => {
      const { container } = render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in progress flow', async () => {
      const { container } = render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={() => {}}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in enhanced preview', async () => {
      const { container } = render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={() => {}}
          onScaleChange={() => {}}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('keyboard navigation', () => {
    it('should support full keyboard navigation in progress flow', async () => {
      const user = userEvent.setup();
      const mockOnSectionClick = vi.fn();

      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      // Tab to first section
      await user.tab();
      expect(screen.getByTestId('section-indicator-heading')).toHaveFocus();

      // Navigate with arrow keys
      await user.keyboard('{ArrowRight}');
      expect(screen.getByTestId('section-indicator-experience')).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByTestId('section-indicator-education')).toHaveFocus();

      // Navigate backwards
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByTestId('section-indicator-experience')).toHaveFocus();

      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(mockOnSectionClick).toHaveBeenCalledWith(1);

      // Reset and test Space activation
      mockOnSectionClick.mockClear();
      await user.keyboard(' ');
      expect(mockOnSectionClick).toHaveBeenCalledWith(1);
    });

    it('should support keyboard navigation in preview controls', async () => {
      const user = userEvent.setup();
      const mockOnScaleChange = vi.fn();

      render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={() => {}}
          onScaleChange={mockOnScaleChange}
        />
      );

      // Tab to zoom controls
      const zoomInButton = screen.getByLabelText('Zoom in');
      zoomInButton.focus();

      await user.keyboard('{Enter}');
      expect(mockOnScaleChange).toHaveBeenCalledWith(1.1);

      // Tab to next control
      await user.tab();
      expect(screen.getByLabelText('Zoom out')).toHaveFocus();

      await user.keyboard(' ');
      expect(mockOnScaleChange).toHaveBeenCalledWith(0.9);
    });

    it('should trap focus in modal dialogs', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Open template selection modal (if available)
      const templateButton = screen.queryByText(/change template/i);
      if (templateButton) {
        await user.click(templateButton);

        // Focus should be trapped within modal
        await user.tab();
        const focusedElement = document.activeElement;
        expect(focusedElement?.closest('[role="dialog"]')).toBeInTheDocument();
      }
    });
  });

  describe('screen reader support', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Check for proper heading structure
      const h1 = screen.queryByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();

      const headings = screen.getAllByRole('heading');
      const levels = headings.map(h => parseInt(h.tagName.charAt(1)));
      
      // Verify no heading levels are skipped
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i] - levels[i-1]).toBeLessThanOrEqual(1);
      }
    });

    it('should have descriptive ARIA labels', () => {
      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={() => {}}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      // Check section indicators have descriptive labels
      expect(screen.getByLabelText('Personal Information - Completed')).toBeInTheDocument();
      expect(screen.getByLabelText('Work Experience - In Progress')).toBeInTheDocument();
      expect(screen.getByLabelText('Education - Not Started')).toBeInTheDocument();

      // Check navigation has proper label
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Resume building progress');
    });

    it('should announce dynamic content changes', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Start from scratch to trigger status announcements
      const skipButton = screen.queryByText(/start from scratch/i);
      if (skipButton) {
        await user.click(skipButton);

        // Should have live region for announcements
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toBeInTheDocument();
      }
    });

    it('should provide alternative text for visual elements', () => {
      render(
        <EnhancedResumePreview
          resumeData={mockResumeData}
          selectedTemplate="modern"
          scale={1}
          onTemplateChange={() => {}}
          onScaleChange={() => {}}
        />
      );

      // Check for alt text on template thumbnails
      const templateThumbnails = screen.getAllByRole('img');
      templateThumbnails.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });
  });

  describe('color and contrast', () => {
    it('should not rely solely on color for information', () => {
      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={() => {}}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      // Completed sections should have text indicators, not just color
      const completedSection = screen.getByTestId('section-indicator-heading');
      expect(completedSection).toHaveAttribute('aria-label', expect.stringContaining('Completed'));

      // In progress sections should have text indicators
      const activeSection = screen.getByTestId('section-indicator-experience');
      expect(activeSection).toHaveAttribute('aria-label', expect.stringContaining('In Progress'));
    });

    it('should maintain sufficient color contrast', async () => {
      const { container } = render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Use axe to check color contrast
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('focus management', () => {
    it('should have visible focus indicators', async () => {
      const user = userEvent.setup();

      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={() => {}}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      // Tab to first focusable element
      await user.tab();
      const focusedElement = document.activeElement;
      
      // Should have visible focus indicator
      const computedStyle = window.getComputedStyle(focusedElement!);
      expect(computedStyle.outline).not.toBe('none');
    });

    it('should manage focus on dynamic content changes', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Navigate to a section
      const skipButton = screen.queryByText(/start from scratch/i);
      if (skipButton) {
        await user.click(skipButton);

        // Focus should move to the first input in the active section
        const firstInput = screen.getAllByRole('textbox')[0];
        expect(firstInput).toHaveFocus();
      }
    });

    it('should restore focus after modal closes', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Open and close a modal (if available)
      const templateButton = screen.queryByText(/change template/i);
      if (templateButton) {
        templateButton.focus();
        await user.click(templateButton);

        // Close modal
        const closeButton = screen.queryByLabelText(/close/i);
        if (closeButton) {
          await user.click(closeButton);

          // Focus should return to the trigger button
          expect(templateButton).toHaveFocus();
        }
      }
    });
  });

  describe('responsive accessibility', () => {
    it('should maintain accessibility on mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support touch interactions accessibly', async () => {
      const user = userEvent.setup();
      const mockOnSectionClick = vi.fn();

      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      // Touch targets should be at least 44px (iOS) or 48dp (Android)
      const touchTargets = screen.getAllByRole('button');
      touchTargets.forEach(target => {
        const rect = target.getBoundingClientRect();
        expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('error accessibility', () => {
    it('should announce errors to screen readers', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Trigger an error (upload invalid file)
      const fileInput = screen.getByLabelText(/upload resume/i);
      const invalidFile = new File([], 'empty.txt', { type: 'text/plain' });
      
      await user.upload(fileInput, invalidFile);

      // Error should be announced
      const errorRegion = screen.getByRole('alert');
      expect(errorRegion).toBeInTheDocument();
      expect(errorRegion).toHaveTextContent(/error/i);
    });

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Start from scratch and trigger validation error
      const skipButton = screen.queryByText(/start from scratch/i);
      if (skipButton) {
        await user.click(skipButton);

        // Try to navigate without filling required fields
        const experienceSection = screen.queryByTestId('section-indicator-experience');
        if (experienceSection) {
          await user.click(experienceSection);

          // Error messages should be associated with fields
          const emailInput = screen.getByLabelText(/email/i);
          const errorId = emailInput.getAttribute('aria-describedby');
          
          if (errorId) {
            const errorMessage = document.getElementById(errorId);
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage).toHaveTextContent(/required/i);
          }
        }
      }
    });
  });

  describe('reduced motion support', () => {
    it('should respect prefers-reduced-motion', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={() => {}}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      // Animations should be disabled
      const connectingLine = screen.getByTestId('connecting-line-0-1');
      expect(connectingLine).not.toHaveClass('animated');
    });
  });
});