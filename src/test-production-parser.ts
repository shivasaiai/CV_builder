/**
 * Production Resume Parser Test Suite
 * Comprehensive testing framework for resume parsing functionality
 */

import { ProductionResumeParser, ParsingOptions } from './components/builder/services/ProductionResumeParser';
import { ParserLogger, LogLevel } from './components/builder/services/ParserLogger';
import { ErrorHandler, ParserError } from './components/builder/services/ParserErrors';

interface TestResult {
  fileName: string;
  success: boolean;
  processingTime: number;
  fileSize: number;
  extractedData?: any;
  error?: ParserError;
  logs: any[];
  warnings: string[];
  errors: string[];
}

interface TestSuite {
  name: string;
  description: string;
  files: string[];
  options?: ParsingOptions;
}

export class ProductionParserTester {
  private testResults: TestResult[] = [];
  private currentTest: TestResult | null = null;

  constructor() {
    // Set up logging for testing
    ParserLogger.setLogLevel(LogLevel.DEBUG);
    ParserLogger.setMaxLogs(5000);
  }

  async runTestSuite(suiteName: string = 'default'): Promise<void> {
    console.log(`🧪 Starting Production Parser Test Suite: ${suiteName}`);
    console.log('=' .repeat(60));

    const testSuites: Record<string, TestSuite> = {
      default: {
        name: 'Default Test Suite',
        description: 'Tests with sample resume files',
        files: [
          'design/resume/cvgen.pdf.pdf',
          'design/resume/balacv.pdf',
          'design/resume/shivacv.pdf',
          'design/resume/resume (5).pdf',
          'design/resume/resume (7).pdf'
        ]
      },
      comprehensive: {
        name: 'Comprehensive Test Suite',
        description: 'Tests with various options and configurations',
        files: [
          'design/resume/cvgen.pdf.pdf',
          'design/resume/balacv.pdf'
        ],
        options: {
          timeout: 120000,
          enableOCR: true,
          strictValidation: true,
          retryAttempts: 3
        }
      },
      performance: {
        name: 'Performance Test Suite',
        description: 'Tests focused on performance metrics',
        files: [
          'design/resume/cvgen.pdf.pdf',
          'design/resume/balacv.pdf'
        ],
        options: {
          timeout: 30000,
          enableOCR: false,
          retryAttempts: 1
        }
      }
    };

    const suite = testSuites[suiteName] || testSuites.default;
    console.log(`📋 Test Suite: ${suite.name}`);
    console.log(`📝 Description: ${suite.description}`);
    console.log(`📁 Files to test: ${suite.files.length}`);
    console.log('');

    // Clear previous results
    this.testResults = [];
    ErrorHandler.clearHistory();
    ParserLogger.clearLogs();

    // Run tests for each file
    for (let i = 0; i < suite.files.length; i++) {
      const fileName = suite.files[i];
      console.log(`\n🔍 Test ${i + 1}/${suite.files.length}: ${fileName}`);
      console.log('-'.repeat(40));

      try {
        await this.testFile(fileName, suite.options);
      } catch (error) {
        console.error(`❌ Test failed for ${fileName}:`, error);
      }
    }

    // Generate comprehensive report
    this.generateTestReport();
  }

  private async testFile(filePath: string, options?: ParsingOptions): Promise<void> {
    const startTime = performance.now();
    
    // Initialize test result
    this.currentTest = {
      fileName: filePath,
      success: false,
      processingTime: 0,
      fileSize: 0,
      logs: [],
      warnings: [],
      errors: []
    };

    try {
      // In a real implementation, you would load the file from the file system
      // For this example, we'll simulate the file loading
      console.log(`📂 Loading file: ${filePath}`);
      
      // Simulate file loading - in production, you'd use fetch or file system APIs
      const mockFile = await this.createMockFile(filePath);
      this.currentTest.fileSize = mockFile.size;

      console.log(`📊 File size: ${(mockFile.size / 1024).toFixed(1)} KB`);
      console.log(`📄 File type: ${mockFile.type}`);

      // Clear logs for this test
      ParserLogger.clearLogs();

      // Run the parser
      console.log('🚀 Starting parser...');
      const result = await ProductionResumeParser.parseFile(
        mockFile,
        this.createProgressCallback(),
        options
      );

      // Test completed successfully
      const endTime = performance.now();
      this.currentTest.processingTime = endTime - startTime;
      this.currentTest.success = true;
      this.currentTest.extractedData = result;
      this.currentTest.logs = ParserLogger.getLogs();

      console.log(`✅ Test completed successfully in ${this.currentTest.processingTime.toFixed(0)}ms`);
      
      // Validate extracted data
      this.validateExtractedData(result);

    } catch (error) {
      const endTime = performance.now();
      this.currentTest.processingTime = endTime - startTime;
      this.currentTest.success = false;
      this.currentTest.error = error as ParserError;
      this.currentTest.logs = ParserLogger.getLogs();

      console.log(`❌ Test failed after ${this.currentTest.processingTime.toFixed(0)}ms`);
      console.log(`🔍 Error: ${(error as Error).message}`);
      
      if (error instanceof ParserError) {
        console.log(`📋 Error Code: ${error.code}`);
        console.log(`⚠️ Severity: ${error.severity}`);
        console.log(`🔄 Recoverable: ${error.recoverable}`);
        console.log(`👤 User Message: ${error.userMessage}`);
      }
    }

    // Collect warnings and errors from logs
    const logSummary = ParserLogger.getLogsSummary();
    this.currentTest.warnings = logSummary.warnings.map(w => w.message);
    this.currentTest.errors = logSummary.errors.map(e => e.message);

    // Add to results
    this.testResults.push(this.currentTest);
    this.currentTest = null;
  }

