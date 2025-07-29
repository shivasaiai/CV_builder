import { ResumeData, ContactInfo, WorkExperience, Education } from '../types';

export interface ParsedResumeData {
  contact: Partial<ContactInfo>;
  workExperiences: Partial<WorkExperience>[];
  education: Partial<Education>;
  skills: string[];
  summary: string;
  rawText: string;
}

export class ResumeParser {
  /**
   * Parse uploaded file and extract resume data
   */
  static async parseFile(file: File): Promise<ParsedResumeData> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return await this.parsePDF(file);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
      ) {
        return await this.parseDocx(file);
      } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        return await this.parseText(file);
      } else {
        throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT files.');
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      throw new Error('Failed to parse resume. Please check the file format and try again.');
    }
  }

  /**
   * Parse PDF files using PDF.js (simplified version)
   */
  private static async parsePDF(file: File): Promise<ParsedResumeData> {
    // For now, we'll use a simplified approach
    // In production, you'd want to use PDF.js or a similar library
    const text = await this.extractTextFromFile(file);
    return this.parseTextContent(text);
  }

  /**
   * Parse DOCX files
   */
  private static async parseDocx(file: File): Promise<ParsedResumeData> {
    // For now, we'll use a simplified approach
    // In production, you'd want to use mammoth.js or similar library
    const text = await this.extractTextFromFile(file);
    return this.parseTextContent(text);
  }

  /**
   * Parse plain text files
   */
  private static async parseText(file: File): Promise<ParsedResumeData> {
    const text = await file.text();
    return this.parseTextContent(text);
  }

  /**
   * Extract text from file (simplified version)
   */
  private static async extractTextFromFile(file: File): Promise<string> {
    // This is a simplified implementation
    // In production, you'd use proper libraries for each file type
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string || '';
        resolve(result);
      };
      reader.readAsText(file);
    });
  }

  /**
   * Parse text content and extract structured data
   */
  private static parseTextContent(text: string): ParsedResumeData {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return {
      contact: this.extractContactInfo(text),
      workExperiences: this.extractWorkExperience(text),
      education: this.extractEducation(text),
      skills: this.extractSkills(text),
      summary: this.extractSummary(text),
      rawText: text
    };
  }

  /**
   * Extract contact information
   */
  private static extractContactInfo(text: string): Partial<ContactInfo> {
    const contact: Partial<ContactInfo> = {};
    
    // Extract email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      contact.email = emailMatch[0];
    }

    // Extract phone number
    const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
    if (phoneMatch) {
      contact.phone = phoneMatch[0];
    }

    // Extract name (first few words that are capitalized)
    const lines = text.split('\n');
    const nameMatch = lines[0]?.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/);
    if (nameMatch) {
      const nameParts = nameMatch[0].split(' ');
      contact.firstName = nameParts[0];
      contact.lastName = nameParts.slice(1).join(' ');
    }

    // Extract location (city, state)
    const locationMatch = text.match(/([A-Za-z\s]+),\s*([A-Z]{2})/);
    if (locationMatch) {
      contact.city = locationMatch[1].trim();
      contact.state = locationMatch[2];
    }

    return contact;
  }

  /**
   * Extract work experience
   */
  private static extractWorkExperience(text: string): Partial<WorkExperience>[] {
    const experiences: Partial<WorkExperience>[] = [];
    
    // Look for common work experience patterns
    const experiencePatterns = [
      /EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT/i,
      /PROFESSIONAL EXPERIENCE/i,
      /CAREER HISTORY/i
    ];

    let experienceSection = '';
    for (const pattern of experiencePatterns) {
      const match = text.match(new RegExp(`${pattern.source}([\\s\\S]*?)(?=EDUCATION|SKILLS|$)`, 'i'));
      if (match) {
        experienceSection = match[1];
        break;
      }
    }

    if (experienceSection) {
      // Extract job titles and companies
      const jobMatches = experienceSection.match(/([A-Z][A-Za-z\s]+)\s*[-–—]\s*([A-Z][A-Za-z\s&.,]+)/g);
      
      jobMatches?.forEach((match, index) => {
        const parts = match.split(/[-–—]/);
        if (parts.length >= 2) {
          experiences.push({
            id: index + 1,
            jobTitle: parts[0].trim(),
            employer: parts[1].trim(),
            accomplishments: '',
          });
        }
      });
    }

    return experiences.length > 0 ? experiences : [{
      id: 1,
      jobTitle: '',
      employer: '',
      accomplishments: '',
    }];
  }

  /**
   * Extract education
   */
  private static extractEducation(text: string): Partial<Education> {
    const education: Partial<Education> = {};

    // Look for education section
    const educationMatch = text.match(/EDUCATION([\\s\\S]*?)(?=EXPERIENCE|SKILLS|$)/i);
    if (educationMatch) {
      const eduSection = educationMatch[1];
      
      // Extract degree
      const degreeMatch = eduSection.match(/(Bachelor|Master|PhD|Associate|Doctorate)[^\\n]*/i);
      if (degreeMatch) {
        education.degree = degreeMatch[0].trim();
      }

      // Extract school
      const schoolMatch = eduSection.match(/University|College|Institute|School[^\\n]*/i);
      if (schoolMatch) {
        education.school = schoolMatch[0].trim();
      }

      // Extract graduation year
      const yearMatch = eduSection.match(/20\d{2}|19\d{2}/);
      if (yearMatch) {
        education.gradYear = yearMatch[0];
      }
    }

    return education;
  }

  /**
   * Extract skills
   */
  private static extractSkills(text: string): string[] {
    const skills: string[] = [];

    // Look for skills section
    const skillsMatch = text.match(/SKILLS([\\s\\S]*?)(?=EXPERIENCE|EDUCATION|$)/i);
    if (skillsMatch) {
      const skillsSection = skillsMatch[1];
      
      // Extract skills separated by commas, bullets, or new lines
      const skillMatches = skillsSection.match(/[A-Za-z+#.]+(?:\s+[A-Za-z+#.]+)*/g);
      if (skillMatches) {
        skillMatches.forEach(skill => {
          const cleanSkill = skill.trim();
          if (cleanSkill.length > 1 && cleanSkill.length < 30) {
            skills.push(cleanSkill);
          }
        });
      }
    }

    return skills;
  }

  /**
   * Extract summary/objective
   */
  private static extractSummary(text: string): string {
    const summaryPatterns = [
      /SUMMARY([\\s\\S]*?)(?=EXPERIENCE|EDUCATION|SKILLS|$)/i,
      /OBJECTIVE([\\s\\S]*?)(?=EXPERIENCE|EDUCATION|SKILLS|$)/i,
      /PROFILE([\\s\\S]*?)(?=EXPERIENCE|EDUCATION|SKILLS|$)/i
    ];

    for (const pattern of summaryPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().substring(0, 500); // Limit summary length
      }
    }

    return '';
  }

  /**
   * Convert parsed data to ResumeData format
   */
  static convertToResumeData(parsedData: ParsedResumeData): Partial<ResumeData> {
    return {
      contact: {
        firstName: parsedData.contact.firstName || '',
        lastName: parsedData.contact.lastName || '',
        email: parsedData.contact.email || '',
        phone: parsedData.contact.phone || '',
        city: parsedData.contact.city || '',
        state: parsedData.contact.state || '',
        zip: parsedData.contact.zip || '',
      },
      workExperiences: parsedData.workExperiences.map((exp, index) => ({
        id: exp.id || index + 1,
        jobTitle: exp.jobTitle || '',
        employer: exp.employer || '',
        location: exp.location || '',
        remote: exp.remote || false,
        startDate: exp.startDate || null,
        endDate: exp.endDate || null,
        current: exp.current || false,
        accomplishments: exp.accomplishments || '',
      })),
      education: {
        school: parsedData.education.school || '',
        location: parsedData.education.location || '',
        degree: parsedData.education.degree || '',
        field: parsedData.education.field || '',
        gradYear: parsedData.education.gradYear || '',
        gradMonth: parsedData.education.gradMonth || '',
      },
      skills: parsedData.skills,
      summary: parsedData.summary,
    };
  }
} 