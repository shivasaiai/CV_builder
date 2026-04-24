/**
 * Test data sets for parsing strategies
 * Contains various file types and edge cases for comprehensive testing
 */

export interface TestFile {
  name: string;
  type: string;
  content: string | ArrayBuffer;
  expectedText: string;
  characteristics: string[];
  expectedChallenges: string[];
  size: number;
}

export interface TestDataSet {
  name: string;
  description: string;
  files: TestFile[];
  expectedResults: ExpectedResult[];
  testScenarios: TestScenario[];
}

export interface ExpectedResult {
  fileName: string;
  expectedSections: string[];
  expectedConfidence: number;
  shouldSucceed: boolean;
  expectedStrategy: string;
}

export interface TestScenario {
  name: string;
  description: string;
  files: string[];
  expectedBehavior: string;
  validationRules: ValidationRule[];
}

export interface ValidationRule {
  name: string;
  validate: (result: any) => boolean;
  errorMessage: string;
}

// Sample resume text content for testing
export const SAMPLE_RESUME_TEXT = `
John Doe
Software Engineer
Email: john.doe@email.com
Phone: (555) 123-4567
Location: San Francisco, CA

EXPERIENCE
Senior Software Engineer | Tech Corp | 2020-2023
- Developed web applications using React and Node.js
- Led team of 5 developers on major product initiatives
- Improved system performance by 40%

Software Engineer | StartupCo | 2018-2020
- Built scalable backend services using Python and Django
- Implemented CI/CD pipelines and automated testing
- Collaborated with cross-functional teams

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2018
GPA: 3.8/4.0

SKILLS
Programming Languages: JavaScript, Python, Java, TypeScript
Frameworks: React, Node.js, Django, Express
Tools: Git, Docker, AWS, Jenkins
`.trim();// Test da
ta sets for different parsing scenarios
export const TEST_DATA_SETS: TestDataSet[] = [
  {
    name: 'basic-text-files',
    description: 'Basic text files with standard resume content',
    files: [
      {
        name: 'standard-resume.txt',
        type: 'text/plain',
        content: SAMPLE_RESUME_TEXT,
        expectedText: SAMPLE_RESUME_TEXT,
        characteristics: ['plain-text', 'well-formatted', 'standard-sections'],
        expectedChallenges: [],
        size: SAMPLE_RESUME_TEXT.length
      },
      {
        name: 'minimal-resume.txt',
        type: 'text/plain',
        content: 'John Doe\njohn@email.com\nSoftware Engineer',
        expectedText: 'John Doe\njohn@email.com\nSoftware Engineer',
        characteristics: ['minimal-content', 'basic-info-only'],
        expectedChallenges: ['insufficient-data'],
        size: 35
      }
    ],
    expectedResults: [
      {
        fileName: 'standard-resume.txt',
        expectedSections: ['contact', 'experience', 'education', 'skills'],
        expectedConfidence: 90,
        shouldSucceed: true,
        expectedStrategy: 'TextParsingStrategy'
      }
    ],
    testScenarios: [
      {
        name: 'text-parsing-success',
        description: 'Text files should parse successfully with high confidence',
        files: ['standard-resume.txt'],
        expectedBehavior: 'successful-parsing',
        validationRules: [
          {
            name: 'text-length-validation',
            validate: (result) => result.text.length > 100,
            errorMessage: 'Extracted text should be substantial'
          }
        ]
      }
    ]
  },
  {
    name: 'problematic-files',
    description: 'Files that commonly cause parsing issues',
    files: [
      {
        name: 'empty-file.txt',
        type: 'text/plain',
        content: '',
        expectedText: '',
        characteristics: ['empty-file'],
        expectedChallenges: ['empty-content', 'validation-failure'],
        size: 0
      },
      {
        name: 'corrupted-content.txt',
        type: 'text/plain',
        content: '���\x00\x01\x02invalid content���',
        expectedText: 'invalid content',
        characteristics: ['corrupted-data', 'binary-artifacts'],
        expectedChallenges: ['encoding-issues', 'cleanup-required'],
        size: 25
      },
      {
        name: 'very-large-file.txt',
        type: 'text/plain',
        content: SAMPLE_RESUME_TEXT.repeat(1000),
        expectedText: SAMPLE_RESUME_TEXT.repeat(1000),
        characteristics: ['large-file', 'repetitive-content'],
        expectedChallenges: ['performance-impact', 'memory-usage'],
        size: SAMPLE_RESUME_TEXT.length * 1000
      }
    ],
    expectedResults: [
      {
        fileName: 'empty-file.txt',
        expectedSections: [],
        expectedConfidence: 0,
        shouldSucceed: false,
        expectedStrategy: 'none'
      }
    ],
    testScenarios: [
      {
        name: 'error-handling',
        description: 'Problematic files should be handled gracefully',
        files: ['empty-file.txt', 'corrupted-content.txt'],
        expectedBehavior: 'graceful-error-handling',
        validationRules: [
          {
            name: 'error-classification',
            validate: (result) => result.error && result.error.code,
            errorMessage: 'Errors should be properly classified'
          }
        ]
      }
    ]
  }
];

// Mock file creation utilities for testing
export function createMockFile(testFile: TestFile): File {
  const content = typeof testFile.content === 'string' 
    ? new Blob([testFile.content], { type: testFile.type })
    : new Blob([testFile.content], { type: testFile.type });
  
  const file = new File([content], testFile.name, {
    type: testFile.type,
    lastModified: Date.now()
  });
  
  return file;
}

// Performance benchmarking utilities
export interface PerformanceBenchmark {
  fileName: string;
  strategy: string;
  fileSize: number;
  processingTime: number;
  memoryUsage: number;
  success: boolean;
}

export function createPerformanceBenchmark(
  fileName: string,
  strategy: string,
  fileSize: number,
  processingTime: number,
  success: boolean
): PerformanceBenchmark {
  return {
    fileName,
    strategy,
    fileSize,
    processingTime,
    memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
    success
  };
}