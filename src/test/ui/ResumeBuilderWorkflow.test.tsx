import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { BuilderNew } from '@/pages/BuilderNew';

// Mock file for testing
const createMockResumeFile = (content: string, filename: string = 'resume.txt') => {
  return new File([content], filename, { type: 'text/plain' });
};

const mockResumeContent = `
John Doe
Software Engineer
john.doe@email.com
(555) 123-4567
San Francisco, CA

EXPERIENCE
Senior Software Engineer | Tech Corp | 2021-Present
- Led development of web applications using React and Node.js
- Managed team of 5 developers
- Improved system performance by 40%

Software Engineer | StartupCo | 2019-2021
- Built scalable backend services using Python
- Implemented CI/CD pipelines
- Collaborated with cross-functional teams

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2019
GPA: 3.8/4.0

SKILLS
JavaScript, Python, React, Node.js, AWS, Docker
`;

// Wrapper component for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Resume Builder Workflow E2E Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('complete resume building flow', () => {
    it('should complete the entire resume building process', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Step 1: Upload resume file
      const fileInput = screen.getByLabelText(/upload resume/i);
      const mockFile = createMockResumeFile(mockResumeContent);
      
      await user.upload(fileInput, mockFile);

      // Wait for parsing to complete
      await waitFor(() => {
        expect(screen.getByText(/parsing complete/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Step 2: Verify progressive flow is displayed
      expect(screen.getByTestId('progress-flow')).toBeInTheDocument();
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Work Experience')).toBeInTheDocument();
      expect(screen.getByText('Education')).toBeInTheDocument();
      expect(screen.getByText('Skills')).toBeInTheDocument();

      // Step 3: Navigate through sections and verify data placement
      
      // Personal Information section should be auto-populated
      const personalInfoSection = screen.getByTestId('section-indicator-heading');
      await user.click(personalInfoSection);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john.doe@email.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('(555) 123-4567')).toBeInTheDocument();
      });

      // Step 4: Navigate to Experience section
      const experienceSection = screen.getByTestId('section-indicator-experience');
      await user.click(experienceSection);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Senior Software Engineer')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Tech Corp')).toBeInTheDocument();
        expect(screen.getByText(/Led development of web applications/)).toBeInTheDocument();
      });

      // Step 5: Navigate to Education section
      const educationSection = screen.getByTestId('section-indicator-education');
      await user.click(educationSection);

      await waitFor(() => {
        expect(screen.getByDisplayValue('University of California, Berkeley')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Bachelor of Science in Computer Science')).toBeInTheDocument();
        expect(screen.getByDisplayValue('2019')).toBeInTheDocument();
      });

      // Step 6: Navigate to Skills section
      const skillsSection = screen.getByTestId('section-indicator-skills');
      await user.click(skillsSection);

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
        expect(screen.getByText('Python')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
      });

      // Step 7: Verify preview is updated in real-time
      expect(screen.getByTestId('enhanced-preview-container')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument(); // In preview

      // Step 8: Test template switching
      const templateSelector = screen.getByTestId('template-selector');
      const classicTemplate = screen.getByTestId('template-option-classic');
      await user.click(classicTemplate);

      await waitFor(() => {
        const previewContent = screen.getByTestId('preview-content');
        expect(previewContent).toHaveClass('template-classic');
      });

      // Step 9: Verify all sections are marked as completed
      await waitFor(() => {
        const completedSections = screen.getAllByTestId(/section-indicator-.*/).filter(
          section => section.classList.contains('completed')
        );
        expect(completedSections.length).toBe(4);
      });
    });

    it('should handle manual data entry workflow', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Skip file upload and start with manual entry
      const skipUploadButton = screen.getByText(/start from scratch/i);
      await user.click(skipUploadButton);

      // Verify progressive flow is displayed
      expect(screen.getByTestId('progress-flow')).toBeInTheDocument();

      // Fill out personal information manually
      const personalInfoSection = screen.getByTestId('section-indicator-heading');
      await user.click(personalInfoSection);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);

      await user.type(firstNameInput, 'Jane');
      await user.type(lastNameInput, 'Smith');
      await user.type(emailInput, 'jane.smith@email.com');

      // Verify preview updates in real-time
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument(); // In preview
      });

      // Navigate to next section
      const experienceSection = screen.getByTestId('section-indicator-experience');
      await user.click(experienceSection);

      // Add work experience
      const addExperienceButton = screen.getByText(/add experience/i);
      await user.click(addExperienceButton);

      const jobTitleInput = screen.getByLabelText(/job title/i);
      const companyInput = screen.getByLabelText(/company/i);

      await user.type(jobTitleInput, 'Product Manager');
      await user.type(companyInput, 'Innovation Inc');

      // Verify section completion status updates
      await waitFor(() => {
        const personalSection = screen.getByTestId('section-indicator-heading');
        expect(personalSection).toHaveClass('completed');
      });
    });

    it('should handle parsing errors gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Upload an empty file to trigger parsing error
      const fileInput = screen.getByLabelText(/upload resume/i);
      const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });
      
      await user.upload(fileInput, emptyFile);

      // Should display error message
      await waitFor(() => {
        expect(screen.getByText(/failed to parse/i)).toBeInTheDocument();
        expect(screen.getByText(/try a different file/i)).toBeInTheDocument();
      });

      // Should provide option to start from scratch
      const startFromScratchButton = screen.getByText(/start from scratch/i);
      expect(startFromScratchButton).toBeInTheDocument();

      await user.click(startFromScratchButton);

      // Should proceed to manual entry workflow
      expect(screen.getByTestId('progress-flow')).toBeInTheDocument();
    });

    it('should handle unsupported file types', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Upload an unsupported file type
      const fileInput = screen.getByLabelText(/upload resume/i);
      const unsupportedFile = new File(['content'], 'resume.xyz', { type: 'application/unknown' });
      
      await user.upload(fileInput, unsupportedFile);

      // Should display appropriate error message
      await waitFor(() => {
        expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument();
        expect(screen.getByText(/supported types/i)).toBeInTheDocument();
      });

      // Should suggest alternative actions
      expect(screen.getByText(/convert to a supported format/i)).toBeInTheDocument();
    });
  });

  describe('progressive flow navigation', () => {
    it('should prevent navigation to incomplete required sections', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Start from scratch
      const skipUploadButton = screen.getByText(/start from scratch/i);
      await user.click(skipUploadButton);

      // Try to navigate to experience section without completing personal info
      const experienceSection = screen.getByTestId('section-indicator-experience');
      await user.click(experienceSection);

      // Should show validation message
      await waitFor(() => {
        expect(screen.getByText(/complete required fields/i)).toBeInTheDocument();
      });

      // Should remain on personal info section
      expect(screen.getByTestId('section-heading')).toHaveClass('active');
    });

    it('should allow navigation to optional sections', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Start from scratch
      const skipUploadButton = screen.getByText(/start from scratch/i);
      await user.click(skipUploadButton);

      // Navigate to optional skills section
      const skillsSection = screen.getByTestId('section-indicator-skills');
      await user.click(skillsSection);

      // Should allow navigation to optional sections
      await waitFor(() => {
        expect(screen.getByTestId('section-skills')).toHaveClass('active');
      });
    });

    it('should show completion celebration when all sections are done', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Upload and parse a complete resume
      const fileInput = screen.getByLabelText(/upload resume/i);
      const mockFile = createMockResumeFile(mockResumeContent);
      
      await user.upload(fileInput, mockFile);

      // Wait for parsing and auto-completion
      await waitFor(() => {
        const completedSections = screen.getAllByTestId(/section-indicator-.*/).filter(
          section => section.classList.contains('completed')
        );
        expect(completedSections.length).toBe(4);
      }, { timeout: 5000 });

      // Should show completion celebration
      await waitFor(() => {
        expect(screen.getByTestId('completion-celebration')).toBeInTheDocument();
        expect(screen.getByText(/resume completed/i)).toBeInTheDocument();
      });
    });
  });

  describe('data persistence and recovery', () => {
    it('should save progress automatically', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Start manual entry
      const skipUploadButton = screen.getByText(/start from scratch/i);
      await user.click(skipUploadButton);

      // Fill some data
      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'Test User');

      // Verify auto-save indicator
      await waitFor(() => {
        expect(screen.getByText(/saved/i)).toBeInTheDocument();
      });
    });

    it('should restore progress on page reload', async () => {
      const user = userEvent.setup();
      
      // Mock localStorage with saved data
      const savedData = {
        contact: { firstName: 'Restored', lastName: 'User' },
        sections: { heading: { status: 'completed' } }
      };
      
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(savedData));

      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Should restore saved data
      await waitFor(() => {
        expect(screen.getByDisplayValue('Restored')).toBeInTheDocument();
        expect(screen.getByDisplayValue('User')).toBeInTheDocument();
      });

      // Should restore section completion status
      const personalSection = screen.getByTestId('section-indicator-heading');
      expect(personalSection).toHaveClass('completed');
    });
  });

  describe('accessibility in workflow', () => {
    it('should support keyboard navigation throughout the workflow', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Start from scratch
      const skipUploadButton = screen.getByText(/start from scratch/i);
      await user.click(skipUploadButton);

      // Navigate through sections using keyboard
      const firstSection = screen.getByTestId('section-indicator-heading');
      firstSection.focus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByTestId('section-indicator-experience')).toHaveFocus();

      await user.keyboard('{Enter}');
      
      // Should navigate to experience section
      await waitFor(() => {
        expect(screen.getByTestId('section-experience')).toHaveClass('active');
      });
    });

    it('should announce progress changes to screen readers', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Upload resume
      const fileInput = screen.getByLabelText(/upload resume/i);
      const mockFile = createMockResumeFile(mockResumeContent);
      
      await user.upload(fileInput, mockFile);

      // Should announce parsing progress
      await waitFor(() => {
        const announcement = screen.getByRole('status');
        expect(announcement).toHaveTextContent(/parsing/i);
      });

      // Should announce completion
      await waitFor(() => {
        const announcement = screen.getByRole('status');
        expect(announcement).toHaveTextContent(/sections completed/i);
      }, { timeout: 5000 });
    });
  });

  describe('error recovery and user guidance', () => {
    it('should provide helpful guidance for common issues', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Try to upload a very large file
      const fileInput = screen.getByLabelText(/upload resume/i);
      const largeContent = 'x'.repeat(60 * 1024 * 1024); // 60MB
      const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' });
      
      await user.upload(fileInput, largeFile);

      // Should show file size error with guidance
      await waitFor(() => {
        expect(screen.getByText(/file too large/i)).toBeInTheDocument();
        expect(screen.getByText(/compress the file/i)).toBeInTheDocument();
        expect(screen.getByText(/maximum allowed: 50 mb/i)).toBeInTheDocument();
      });
    });

    it('should offer alternative solutions when parsing fails', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BuilderNew />
        </TestWrapper>
      );

      // Upload a problematic file
      const fileInput = screen.getByLabelText(/upload resume/i);
      const problematicFile = new File(['���corrupted���'], 'corrupted.txt', { type: 'text/plain' });
      
      await user.upload(fileInput, problematicFile);

      // Should offer multiple solutions
      await waitFor(() => {
        expect(screen.getByText(/try a different file format/i)).toBeInTheDocument();
        expect(screen.getByText(/start from scratch/i)).toBeInTheDocument();
        expect(screen.getByText(/contact support/i)).toBeInTheDocument();
      });
    });
  });
});