  private async createMockFile(filePath: string): Promise<File> {
    // In a real implementation, you would load the actual file
    // For testing purposes, we'll create a mock file with realistic properties
    
    const fileName = filePath.split('/').pop() || 'unknown.pdf';
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf';
    
    // Simulate different file sizes and types
    let mockSize = 1024 * 100; // 100KB default
    let mockType = 'application/pdf';
    
    if (fileName.includes('balacv')) {
      mockSize = 1024 * 250; // 250KB
    } else if (fileName.includes('cvgen')) {
      mockSize = 1024 * 180; // 180KB
    } else if (fileName.includes('shivacv')) {
      mockSize = 1024 * 320; // 320KB
    }

    if (fileExtension === 'docx') {
      mockType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (fileExtension === 'doc') {
      mockType = 'application/msword';
    }

    // Create a mock file with realistic content
    const mockContent = this.generateMockResumeContent(fileName);
    const blob = new Blob([mockContent], { type: mockType });
    
    return new File([blob], fileName, {
      type: mockType,
      lastModified: Date.now()
    });
  }

  private generateMockResumeContent(fileName: string): string {
    // Generate realistic resume content based on file name
    const templates = {
      'balacv.pdf': `
BALA KRISHNA NADIGADDA
Software Engineer
Email: bala.krishna@email.com
Phone: +91-9876543210
Location: Hyderabad, India

PROFESSIONAL EXPERIENCE

Software Engineer at Tech Solutions Pvt Ltd
Hyderabad, India
June 2020 - Present
• Developed and maintained web applications using React and Node.js
• Collaborated with cross-functional teams to deliver high-quality software solutions
• Implemented responsive designs and optimized application performance
• Participated in code reviews and maintained coding standards

Junior Developer at StartUp Inc
Bangalore, India  
January 2019 - May 2020
• Built frontend components using HTML, CSS, and JavaScript
• Worked on REST API integration and database optimization
• Assisted in testing and debugging applications

EDUCATION

Bachelor of Technology in Computer Science
Jawaharlal Nehru Technological University
Hyderabad, India
2015 - 2019

SKILLS

JavaScript, React, Node.js, HTML, CSS, Python, SQL, MongoDB, Git, AWS

SUMMARY

Experienced software engineer with 4+ years in web development. Skilled in modern JavaScript frameworks and backend technologies. Passionate about creating efficient and scalable solutions.
      `,
      'cvgen.pdf.pdf': `
JOHN SMITH
Full Stack Developer
john.smith@email.com | (555) 123-4567
San Francisco, CA

PROFESSIONAL SUMMARY

Experienced Full Stack Developer with 5+ years of experience in designing and developing scalable web applications. Proficient in modern JavaScript frameworks, cloud technologies, and agile methodologies.

WORK EXPERIENCE

Senior Full Stack Developer
TechCorp Inc. | San Francisco, CA
March 2021 - Present
• Led development of microservices architecture serving 1M+ users
• Implemented CI/CD pipelines reducing deployment time by 60%
• Mentored junior developers and conducted technical interviews
• Technologies: React, Node.js, AWS, Docker, Kubernetes

Full Stack Developer  
WebSolutions LLC | San Francisco, CA
June 2019 - February 2021
• Developed responsive web applications using React and Express.js
• Integrated third-party APIs and payment gateways
• Optimized database queries improving performance by 40%
• Technologies: React, Express.js, PostgreSQL, Redis

EDUCATION

Master of Science in Computer Science
Stanford University | Stanford, CA
2017 - 2019

Bachelor of Science in Software Engineering
UC Berkeley | Berkeley, CA  
2013 - 2017

TECHNICAL SKILLS

Frontend: React, Vue.js, Angular, TypeScript, HTML5, CSS3, SASS
Backend: Node.js, Python, Java, Express.js, Django, Spring Boot
Databases: PostgreSQL, MongoDB, Redis, MySQL
Cloud: AWS, Azure, Google Cloud Platform
DevOps: Docker, Kubernetes, Jenkins, GitLab CI/CD
      `,
      'shivacv.pdf': `
SHIVA SAI NADIGADDA
Data Scientist
shiva.sai@email.com
+91-8765432109
Chennai, Tamil Nadu, India

OBJECTIVE

Seeking a challenging position as a Data Scientist where I can utilize my analytical skills and machine learning expertise to drive business insights and innovation.

PROFESSIONAL EXPERIENCE

Data Scientist
Analytics Corp | Chennai, India
August 2021 - Present
• Developed machine learning models for predictive analytics
• Analyzed large datasets to identify trends and patterns
• Created data visualizations and dashboards for stakeholders
• Improved model accuracy by 25% through feature engineering

Data Analyst
Insights Ltd | Chennai, India
January 2020 - July 2021
• Performed statistical analysis on customer data
• Built automated reporting systems using Python
• Collaborated with business teams to define KPIs
• Reduced manual reporting time by 70%

EDUCATION

Master of Technology in Data Science
Indian Institute of Technology, Madras
Chennai, India
2018 - 2020

Bachelor of Engineering in Computer Science
Anna University
Chennai, India
2014 - 2018

TECHNICAL SKILLS

Programming: Python, R, SQL, Java
Machine Learning: Scikit-learn, TensorFlow, PyTorch, Keras
Data Visualization: Tableau, Power BI, Matplotlib, Seaborn
Databases: MySQL, PostgreSQL, MongoDB
Cloud Platforms: AWS, Google Cloud Platform
Tools: Jupyter, Git, Docker, Apache Spark

CERTIFICATIONS

• AWS Certified Machine Learning - Specialty
• Google Cloud Professional Data Engineer
• Microsoft Azure Data Scientist Associate
      `
    };

    return templates[fileName as keyof typeof templates] || templates['balacv.pdf'];
  }

  private createProgressCallback(): (progress: number, total: number, status: string) => void {
    return (progress: number, total: number, status: string) => {
      const percentage = Math.round((progress / total) * 100);
      process.stdout.write(`\r⏳ ${status} (${percentage}%)`);
      
      if (percentage === 100) {
        console.log(''); // New line after completion
      }
    };
  }

  private validateExtractedData(data: any): void {
    console.log('\n📊 Extracted Data Validation:');
    
    const validations = [
      {
        test: () => data.contact.firstName && data.contact.lastName,
        message: 'Name extraction',
        critical: true
      },
      {
        test: () => data.contact.email,
        message: 'Email extraction', 
        critical: true
      },
      {
        test: () => data.contact.phone,
        message: 'Phone extraction',
        critical: false
      },
      {
        test: () => data.workExperiences.length > 0,
        message: 'Work experience extraction',
        critical: true
      },
      {
        test: () => data.education.school || data.education.degree,
        message: 'Education extraction',
        critical: false
      },
      {
        test: () => data.skills.length > 0,
        message: 'Skills extraction',
        critical: false
      },
      {
        test: () => data.summary && data.summary.length > 50,
        message: 'Summary extraction',
        critical: false
      }
    ];

    let passedTests = 0;
    let criticalFailures = 0;

    validations.forEach(validation => {
      if (validation.test()) {
        console.log(`  ✅ ${validation.message}: PASSED`);
        passedTests++;
      } else {
        const icon = validation.critical ? '❌' : '⚠️';
        console.log(`  ${icon} ${validation.message}: FAILED`);
        if (validation.critical) {
          criticalFailures++;
        }
      }
    });

    console.log(`\n📈 Validation Summary: ${passedTests}/${validations.length} tests passed`);
    if (criticalFailures > 0) {
      console.log(`🚨 Critical failures: ${criticalFailures}`);
    }

    // Display extracted data summary
    console.log('\n📋 Extracted Data Summary:');
    console.log(`  👤 Name: ${data.contact.firstName} ${data.contact.lastName}`);
    console.log(`  📧 Email: ${data.contact.email || 'Not found'}`);
    console.log(`  📞 Phone: ${data.contact.phone || 'Not found'}`);
    console.log(`  💼 Work Experiences: ${data.workExperiences.length}`);
    console.log(`  🎓 Education: ${data.education.school || data.education.degree || 'Not found'}`);
    console.log(`  🛠️ Skills: ${data.skills.length} found`);
    console.log(`  📝 Summary: ${data.summary ? `${data.summary.length} characters` : 'Not found'}`);
  }

  private generateTestReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(60));

    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    const avgProcessingTime = this.testResults.reduce((sum, r) => sum + r.processingTime, 0) / totalTests;
    const totalWarnings = this.testResults.reduce((sum, r) => sum + r.warnings.length, 0);
    const totalErrors = this.testResults.reduce((sum, r) => sum + r.errors.length, 0);

