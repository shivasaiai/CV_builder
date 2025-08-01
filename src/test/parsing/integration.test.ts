import { describe, it, expect, beforeEach } from 'vitest';
import { MultiStrategyParser } from '@/components/builder/services/parsing/MultiStrategyParser';
import { TEST_DATA_SETS, createMockFile } from './test-data';

describe('Parsing Integration Tests', () => {
  let parser: MultiStrategyParser;

  beforeEach(() => {
    parser = new MultiStrategyParser();
  });

  describe('file format compatibility', () => {
    it('should handle text files correctly', async () => {
      const textContent = `
        John Doe
        Software Engineer
        john.doe@email.com
        (555) 123-4567
        
        EXPERIENCE
        Senior Developer | Tech Corp | 2020-2023
        - Built web applications
        - Led development team
        
        EDUCATION
        BS Computer Science | University | 2020
        
        SKILLS
        JavaScript, Python, React
      `;

      const textFile = new File([textContent], 'resume.txt', { type: 'text/plain' });
      const result = await parser.parseFile(textFile);

      expect(result.text).toContain('John Doe');
      expect(result.text).toContain('Software Engineer');
      expect(result.text).toContain('john.doe@email.com');
      expect(result.text).toContain('EXPERIENCE');
      expect(result.text).toContain('EDUCATION');
      expect(result.text).toContain('SKILLS');
      expect(result.confidence).toBeGreaterThan(70);
    });

    it('should handle different text encodings', async () => {
      const unicodeContent = 'José García\nSoftware Engineer\njoségarcia@email.com\nSkills: JavaScript, Python';
      const textFile = new File([unicodeContent], 'resume-unicode.txt', { type: 'text/plain' });
      
      const result = await parser.parseFile(textFile);
      
      expect(result.text).toContain('José García');
      expect(result.text).toContain('joségarcia@email.com');
    });

    it('should handle files with special characters', async () => {
      const specialContent = `
        John O'Connor
        Senior Developer @ Tech-Corp Inc.
        Email: john.o'connor@tech-corp.com
        Phone: +1 (555) 123-4567
        
        Skills: C++, .NET, Node.js
        Experience: 5+ years
      `;

      const specialFile = new File([specialContent], 'special-chars.txt', { type: 'text/plain' });
      const result = await parser.parseFile(specialFile);

      expect(result.text).toContain("John O'Connor");
      expect(result.text).toContain("john.o'connor@tech-corp.com");
      expect(result.text).toContain("C++");
      expect(result.text).toContain(".NET");
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle empty files gracefully', async () => {
      const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });

      await expect(parser.parseFile(emptyFile)).rejects.toThrow();
    });

    it('should handle very small files', async () => {
      const tinyFile = new File(['Hi'], 'tiny.txt', { type: 'text/plain' });
      
      const result = await parser.parseFile(tinyFile);
      expect(result.text).toBe('Hi');
      expect(result.warnings.length).toBeGreaterThan(0); // Should warn about insufficient content
    });

    it('should handle files with only whitespace', async () => {
      const whitespaceFile = new File(['   \n\t\r\n   '], 'whitespace.txt', { type: 'text/plain' });

      await expect(parser.parseFile(whitespaceFile)).rejects.toThrow();
    });

    it('should handle files with binary content', async () => {
      const binaryContent = new Uint8Array([0, 1, 2, 3, 255, 254, 253]);
      const binaryFile = new File([binaryContent], 'binary.txt', { type: 'text/plain' });

      try {
        const result = await parser.parseFile(binaryFile);
        // If it succeeds, it should at least extract something
        expect(result.text).toBeDefined();
      } catch (error) {
        // Binary content might fail, which is acceptable
        expect(error).toBeDefined();
      }
    });

    it('should handle extremely long lines', async () => {
      const longLine = 'A'.repeat(10000);
      const longContent = `John Doe\n${longLine}\nSoftware Engineer`;
      const longFile = new File([longContent], 'long-lines.txt', { type: 'text/plain' });

      const result = await parser.parseFile(longFile);
      expect(result.text).toContain('John Doe');
      expect(result.text).toContain('Software Engineer');
    });
  });

  describe('resume content validation', () => {
    it('should extract contact information correctly', async () => {
      const resumeContent = `
        Jane Smith
        Senior Software Engineer
        Email: jane.smith@email.com
        Phone: (555) 987-6543
        LinkedIn: linkedin.com/in/janesmith
        Location: San Francisco, CA
      `;

      const resumeFile = new File([resumeContent], 'contact-info.txt', { type: 'text/plain' });
      const result = await parser.parseFile(resumeFile);

      expect(result.text).toContain('Jane Smith');
      expect(result.text).toContain('jane.smith@email.com');
      expect(result.text).toContain('(555) 987-6543');
      expect(result.text).toContain('linkedin.com/in/janesmith');
      expect(result.text).toContain('San Francisco, CA');
    });

    it('should extract work experience correctly', async () => {
      const experienceContent = `
        WORK EXPERIENCE
        
        Senior Software Engineer | Google | 2021-Present
        • Led development of search algorithms
        • Managed team of 8 engineers
        • Improved performance by 35%
        
        Software Engineer | Facebook | 2019-2021
        • Developed React components
        • Implemented GraphQL APIs
        • Collaborated with design team
      `;

      const experienceFile = new File([experienceContent], 'experience.txt', { type: 'text/plain' });
      const result = await parser.parseFile(experienceContent);

      expect(result.text).toContain('Senior Software Engineer');
      expect(result.text).toContain('Google');
      expect(result.text).toContain('2021-Present');
      expect(result.text).toContain('Facebook');
      expect(result.text).toContain('2019-2021');
    });

    it('should extract education information correctly', async () => {
      const educationContent = `
        EDUCATION
        
        Master of Science in Computer Science
        Stanford University | 2019
        GPA: 3.9/4.0
        
        Bachelor of Science in Software Engineering
        UC Berkeley | 2017
        Magna Cum Laude
      `;

      const educationFile = new File([educationContent], 'education.txt', { type: 'text/plain' });
      const result = await parser.parseFile(educationFile);

      expect(result.text).toContain('Master of Science');
      expect(result.text).toContain('Stanford University');
      expect(result.text).toContain('GPA: 3.9/4.0');
      expect(result.text).toContain('UC Berkeley');
      expect(result.text).toContain('Magna Cum Laude');
    });

    it('should extract skills correctly', async () => {
      const skillsContent = `
        TECHNICAL SKILLS
        
        Programming Languages: JavaScript, Python, Java, C++, Go
        Frameworks: React, Angular, Django, Spring Boot, Express
        Databases: PostgreSQL, MongoDB, Redis, MySQL
        Cloud: AWS, Google Cloud, Azure
        Tools: Git, Docker, Kubernetes, Jenkins
      `;

      const skillsFile = new File([skillsContent], 'skills.txt', { type: 'text/plain' });
      const result = await parser.parseFile(skillsFile);

      expect(result.text).toContain('JavaScript');
      expect(result.text).toContain('Python');
      expect(result.text).toContain('React');
      expect(result.text).toContain('PostgreSQL');
      expect(result.text).toContain('AWS');
    });
  });

  describe('real-world resume formats', () => {
    it('should handle chronological resume format', async () => {
      const chronologicalResume = `
        JOHN DOE
        Software Engineer
        john.doe@email.com | (555) 123-4567 | LinkedIn: /in/johndoe
        
        PROFESSIONAL EXPERIENCE
        
        Senior Software Engineer | Tech Corp | Jan 2021 - Present
        • Lead development of microservices architecture
        • Mentor junior developers and conduct code reviews
        • Improved system performance by 40%
        
        Software Engineer | StartupCo | Jun 2019 - Dec 2020
        • Built full-stack web applications using React and Node.js
        • Implemented automated testing and CI/CD pipelines
        • Collaborated with product team on feature development
        
        EDUCATION
        B.S. Computer Science | University of Technology | 2019
        
        SKILLS
        Languages: JavaScript, Python, Java
        Frameworks: React, Node.js, Django
        Tools: Git, Docker, AWS
      `;

      const chronologicalFile = new File([chronologicalResume], 'chronological.txt', { type: 'text/plain' });
      const result = await parser.parseFile(chronologicalFile);

      expect(result.text).toContain('JOHN DOE');
      expect(result.text).toContain('PROFESSIONAL EXPERIENCE');
      expect(result.text).toContain('Senior Software Engineer');
      expect(result.text).toContain('Jan 2021 - Present');
      expect(result.confidence).toBeGreaterThan(80);
    });

    it('should handle functional resume format', async () => {
      const functionalResume = `
        JANE SMITH
        Full-Stack Developer
        jane.smith@email.com | (555) 987-6543
        
        CORE COMPETENCIES
        
        Web Development
        • 5+ years experience with React, Angular, and Vue.js
        • Expert in responsive design and cross-browser compatibility
        • Proficient in modern JavaScript (ES6+) and TypeScript
        
        Backend Development
        • Extensive experience with Node.js, Python, and Java
        • Database design and optimization (SQL and NoSQL)
        • RESTful API development and microservices architecture
        
        EMPLOYMENT HISTORY
        Senior Developer | Various Companies | 2018-Present
        Developer | Tech Startups | 2016-2018
        
        EDUCATION
        M.S. Computer Science | Tech University | 2016
      `;

      const functionalFile = new File([functionalResume], 'functional.txt', { type: 'text/plain' });
      const result = await parser.parseFile(functionalFile);

      expect(result.text).toContain('JANE SMITH');
      expect(result.text).toContain('CORE COMPETENCIES');
      expect(result.text).toContain('Web Development');
      expect(result.text).toContain('Backend Development');
      expect(result.confidence).toBeGreaterThan(75);
    });

    it('should handle combination resume format', async () => {
      const combinationResume = `
        ALEX JOHNSON
        DevOps Engineer
        alex.johnson@email.com | (555) 456-7890 | GitHub: alexjohnson
        
        SUMMARY
        Experienced DevOps Engineer with 7+ years in cloud infrastructure,
        automation, and continuous integration/deployment.
        
        KEY SKILLS
        • Cloud Platforms: AWS, Azure, Google Cloud
        • Containerization: Docker, Kubernetes
        • Infrastructure as Code: Terraform, CloudFormation
        • CI/CD: Jenkins, GitLab CI, GitHub Actions
        
        PROFESSIONAL EXPERIENCE
        
        Senior DevOps Engineer | CloudTech Inc. | 2020-Present
        • Designed and implemented scalable cloud infrastructure
        • Reduced deployment time by 60% through automation
        • Led migration of legacy systems to containerized architecture
        
        DevOps Engineer | DataCorp | 2018-2020
        • Maintained CI/CD pipelines for 20+ microservices
        • Implemented monitoring and alerting systems
        • Collaborated with development teams on deployment strategies
        
        EDUCATION & CERTIFICATIONS
        B.S. Information Technology | State University | 2017
        AWS Certified Solutions Architect | 2019
        Certified Kubernetes Administrator | 2020
      `;

      const combinationFile = new File([combinationResume], 'combination.txt', { type: 'text/plain' });
      const result = await parser.parseFile(combinationFile);

      expect(result.text).toContain('ALEX JOHNSON');
      expect(result.text).toContain('DevOps Engineer');
      expect(result.text).toContain('SUMMARY');
      expect(result.text).toContain('KEY SKILLS');
      expect(result.text).toContain('PROFESSIONAL EXPERIENCE');
      expect(result.confidence).toBeGreaterThan(85);
    });
  });

  describe('multilingual content', () => {
    it('should handle resumes with mixed languages', async () => {
      const multilingualContent = `
        María González
        Desarrolladora de Software / Software Developer
        Email: maria.gonzalez@email.com
        Teléfono: +34 123 456 789
        
        EXPERIENCIA PROFESIONAL / PROFESSIONAL EXPERIENCE
        
        Desarrolladora Senior | Tech España | 2021-Presente
        • Desarrollo de aplicaciones web con React y Node.js
        • Liderazgo de equipo de 5 desarrolladores
        
        EDUCACIÓN / EDUCATION
        Ingeniería Informática | Universidad Politécnica | 2020
        
        HABILIDADES / SKILLS
        Lenguajes: JavaScript, Python, Java
        Idiomas: Español (nativo), Inglés (fluido), Francés (básico)
      `;

      const multilingualFile = new File([multilingualContent], 'multilingual.txt', { type: 'text/plain' });
      const result = await parser.parseFile(multilingualFile);

      expect(result.text).toContain('María González');
      expect(result.text).toContain('Desarrolladora de Software');
      expect(result.text).toContain('Software Developer');
      expect(result.text).toContain('JavaScript');
      expect(result.text).toContain('Español');
    });
  });

  describe('test data set validation', () => {
    it('should process all test files from basic-text-files dataset', async () => {
      const basicDataSet = TEST_DATA_SETS.find(ds => ds.name === 'basic-text-files');
      expect(basicDataSet).toBeDefined();

      for (const testFile of basicDataSet!.files) {
        const mockFile = createMockFile(testFile);
        
        if (testFile.expectedChallenges.includes('insufficient-data')) {
          const result = await parser.parseFile(mockFile);
          expect(result.warnings.length).toBeGreaterThan(0);
        } else {
          const result = await parser.parseFile(mockFile);
          expect(result.text).toBeDefined();
          expect(result.text.length).toBeGreaterThan(0);
        }
      }
    });

    it('should handle problematic files according to test specifications', async () => {
      const problematicDataSet = TEST_DATA_SETS.find(ds => ds.name === 'problematic-files');
      expect(problematicDataSet).toBeDefined();

      for (const testFile of problematicDataSet!.files) {
        const mockFile = createMockFile(testFile);
        
        if (testFile.characteristics.includes('empty-file')) {
          await expect(parser.parseFile(mockFile)).rejects.toThrow();
        } else if (testFile.characteristics.includes('corrupted-data')) {
          try {
            const result = await parser.parseFile(mockFile);
            // Should extract some content despite corruption
            expect(result.text).toBeDefined();
          } catch (error) {
            // Acceptable for corrupted files to fail
            expect(error).toBeDefined();
          }
        } else if (testFile.characteristics.includes('large-file')) {
          const result = await parser.parseFile(mockFile);
          expect(result.text).toBeDefined();
          expect(result.processingTime).toBeLessThan(5000); // Should complete within 5 seconds
        }
      }
    });
  });
});