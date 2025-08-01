import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressFlow } from '@/components/builder/components/ProgressiveFlow/ProgressFlow';
import { SectionIndicator } from '@/components/builder/components/ProgressiveFlow/SectionIndicator';
import { NavigationController } from '@/components/builder/components/ProgressiveFlow/NavigationController';
import { SectionProgress } from '@/components/builder/components/ProgressiveFlow/types';

// Mock data for testing
const mockSections: SectionProgress[] = [
  {
    id: 'heading',
    name: 'Personal Information',
    status: 'completed',
    required: true,
    validationErrors: []
  },
  {
    id: 'experience',
    name: 'Work Experience',
    status: 'in_progress',
    required: true,
    validationErrors: []
  },
  {
    id: 'education',
    name: 'Education',
    status: 'not_started',
    required: true,
    validationErrors: []
  },
  {
    id: 'skills',
    name: 'Skills',
    status: 'not_started',
    required: false,
    validationErrors: []
  }
];

describe('ProgressFlow Component', () => {
  const mockOnSectionClick = vi.fn();
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all sections', () => {
      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Work Experience')).toBeInTheDocument();
      expect(screen.getByText('Education')).toBeInTheDocument();
      expect(screen.getByText('Skills')).toBeInTheDocument();
    });

    it('should show correct visual states for different section statuses', () => {
      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      // Completed section should have completed styling
      const completedSection = screen.getByTestId('section-indicator-heading');
      expect(completedSection).toHaveClass('completed');

      // In progress section should have active styling
      const activeSection = screen.getByTestId('section-indicator-experience');
      expect(activeSection).toHaveClass('active');

      // Not started sections should have default styling
      const notStartedSection = screen.getByTestId('section-indicator-education');
      expect(notStartedSection).toHaveClass('not-started');
    });

    it('should render connecting lines when enabled', () => {
      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      const connectingLines = screen.getAllByTestId(/connecting-line/);
      expect(connectingLines.length).toBe(mockSections.length - 1);
    });

    it('should not render connecting lines when disabled', () => {
      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={false}
          animationEnabled={true}
        />
      );

      const connectingLines = screen.queryAllByTestId(/connecting-line/);
      expect(connectingLines.length).toBe(0);
    });
  });

  describe('interactions', () => {
    it('should call onSectionClick when section is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      const educationSection = screen.getByTestId('section-indicator-education');
      await user.click(educationSection);

      expect(mockOnSectionClick).toHaveBeenCalledWith(2); // Index of education section
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      const firstSection = screen.getByTestId('section-indicator-heading');
      firstSection.focus();

      // Navigate with arrow keys
      await user.keyboard('{ArrowRight}');
      expect(screen.getByTestId('section-indicator-experience')).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByTestId('section-indicator-education')).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(screen.getByTestId('section-indicator-experience')).toHaveFocus();
    });

    it('should activate section on Enter key press', async () => {
      const user = userEvent.setup();
      
      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      const educationSection = screen.getByTestId('section-indicator-education');
      educationSection.focus();
      
      await user.keyboard('{Enter}');
      expect(mockOnSectionClick).toHaveBeenCalledWith(2);
    });

    it('should activate section on Space key press', async () => {
      const user = userEvent.setup();
      
      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      const skillsSection = screen.getByTestId('section-indicator-skills');
      skillsSection.focus();
      
      await user.keyboard(' ');
      expect(mockOnSectionClick).toHaveBeenCalledWith(3);
    });
  });

  describe('responsive behavior', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      const progressFlow = screen.getByTestId('progress-flow');
      expect(progressFlow).toHaveClass('mobile-layout');
    });

    it('should adapt to tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      const progressFlow = screen.getByTestId('progress-flow');
      expect(progressFlow).toHaveClass('tablet-layout');
    });
  });

  describe('animations', () => {
    it('should apply animation classes when enabled', async () => {
      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      const connectingLine = screen.getByTestId('connecting-line-0-1');
      expect(connectingLine).toHaveClass('animated');
    });

    it('should not apply animation classes when disabled', () => {
      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={false}
        />
      );

      const connectingLine = screen.getByTestId('connecting-line-0-1');
      expect(connectingLine).not.toHaveClass('animated');
    });

    it('should animate line color changes on section completion', async () => {
      const { rerender } = render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      // Update sections to mark experience as completed
      const updatedSections = [...mockSections];
      updatedSections[1] = { ...updatedSections[1], status: 'completed' };

      rerender(
        <ProgressFlow
          sections={updatedSections}
          currentSection={2}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      await waitFor(() => {
        const connectingLine = screen.getByTestId('connecting-line-1-2');
        expect(connectingLine).toHaveClass('line-active');
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      const progressFlow = screen.getByRole('navigation');
      expect(progressFlow).toHaveAttribute('aria-label', 'Resume building progress');

      const sections = screen.getAllByRole('button');
      expect(sections[0]).toHaveAttribute('aria-label', 'Personal Information - Completed');
      expect(sections[1]).toHaveAttribute('aria-label', 'Work Experience - In Progress');
      expect(sections[2]).toHaveAttribute('aria-label', 'Education - Not Started');
    });

    it('should indicate current section for screen readers', () => {
      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      const currentSection = screen.getByTestId('section-indicator-experience');
      expect(currentSection).toHaveAttribute('aria-current', 'step');
    });

    it('should have proper tab order', () => {
      render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      const sections = screen.getAllByRole('button');
      sections.forEach((section, index) => {
        expect(section).toHaveAttribute('tabindex', '0');
      });
    });

    it('should announce status changes to screen readers', async () => {
      const { rerender } = render(
        <ProgressFlow
          sections={mockSections}
          currentSection={1}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      // Update sections to mark experience as completed
      const updatedSections = [...mockSections];
      updatedSections[1] = { ...updatedSections[1], status: 'completed' };

      rerender(
        <ProgressFlow
          sections={updatedSections}
          currentSection={2}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      await waitFor(() => {
        const announcement = screen.getByRole('status');
        expect(announcement).toHaveTextContent('Work Experience section completed');
      });
    });
  });

  describe('error states', () => {
    it('should display validation errors', () => {
      const sectionsWithErrors: SectionProgress[] = [
        {
          ...mockSections[0],
          validationErrors: ['Email is required', 'Phone number is invalid']
        }
      ];

      render(
        <ProgressFlow
          sections={sectionsWithErrors}
          currentSection={0}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      const errorIndicator = screen.getByTestId('error-indicator-heading');
      expect(errorIndicator).toBeInTheDocument();
      expect(errorIndicator).toHaveAttribute('aria-label', '2 validation errors');
    });

    it('should show error tooltip on hover', async () => {
      const user = userEvent.setup();
      const sectionsWithErrors: SectionProgress[] = [
        {
          ...mockSections[0],
          validationErrors: ['Email is required']
        }
      ];

      render(
        <ProgressFlow
          sections={sectionsWithErrors}
          currentSection={0}
          onSectionClick={mockOnSectionClick}
          showConnectingLines={true}
          animationEnabled={true}
        />
      );

      const errorIndicator = screen.getByTestId('error-indicator-heading');
      await user.hover(errorIndicator);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });
  });
});