import { ResumeData, ContactInfo, WorkExperience, Education } from '../types';
import Tesseract from 'tesseract.js';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.js?worker';

if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
}

export interface ParsedResumeData {
  contact: Partial<ContactInfo>;
  workExperiences: Partial<WorkExperience>[];
  education: Partial<Education>;
  skills: string[];
  summary: string;
  rawText: string;
}

// Enhanced patterns for better extraction
const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
  name: /^([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*)/,
  location: /([A-Za-z\s]+),\s*([A-Z]{2})\s*(?:\d{5})?/g,
  dates: /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(?:19|20)\d{2}/g,
  section: {
    experience: /(?:^|\n)\s*(EXPERIENCE|WORK\s+EXPERIENCE|EMPLOYMENT\s+HISTORY|PROFESSIONAL\s+EXPERIENCE|CAREER\s+HISTORY)\s*:?/i,
    education: /(?:^|\n)\s*(EDUCATION|ACADEMIC\s+BACKGROUND|QUALIFICATIONS)\s*:?/i,
    skills: /(?:^|\n)\s*(SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|EXPERTISE)\s*:?/i,
    summary: /(?:^|\n)\s*(SUMMARY|PROFILE|OBJECTIVE|PROFESSIONAL\s+SUMMARY|CAREER\s+OBJECTIVE)\s*:?/i
  }
};

