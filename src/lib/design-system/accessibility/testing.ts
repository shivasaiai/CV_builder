/**
 * Accessibility Testing Utilities
 * 
 * Utilities for testing and validating accessibility compliance
 */

// Color contrast calculation utilities
export const calculateContrast = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

// WCAG compliance levels
export const WCAG_LEVELS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
} as const;

// Check if contrast meets WCAG standards
export const meetsWCAG = (
  contrast: number,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean => {
  if (level === 'AA') {
    return contrast >= (isLargeText ? WCAG_LEVELS.AA_LARGE : WCAG_LEVELS.AA_NORMAL);
  }
  return contrast >= (isLargeText ? WCAG_LEVELS.AAA_LARGE : WCAG_LEVELS.AAA_NORMAL);
};

// Accessibility audit for DOM elements
export interface AccessibilityIssue {
  element: Element;
  type: 'error' | 'warning';
  rule: string;
  message: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
}

export const auditAccessibility = (container: Element): AccessibilityIssue[] => {
  const issues: AccessibilityIssue[] = [];

  // Check for missing alt text on images
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('alt')) {
      issues.push({
        element: img,
        type: 'error',
        rule: 'img-alt',
        message: 'Image missing alt attribute',
        impact: 'critical',
      });
    }
  });

  // Check for form inputs without labels
  const inputs = container.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const id = input.getAttribute('id');
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    
    if (!ariaLabel && !ariaLabelledBy) {
      if (!id || !container.querySelector(`label[for="${id}"]`)) {
        issues.push({
          element: input,
          type: 'error',
          rule: 'label',
          message: 'Form input missing accessible label',
          impact: 'critical',
        });
      }
    }
  });

  // Check for buttons without accessible names
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    const hasText = button.textContent?.trim();
    const ariaLabel = button.getAttribute('aria-label');
    const ariaLabelledBy = button.getAttribute('aria-labelledby');
    
    if (!hasText && !ariaLabel && !ariaLabelledBy) {
      issues.push({
        element: button,
        type: 'error',
        rule: 'button-name',
        message: 'Button missing accessible name',
        impact: 'critical',
      });
    }
  });

  // Check for proper heading hierarchy
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let previousLevel = 0;
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    
    if (level > previousLevel + 1) {
      issues.push({
        element: heading,
        type: 'warning',
        rule: 'heading-order',
        message: `Heading level ${level} skips level ${previousLevel + 1}`,
        impact: 'moderate',
      });
    }
    
    previousLevel = level;
  });

  // Check for links without accessible names
  const links = container.querySelectorAll('a');
  links.forEach(link => {
    const hasText = link.textContent?.trim();
    const ariaLabel = link.getAttribute('aria-label');
    const ariaLabelledBy = link.getAttribute('aria-labelledby');
    
    if (!hasText && !ariaLabel && !ariaLabelledBy) {
      issues.push({
        element: link,
        type: 'error',
        rule: 'link-name',
        message: 'Link missing accessible name',
        impact: 'serious',
      });
    }
  });

  // Check for missing focus indicators
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  focusableElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element, ':focus');
    const hasOutline = computedStyle.outline !== 'none';
    const hasBoxShadow = computedStyle.boxShadow !== 'none';
    
    if (!hasOutline && !hasBoxShadow) {
      issues.push({
        element: element as Element,
        type: 'warning',
        rule: 'focus-visible',
        message: 'Focusable element missing focus indicator',
        impact: 'serious',
      });
    }
  });

  // Check for proper ARIA usage
  const elementsWithAria = container.querySelectorAll('[aria-expanded], [aria-selected], [aria-checked]');
  elementsWithAria.forEach(element => {
    const ariaExpanded = element.getAttribute('aria-expanded');
    const ariaSelected = element.getAttribute('aria-selected');
    const ariaChecked = element.getAttribute('aria-checked');
    
    if (ariaExpanded && !['true', 'false'].includes(ariaExpanded)) {
      issues.push({
        element,
        type: 'error',
        rule: 'aria-valid-attr-value',
        message: 'Invalid aria-expanded value',
        impact: 'serious',
      });
    }
    
    if (ariaSelected && !['true', 'false'].includes(ariaSelected)) {
      issues.push({
        element,
        type: 'error',
        rule: 'aria-valid-attr-value',
        message: 'Invalid aria-selected value',
        impact: 'serious',
      });
    }
    
    if (ariaChecked && !['true', 'false', 'mixed'].includes(ariaChecked)) {
      issues.push({
        element,
        type: 'error',
        rule: 'aria-valid-attr-value',
        message: 'Invalid aria-checked value',
        impact: 'serious',
      });
    }
  });

  return issues;
};