    console.log('\n📈 OVERALL STATISTICS:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Successful: ${successfulTests} (${((successfulTests / totalTests) * 100).toFixed(1)}%)`);
    console.log(`  Failed: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`);
    console.log(`  Average Processing Time: ${avgProcessingTime.toFixed(0)}ms`);
    console.log(`  Total Warnings: ${totalWarnings}`);
    console.log(`  Total Errors: ${totalErrors}`);

    console.log('\n📋 DETAILED RESULTS:');
    this.testResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.fileName}`);
      console.log(`   Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      console.log(`   Processing Time: ${result.processingTime.toFixed(0)}ms`);
      console.log(`   File Size: ${(result.fileSize / 1024).toFixed(1)} KB`);
      console.log(`   Warnings: ${result.warnings.length}`);
      console.log(`   Errors: ${result.errors.length}`);
      
      if (!result.success && result.error) {
        console.log(`   Error Code: ${result.error.code}`);
        console.log(`   Error Message: ${result.error.message}`);
        console.log(`   User Message: ${result.error.userMessage}`);
      }

      if (result.success && result.extractedData) {
        const data = result.extractedData;
        console.log(`   Extracted: Name=${!!(data.contact.firstName)}, Email=${!!data.contact.email}, Work=${data.workExperiences.length}, Skills=${data.skills.length}`);
      }
    });

    // Performance analysis
    console.log('\n⚡ PERFORMANCE ANALYSIS:');
    const sortedByTime = [...this.testResults].sort((a, b) => b.processingTime - a.processingTime);
    console.log('  Slowest files:');
    sortedByTime.slice(0, 3).forEach((result, index) => {
      console.log(`    ${index + 1}. ${result.fileName}: ${result.processingTime.toFixed(0)}ms`);
    });

    // Error analysis
    if (failedTests > 0) {
      console.log('\n🚨 ERROR ANALYSIS:');
      const errorCounts: Record<string, number> = {};
      this.testResults.forEach(result => {
        if (result.error) {
          errorCounts[result.error.code] = (errorCounts[result.error.code] || 0) + 1;
        }
      });

      console.log('  Most common errors:');
      Object.entries(errorCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([code, count]) => {
          console.log(`    ${code}: ${count} occurrences`);
        });
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (failedTests > 0) {
      console.log('  • Review failed test cases and implement specific fixes');
      console.log('  • Consider adding more robust error handling for common failure patterns');
    }
    if (avgProcessingTime > 10000) {
      console.log('  • Consider optimizing processing time for large files');
      console.log('  • Implement more efficient text extraction methods');
    }
    if (totalWarnings > totalTests * 2) {
      console.log('  • High number of warnings detected - review parsing accuracy');
      console.log('  • Consider improving pattern matching algorithms');
    }

    console.log('\n✨ Test report generation completed!');
    console.log('='.repeat(60));
  }

  // Export results for further analysis
  exportResults(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.testResults.length,
        successfulTests: this.testResults.filter(r => r.success).length,
        failedTests: this.testResults.filter(r => !r.success).length,
        avgProcessingTime: this.testResults.reduce((sum, r) => sum + r.processingTime, 0) / this.testResults.length
      },
      results: this.testResults,
      errorStatistics: ErrorHandler.getErrorStatistics(),
      logSummary: ParserLogger.getLogsSummary()
    }, null, 2);
  }
}

// Usage example
export async function runProductionTests(): Promise<void> {
  const tester = new ProductionParserTester();
  
  console.log('🚀 Starting Production Resume Parser Tests...\n');
  
  // Run different test suites
  await tester.runTestSuite('default');
  
  // Export results
  const results = tester.exportResults();
  console.log('\n📄 Detailed results exported to console:');
  console.log(results);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runProductionTests().catch(console.error);
}