export class EnhancedResumeParser {
  /**
   * Parse uploaded file and extract resume data
   */
  static async parseFile(file: File): Promise<ParsedResumeData> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
      let text = '';
      
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        text = await this.parsePDF(file);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
      ) {
        text = await this.parseDocx(file);
      } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        text = await file.text();
      } else {
        throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT files.');
      }

      return this.parseTextContent(text);
    } catch (error) {
      console.error('Error parsing file:', error);
      throw new Error('Failed to parse resume. Please check the file format and try again.');
    }
  }

  /**
   * Parse PDF files (enhanced version)
   */
  private static async parsePDF(file: File, onProgress?: (page: number, total: number) => void): Promise<string> {
    try {
      // Try to use pdf.js to extract text
      if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
        return await this.parsePDFWithPDFJS(file);
      }
      // Fallback to basic text extraction
      const text = await this.extractTextFromFile(file);
      if (text && text.trim().length > 10) return text;
      // If text is empty, fallback to OCR
      return await this.ocrPDF(file, onProgress);
    } catch (error) {
      // Final fallback: OCR
      return await this.ocrPDF(file, onProgress);
    }
  }

  /**
   * Parse PDF using PDF.js (if available)
   */
  private static async parsePDFWithPDFJS(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      // Check if 'str' property exists before mapping
      const pageText = textContent.items.map(item => {
        if ('str' in item) {
          return item.str;
        }
        return '';
      }).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  }

  /**
   * OCR fallback for image-based PDFs
   * @param file PDF file
   * @param onProgress Optional callback for progress (page, totalPages)
   */
  static async ocrPDF(file: File, onProgress?: (page: number, total: number) => void): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
      fullText += text + '\n';
      if (onProgress) onProgress(i, pdf.numPages);
    }
    return fullText;
  }

  /**
   * Parse DOCX files (enhanced version)
   */
  private static async parseDocx(file: File): Promise<string> {
    try {
      if (typeof window !== 'undefined' && (window as any).mammoth) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await (window as any).mammoth.extractRawText({ arrayBuffer });
        return result.value;
      }
      
      return await this.extractTextFromFile(file);
    } catch (error) {
      console.warn('DOCX parsing failed, using basic text extraction:', error);
      return await this.extractTextFromFile(file);
    }
  }

  /**
   * Extract text from file (fallback method)
   */
  private static async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string || '';
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Parse text content and extract structured data (enhanced)
   */
  private static parseTextContent(text: string): ParsedResumeData {
    // Clean and normalize text
    const cleanText = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/ +/g, ' ')
      .trim();

    return {
      contact: this.extractContactInfo(cleanText) || {},
      workExperiences: this.extractWorkExperience(cleanText) || [],
      education: this.extractEducation(cleanText) || {},
      skills: this.extractSkills(cleanText) || [],
      summary: this.extractSummary(cleanText) || '',
      rawText: cleanText
    };
  }

  /**
   * Extract contact information (enhanced)
   */
  private static extractContactInfo(text: string): ContactInfo {
    const contact: ContactInfo = {
      firstName: '', lastName: '', city: '', state: '', zip: '', phone: '', email: ''
    };
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Extract email
    const emailMatches = text.match(PATTERNS.email);
    if (emailMatches && emailMatches.length > 0) {
      contact.email = emailMatches[0];
    }

    // Extract phone number
    const phoneMatches = text.match(PATTERNS.phone);
    if (phoneMatches && phoneMatches.length > 0) {
      contact.phone = phoneMatches[0];
    }

    // Extract name (improved logic)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line.length > 50 || line.toLowerCase().includes('resume') || line.toLowerCase().includes('cv')) {
        continue;
      }
      
      const nameMatch = line.match(PATTERNS.name);
      if (nameMatch && nameMatch[0].split(' ').length >= 2) {
        const nameParts = nameMatch[0].split(' ');
        contact.firstName = nameParts[0];
        contact.lastName = nameParts.slice(1).join(' ');
        break;
      }
    }

    // Extract location
    const locationMatches = text.match(PATTERNS.location);
    if (locationMatches && locationMatches.length > 0) {
      const match = locationMatches[0];
      const parts = match.split(',');
      if (parts.length >= 2) {
        contact.city = parts[0].trim();
        const stateZip = parts[1].trim().split(' ');
        contact.state = stateZip[0];
        if (stateZip.length > 1) {
          contact.zip = stateZip[1];
        }
      }
    }

    return contact;
  }

  /**
   * Extract work experience (enhanced)
   */
  private static extractWorkExperience(text: string): WorkExperience[] {
    const experiences: WorkExperience[] = [];
    // More robust section detection
    const experienceMatch = text.match(new RegExp(`(${PATTERNS.section.experience.source})([\\s\\S]*?)(?=${PATTERNS.section.education.source}|${PATTERNS.section.skills.source}|$)`, 'i'));
    if (!experienceMatch) return [EnhancedResumeParser.createEmptyWorkExperience()];
    const experienceSection = experienceMatch[2];
    const lines = experienceSection.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let currentExp: WorkExperience = EnhancedResumeParser.createEmptyWorkExperience(); // Initialize with an empty structure
    let expId = 1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (this.looksLikeJobTitle(line)) {
        if (currentExp.jobTitle) experiences.push(currentExp); // Only push if it has content
        const { jobTitle, employer } = this.parseJobTitleLine(line);
        currentExp = { ...EnhancedResumeParser.createEmptyWorkExperience(), id: expId++, jobTitle, employer };
        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
          const nextLine = lines[j];
          if (this.looksLikeDateRange(nextLine)) {
            const dates = this.extractDates(nextLine);
            if (dates.start) currentExp.startDate = dates.start;
            if (dates.end) currentExp.endDate = dates.end;
            if (dates.current) currentExp.current = dates.current;
          }
        }
      } else if (currentExp.id && line.length > 20 && !this.looksLikeDateRange(line)) {
        currentExp.accomplishments = currentExp.accomplishments 
          ? currentExp.accomplishments + '\n' + line
          : line;
      }
    }
    if (currentExp.jobTitle) experiences.push(currentExp); // Push the last one if it has content
    return experiences.length > 0 ? experiences : [EnhancedResumeParser.createEmptyWorkExperience()];
  }

  private static createEmptyWorkExperience(): WorkExperience {
    return {
      id: 0, // Will be updated with expId++
      jobTitle: "",
      employer: "",
      location: "",
      remote: false,
      startDate: null,
      endDate: null,
      current: false,
      accomplishments: "",
    };
  }

  /**
   * Check if a line looks like a job title
   */
  private static looksLikeJobTitle(line: string): boolean {
    // Job titles usually:
    // - Are not too long
    // - Don't start with bullets or numbers
    // - May contain common job title words
    if (line.length > 100 || line.length < 5) return false;
    if (/^[\s]*[-•·\d]/.test(line)) return false;
    
    const jobKeywords = /(?:manager|director|engineer|developer|analyst|specialist|coordinator|assistant|lead|senior|junior|intern)/i;
    return jobKeywords.test(line) || line.split(' ').length <= 6;
  }

  /**
   * Parse job title line to extract job title and company
   */
  private static parseJobTitleLine(line: string): { jobTitle: string; employer: string } {
    // Common patterns: "Job Title at Company", "Job Title | Company", "Job Title - Company"
    const patterns = [
      /^(.+?)\s+at\s+(.+)$/i,
      /^(.+?)\s*[\|\-–—]\s*(.+)$/,
      /^(.+?),\s*(.+)$/
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        return {
          jobTitle: match[1].trim(),
          employer: match[2].trim()
        };
      }
    }

    // If no pattern matches, treat entire line as job title
    return {
      jobTitle: line.trim(),
      employer: ''
    };
  }

  /**
   * Check if a line looks like a date range
   */
  private static looksLikeDateRange(line: string): boolean {
    return /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present|Current)|(?:19|20)\d{2})/.test(line) &&
           line.length < 50;
  }

  /**
   * Extract dates from a line
   */
  private static extractDates(line: string): { start: Date | null; end: Date | null; current: boolean } {
    const result = { start: null as Date | null, end: null as Date | null, current: false };
    
    if (/present|current|till date/i.test(line)) {
      result.current = true;
    }

    const dateMatches = line.match(PATTERNS.dates);
    if (dateMatches && dateMatches.length > 0) {
      try {
        result.start = new Date(dateMatches[0]);
        if (dateMatches.length > 1 && !result.current) {
          result.end = new Date(dateMatches[1]);
        }
      } catch (error) {
        // Date parsing failed, ignore
      }
    }

    return result;
  }

  /**
   * Extract education (enhanced)
   */
  private static extractEducation(text: string): Education {
    const education: Education = {
      school: '', location: '', degree: '', field: '', gradYear: '', gradMonth: ''
    };

    const educationMatch = text.match(new RegExp(`(${PATTERNS.section.education.source})([\\s\\S]*?)(?=${PATTERNS.section.experience.source}|${PATTERNS.section.skills.source}|$)`, 'i'));
    
    if (!educationMatch) return education;

    const eduSection = educationMatch[2];
    
    // Extract degree
    const degreePatterns = [
      /(Bachelor|Master|PhD|Doctorate|Associate|B\.?[ASM]\.?|M\.?[ASB]\.?|Ph\.?D\.?)[^\n]*/i,
      /(Degree|Diploma|Certificate)[^\n]*/i
    ];

    for (const pattern of degreePatterns) {
      const match = eduSection.match(pattern);
      if (match) {
        education.degree = match[0].trim();
        break;
      }
    }

    // Extract school
    const schoolPatterns = [
      /(University|College|Institute|School)[^\n]*/i,
      /([A-Z][a-z]+\s+(?:University|College|Institute|School))/i
    ];

    for (const pattern of schoolPatterns) {
      const match = eduSection.match(pattern);
      if (match) {
        education.school = match[0].trim();
        break;
      }
    }

    // Extract graduation year
    const yearMatches = eduSection.match(/20\d{2}|19\d{2}/g);
    if (yearMatches && yearMatches.length > 0) {
      education.gradYear = yearMatches[yearMatches.length - 1]; // Use the latest year
    }

    return education;
  }

  /**
   * Extract skills (enhanced)
   */
  private static extractSkills(text: string): string[] {
    const skills: string[] = [];
    const skillsMatch = text.match(new RegExp(`(${PATTERNS.section.skills.source})([\\s\\S]*?)(?=${PATTERNS.section.experience.source}|${PATTERNS.section.education.source}|$)`, 'i'));
    if (!skillsMatch) return [];
    const skillsSection = skillsMatch[2];
    
    // Extract skills from various formats
    const lines = skillsSection.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    for (const line of lines) {
      // Skills separated by commas, semicolons, or bullets
      const skillPatterns = [
        /(?:^|\s)([A-Za-z+#.]+(?:\s+[A-Za-z+#.]+){0,2})(?:\s*[,;•·]|\s*$)/g,
        /(?:^|\s)([A-Z][A-Za-z+#.]*(?:\.[A-Za-z+#.]*)*)/g
      ];

      for (const pattern of skillPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const skill = match[1].trim();
          if (skill.length > 1 && skill.length < 30 && !skills.includes(skill)) {
            skills.push(skill);
          }
        }
      }
    }

    return skills;
  }

  /**
   * Extract summary/objective (enhanced)
   */
  private static extractSummary(text: string): string {
    const summaryMatch = text.match(new RegExp(`(${PATTERNS.section.summary.source})([\\s\\S]*?)(?=${PATTERNS.section.experience.source}|${PATTERNS.section.education.source}|${PATTERNS.section.skills.source}|$)`, 'i'));
    
    if (!summaryMatch) return '';

    const summarySection = summaryMatch[2];
    const lines = summarySection.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Take the first few lines that look like summary content
    const summaryLines = lines.slice(0, 5).filter(line => 
      line.length > 20 && 
      !line.toLowerCase().includes('contact') &&
      !line.toLowerCase().includes('phone') &&
      !line.toLowerCase().includes('email')
    );

    return summaryLines.join(' ').substring(0, 500);
  }

  /**
   * Convert parsed data to ResumeData format
   */
  static convertToResumeData(parsedData: ParsedResumeData): ResumeData {
    // Ensure all fields are explicitly defined to match ResumeData required properties
    const contact: ContactInfo = {
      firstName: parsedData.contact.firstName || '',
      lastName: parsedData.contact.lastName || '',
      email: parsedData.contact.email || '',
      phone: parsedData.contact.phone || '',
      city: parsedData.contact.city || '',
      state: parsedData.contact.state || '',
      zip: parsedData.contact.zip || '',
    };

    const workExperiences: WorkExperience[] = parsedData.workExperiences.length > 0 
      ? parsedData.workExperiences.map(exp => ({ 
          ...EnhancedResumeParser.createEmptyWorkExperience(), // Ensure all fields are present
          ...exp, // Override with parsed data
          id: exp.id || Math.random(), // Ensure ID is always set
        })) 
      : [EnhancedResumeParser.createEmptyWorkExperience()];

    const education: Education = {
      school: parsedData.education.school || '',
      location: parsedData.education.location || '',
      degree: parsedData.education.degree || '',
      field: parsedData.education.field || '',
      gradYear: parsedData.education.gradYear || '',
      gradMonth: parsedData.education.gradMonth || '',
    };

    return {
      contact: contact,
      workExperiences: workExperiences,
      education: education,
      skills: parsedData.skills || [],
      summary: parsedData.summary || '',
      // Initialize other arrays/objects to empty if not provided in parsedData
      projects: [],
      certifications: [],
      languages: [],
      volunteerExperiences: [],
      publications: [],
      awards: [],
      references: [],
      activeSections: { // Default active sections
        contact: true,
        summary: true,
        experience: true,
        education: true,
        skills: true,
        projects: false,
        certifications: false,
        languages: false,
        volunteer: false,
        publications: false,
        awards: false,
        references: false
      }
    };
  }
} 