// Keyboard navigation testing
export const testKeyboardNavigation = (container: Element): boolean => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  // Check if all focusable elements can receive focus
  let allFocusable = true;
  focusableElements.forEach(element => {
    try {
      (element as HTMLElement).focus();
      if (document.activeElement !== element) {
        allFocusable = false;
      }
    } catch (error) {
      allFocusable = false;
    }
  });

  return allFocusable;
};

// Screen reader testing utilities
export const getAccessibleName = (element: Element): string => {
  // Check aria-label first
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  // Check associated label
  const id = element.getAttribute('id');
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) return label.textContent || '';
  }

  // Check text content
  return element.textContent || '';
};

export const getAccessibleDescription = (element: Element): string => {
  const ariaDescribedBy = element.getAttribute('aria-describedby');
  if (ariaDescribedBy) {
    const descriptionElement = document.getElementById(ariaDescribedBy);
    if (descriptionElement) return descriptionElement.textContent || '';
  }

  const title = element.getAttribute('title');
  if (title) return title;

  return '';
};

// Generate accessibility report
export interface AccessibilityReport {
  score: number;
  issues: AccessibilityIssue[];
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  recommendations: string[];
}

export const generateAccessibilityReport = (container: Element): AccessibilityReport => {
  const issues = auditAccessibility(container);
  
  const summary = issues.reduce(
    (acc, issue) => {
      acc[issue.impact]++;
      return acc;
    },
    { critical: 0, serious: 0, moderate: 0, minor: 0 }
  );

  // Calculate score (100 - weighted penalty for issues)
  const penalties = {
    critical: 20,
    serious: 10,
    moderate: 5,
    minor: 1,
  };

  const totalPenalty = Object.entries(summary).reduce(
    (acc, [impact, count]) => acc + count * penalties[impact as keyof typeof penalties],
    0
  );

  const score = Math.max(0, 100 - totalPenalty);

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (summary.critical > 0) {
    recommendations.push('Fix critical accessibility issues immediately');
  }
  
  if (summary.serious > 0) {
    recommendations.push('Address serious accessibility barriers');
  }
  
  if (issues.some(issue => issue.rule === 'img-alt')) {
    recommendations.push('Add alt text to all images');
  }
  
  if (issues.some(issue => issue.rule === 'label')) {
    recommendations.push('Ensure all form inputs have accessible labels');
  }
  
  if (issues.some(issue => issue.rule === 'heading-order')) {
    recommendations.push('Fix heading hierarchy to improve navigation');
  }

  return {
    score,
    issues,
    summary,
    recommendations,
  };
};

// Utility to log accessibility report to console
export const logAccessibilityReport = (report: AccessibilityReport): void => {
  console.group('🔍 Accessibility Report');
  console.log(`Score: ${report.score}/100`);
  
  if (report.issues.length > 0) {
    console.group('Issues Found:');
    report.issues.forEach(issue => {
      const emoji = issue.impact === 'critical' ? '🚨' : 
                   issue.impact === 'serious' ? '⚠️' : 
                   issue.impact === 'moderate' ? '💡' : 'ℹ️';
      console.log(`${emoji} ${issue.rule}: ${issue.message}`, issue.element);
    });
    console.groupEnd();
  }
  
  if (report.recommendations.length > 0) {
    console.group('Recommendations:');
    report.recommendations.forEach(rec => console.log(`• ${rec}`));
    console.groupEnd();
  }
  
  console.groupEnd();
};