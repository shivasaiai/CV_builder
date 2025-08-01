/**
 * Data Extraction Rules Service
 * 
 * This service provides intelligent data extraction from classified resume sections
 * with context-aware parsing for work experience, education, skills, and contact information.
 */

import { WorkExperience, Education, ContactInfo } from '../types';

export interface ExtractionRule {
  name: string;
  patterns: RegExp[];
  priority: number;
  validator?: (match: RegExpMatchArray, context: string) => boolean;
  transformer?: (match: RegExpMatchArray, context: string) => any;
}

export interface ExtractionResult<T> {
  data: T;
  confidence: number;
  source: string;
  warnings: string[];
}

export interface ContactExtractionResult extends ExtractionResult<ContactInfo> {}
export interface WorkExperienceExtractionResult extends ExtractionResult<WorkExperience[]> {}
export interface EducationExtractionResult extends ExtractionResult<Education> {}
export interface SkillsExtractionResult extends ExtractionResult<string[]> {}

export class DataExtractionRules {
  
  // Enhanced patterns for contact information extraction
  private static readonly CONTACT_PATTERNS = {
    email: [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
      /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi,
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi
    ],
    phone: [
      /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
      /(?:\+?[\d\s\-\(\)]{10,})/g,
      /\d{3}[\s\-\.]?\d{3}[\s\-\.]?\d{4}/g,
      /\+\d{1,3}[-.\s]?\d{1,14}/g
    ],
    name: [
      /^([A-Z][a-z]+)\s+([A-Z][a-z]+)(?:\s+([A-Z][a-z]+))?$/m,
      /^([A-Z][A-Z\s]+)$/m,
      /^([A-Z][a-zA-Z\s]{2,50})$/m,
      /([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)*[A-Z][a-z]+)/,
      /^([A-Z][a-z]+(?:\s+[A-Za-z]+){1,3})$/m
    ],
    location: [
      /([A-Za-z\s\-]+),?\s*([A-Z]{2,}|[A-Za-z\s]+)(?:\s*,?\s*(\d{5}))?/g,
      /([A-Za-z\s]+),\s*([A-Z]{2})\s*(\d{5})?/g,
      /([A-Za-z\s]+),\s*([A-Za-z\s]+)/g
    ],
    linkedin: [
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/gi,
      /linkedin\.com\/in\/[A-Za-z0-9_-]+/gi,
      /(?:LinkedIn|linkedin):\s*([A-Za-z0-9_-]+)/gi
    ],
    website: [
      /(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}/gi,
      /(?:Portfolio|Website|Site):\s*(https?:\/\/[^\s]+)/gi
    ]
  };

  // Enhanced patterns for work experience extraction
  private static readonly EXPERIENCE_PATTERNS = {
    jobTitle: [
      // Job title patterns - typically at the beginning of experience entries
      /^([A-Z][a-zA-Z\s&,-]+(?:Engineer|Developer|Manager|Director|Analyst|Specialist|Coordinator|Assistant|Lead|Senior|Junior|Principal|Staff|Vice President|VP|CEO|CTO|CFO|COO))/m,
      /^([A-Z][a-zA-Z\s&,-]+(?:Intern|Trainee|Associate|Consultant|Advisor|Executive|Officer|Representative|Administrator|Supervisor|Team Lead))/m,
      /^(Software Engineer|Web Developer|Data Scientist|Product Manager|Project Manager|Business Analyst|UX Designer|UI Designer|DevOps Engineer|Full Stack Developer|Frontend Developer|Backend Developer)/mi,
      /^([A-Z][a-zA-Z\s&,-]{5,50})\s*(?:at|@|\||—|–)/m
    ],
    company: [
      // Company patterns - often after job title or with "at" keyword
      /(?:at|@)\s+([A-Z][a-zA-Z\s&,.-]+(?:Inc|LLC|Corp|Corporation|Company|Ltd|Limited|Group|Solutions|Technologies|Systems|Services)\.?)/gi,
      /(?:at|@)\s+([A-Z][a-zA-Z\s&,.-]{2,50})/gi,
      /\|\s*([A-Z][a-zA-Z\s&,.-]+(?:Inc|LLC|Corp|Corporation|Company|Ltd|Limited|Group|Solutions|Technologies|Systems|Services)\.?)/gi,
      /—\s*([A-Z][a-zA-Z\s&,.-]+)/gi,
      /–\s*([A-Z][a-zA-Z\s&,.-]+)/gi
    ],
    dates: [
      // Enhanced date patterns for work experience
      /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(?:19|20)\d{2})\s*[-–—]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(?:19|20)\d{2}|Present|Current|Now)/gi,
      /(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(?:19|20)\d{2})\s*[-–—]\s*(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(?:19|20)\d{2}|Present|Current|Now)/gi,
      /(?:19|20)\d{2}\s*[-–—]\s*(?:(?:19|20)\d{2}|Present|Current|Now)/gi,
      /(?:\d{1,2}\/\d{4})\s*[-–—]\s*(?:\d{1,2}\/\d{4}|Present|Current|Now)/gi,
      /(?:\d{4})\s*[-–—]\s*(?:\d{4}|Present|Current|Now)/gi
    ],
    location: [
      /(?:Location|Loc):\s*([A-Za-z\s,]+)/gi,
      /([A-Za-z\s]+,\s*[A-Z]{2}(?:\s*\d{5})?)/g,
      /([A-Za-z\s]+,\s*[A-Za-z\s]+)/g
    ]
  };

  // Enhanced patterns for education extraction
  private static readonly EDUCATION_PATTERNS = {
    degree: [
      /(Bachelor(?:'s)?|Master(?:'s)?|PhD|Ph\.D\.|Doctorate|Associate|Diploma|Certificate)\s+(?:of\s+)?(?:Science|Arts|Engineering|Business|Fine Arts|Applied Science|Technology)?\s*(?:in\s+)?([A-Za-z\s&,-]+)/gi,
      /(B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|Ph\.?D\.?|Ed\.?D\.?)\s*(?:in\s+)?([A-Za-z\s&,-]+)/gi,
      /(Bachelor|Master|Doctorate|Associate|Diploma|Certificate)\s+([A-Za-z\s&,-]+)/gi
    ],
    institution: [
      /(?:University|College|Institute|School)\s+of\s+([A-Za-z\s&,-]+)/gi,
      /([A-Za-z\s&,-]+)\s+(?:University|College|Institute|School)/gi,
      /(?:at|from)\s+([A-Z][A-Za-z\s&,-]+(?:University|College|Institute|School))/gi,
      /([A-Z][A-Za-z\s&,-]{5,50}(?:University|College|Institute|School))/gi
    ],
    graduationYear: [
      /(?:Graduated|Graduation|Class of|Expected)?\s*(?:in\s+)?(?:19|20)\d{2}/gi,
      /(?:19|20)\d{2}/g
    ],
    gpa: [
      /GPA:\s*(\d+\.?\d*)/gi,
      /(\d+\.?\d*)\s*\/\s*4\.0/gi,
      /(\d+\.?\d*)\s*GPA/gi
    ]
  };

  // Enhanced patterns for skills extraction
  private static readonly SKILLS_PATTERNS = {
    technical: [
      // Programming languages
      /(JavaScript|TypeScript|Python|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin|Scala|R|MATLAB|Perl|Shell|Bash)/gi,
      // Frameworks and libraries
      /(React|Angular|Vue\.js|Node\.js|Express|Django|Flask|Spring|Laravel|Ruby on Rails|ASP\.NET|jQuery|Bootstrap|Tailwind)/gi,
      // Databases
      /(MySQL|PostgreSQL|MongoDB|Redis|SQLite|Oracle|SQL Server|DynamoDB|Cassandra|Neo4j)/gi,
      // Cloud and DevOps
      /(AWS|Azure|Google Cloud|Docker|Kubernetes|Jenkins|GitLab CI|GitHub Actions|Terraform|Ansible|Chef|Puppet)/gi,
      // Tools and technologies
      /(Git|SVN|Jira|Confluence|Slack|Figma|Adobe Creative Suite|Photoshop|Illustrator|InDesign)/gi
    ],
    soft: [
      /(Leadership|Communication|Problem Solving|Team Work|Project Management|Time Management|Critical Thinking|Creativity|Adaptability|Collaboration)/gi,
      /(Public Speaking|Presentation|Negotiation|Customer Service|Sales|Marketing|Research|Analysis|Planning|Organization)/gi
    ],
    certifications: [
      /(AWS Certified|Microsoft Certified|Google Certified|Cisco Certified|Oracle Certified|Salesforce Certified|PMP|Scrum Master|Agile)/gi
    ]
  };

  /**
   * Extracts contact information from text
   */
  public static extractContactInfo(text: string, contactSection?: string): ContactExtractionResult {
    console.log('📞 === CONTACT EXTRACTION START ===');
    
    const searchText = contactSection || text;
    const contact: ContactInfo = {
      firstName: '',
      lastName: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      email: '',
      linkedin: '',
      website: ''
    };
    
    let confidence = 0;
    const warnings: string[] = [];
    
    // Extract email
    const emailMatch = this.findBestMatch(searchText, this.CONTACT_PATTERNS.email);
    if (emailMatch) {
      contact.email = emailMatch.match[0];
      confidence += 0.3;
      console.log('✓ Email found:', contact.email);
    } else {
      warnings.push('No email address found');
    }
    
    // Extract phone
    const phoneMatch = this.findBestMatch(searchText, this.CONTACT_PATTERNS.phone);
    if (phoneMatch) {
      contact.phone = this.normalizePhone(phoneMatch.match[0]);
      confidence += 0.2;
      console.log('✓ Phone found:', contact.phone);
    } else {
      warnings.push('No phone number found');
    }
    
    // Extract name (try from beginning of text first)
    const nameMatch = this.findBestMatch(text.substring(0, 500), this.CONTACT_PATTERNS.name);
    if (nameMatch) {
      const nameParts = nameMatch.match[0].trim().split(/\s+/);
      contact.firstName = nameParts[0] || '';
      contact.lastName = nameParts.slice(1).join(' ') || '';
      confidence += 0.3;
      console.log('✓ Name found:', `${contact.firstName} ${contact.lastName}`);
    } else {
      warnings.push('No name found');
    }
    
    // Extract location
    const locationMatch = this.findBestMatch(searchText, this.CONTACT_PATTERNS.location);
    if (locationMatch) {
      const locationParts = locationMatch.match;
      contact.city = locationParts[1]?.trim() || '';
      contact.state = locationParts[2]?.trim() || '';
      contact.zip = locationParts[3]?.trim() || '';
      confidence += 0.1;
      console.log('✓ Location found:', `${contact.city}, ${contact.state} ${contact.zip}`);
    }
    
    // Extract LinkedIn
    const linkedinMatch = this.findBestMatch(searchText, this.CONTACT_PATTERNS.linkedin);
    if (linkedinMatch) {
      contact.linkedin = linkedinMatch.match[0];
      confidence += 0.05;
      console.log('✓ LinkedIn found:', contact.linkedin);
    }
    
    // Extract website
    const websiteMatch = this.findBestMatch(searchText, this.CONTACT_PATTERNS.website);
    if (websiteMatch) {
      contact.website = websiteMatch.match[0];
      confidence += 0.05;
      console.log('✓ Website found:', contact.website);
    }
    
    console.log('📞 Contact extraction complete. Confidence:', Math.round(confidence * 100) + '%');
    
    return {
      data: contact,
      confidence,
      source: 'contact_extraction',
      warnings
    };
  }

  /**
   * Extracts work experience from text
   */
  public static extractWorkExperience(text: string, experienceSection?: string): WorkExperienceExtractionResult {
    console.log('💼 === WORK EXPERIENCE EXTRACTION START ===');
    
    const searchText = experienceSection || text;
    const experiences: WorkExperience[] = [];
    const warnings: string[] = [];
    let confidence = 0;
    
    // Split experience section into individual job entries
    const jobEntries = this.splitIntoJobEntries(searchText);
    console.log('📝 Job entries found:', jobEntries.length);
    
    for (let i = 0; i < jobEntries.length; i++) {
      const entry = jobEntries[i];
      console.log(`\n--- Processing Job Entry ${i + 1} ---`);
      console.log('Entry text:', entry.substring(0, 200) + '...');
      
      const experience = this.extractSingleWorkExperience(entry, i);
      
      if (experience.data.jobTitle || experience.data.employer) {
        experiences.push(experience.data);
        confidence += experience.confidence;
        console.log('✓ Experience extracted:', {
          jobTitle: experience.data.jobTitle,
          employer: experience.data.employer,
          dates: `${experience.data.startDate} - ${experience.data.endDate || 'Present'}`
        });
      } else {
        warnings.push(`Could not extract meaningful data from job entry ${i + 1}`);
      }
    }
    
    // Normalize confidence
    confidence = experiences.length > 0 ? confidence / experiences.length : 0;
    
    console.log('💼 Work experience extraction complete:', {
      experiencesFound: experiences.length,
      confidence: Math.round(confidence * 100) + '%'
    });
    
    return {
      data: experiences,
      confidence,
      source: 'experience_extraction',
      warnings
    };
  }

  /**
   * Extracts education information from text
   */
  public static extractEducation(text: string, educationSection?: string): EducationExtractionResult {
    console.log('🎓 === EDUCATION EXTRACTION START ===');
    
    const searchText = educationSection || text;
    const education: Education = {
      school: '',
      location: '',
      degree: '',
      field: '',
      gradYear: '',
      gradMonth: ''
    };
    
    let confidence = 0;
    const warnings: string[] = [];
    
    // Extract degree
    const degreeMatch = this.findBestMatch(searchText, this.EDUCATION_PATTERNS.degree);
    if (degreeMatch) {
      const match = degreeMatch.match;
      education.degree = match[1]?.trim() || match[0]?.trim() || '';
      education.field = match[2]?.trim() || '';
      confidence += 0.4;
      console.log('✓ Degree found:', education.degree, education.field ? `in ${education.field}` : '');
    } else {
      warnings.push('No degree information found');
    }
    
    // Extract institution
    const institutionMatch = this.findBestMatch(searchText, this.EDUCATION_PATTERNS.institution);
    if (institutionMatch) {
      education.school = institutionMatch.match[1]?.trim() || institutionMatch.match[0]?.trim() || '';
      confidence += 0.4;
      console.log('✓ Institution found:', education.school);
    } else {
      warnings.push('No educational institution found');
    }
    
    // Extract graduation year
    const yearMatch = this.findBestMatch(searchText, this.EDUCATION_PATTERNS.graduationYear);
    if (yearMatch) {
      const year = yearMatch.match[0].match(/\d{4}/)?.[0];
      if (year) {
        education.gradYear = year;
        confidence += 0.2;
        console.log('✓ Graduation year found:', education.gradYear);
      }
    } else {
      warnings.push('No graduation year found');
    }
    
    console.log('🎓 Education extraction complete. Confidence:', Math.round(confidence * 100) + '%');
    
    return {
      data: education,
      confidence,
      source: 'education_extraction',
      warnings
    };
  }

  /**
   * Extracts skills from text
   */
  public static extractSkills(text: string, skillsSection?: string): SkillsExtractionResult {
    console.log('🛠️ === SKILLS EXTRACTION START ===');
    
    const searchText = skillsSection || text;
    const skills: Set<string> = new Set();
    const warnings: string[] = [];
    let confidence = 0;
    
    // Extract technical skills
    for (const pattern of this.SKILLS_PATTERNS.technical) {
      const matches = searchText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const skill = match.trim();
          if (skill.length > 1) {
            skills.add(skill);
          }
        });
      }
    }
    
    // Extract soft skills
    for (const pattern of this.SKILLS_PATTERNS.soft) {
      const matches = searchText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const skill = match.trim();
          if (skill.length > 1) {
            skills.add(skill);
          }
        });
      }
    }
    
    // Extract certifications as skills
    for (const pattern of this.SKILLS_PATTERNS.certifications) {
      const matches = searchText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const skill = match.trim();
          if (skill.length > 1) {
            skills.add(skill);
          }
        });
      }
    }
    
    // Also extract from bullet points and comma-separated lists
    const bulletSkills = this.extractBulletPointSkills(searchText);
    bulletSkills.forEach(skill => skills.add(skill));
    
    const commaSkills = this.extractCommaSeparatedSkills(searchText);
    commaSkills.forEach(skill => skills.add(skill));
    
    const skillsArray = Array.from(skills).filter(skill => skill.length > 1);
    
    // Calculate confidence based on number and quality of skills found
    if (skillsArray.length > 0) {
      confidence = Math.min(1.0, skillsArray.length * 0.05); // 5% per skill, max 100%
    } else {
      warnings.push('No skills found');
    }
    
    console.log('🛠️ Skills extraction complete:', {
      skillsFound: skillsArray.length,
      confidence: Math.round(confidence * 100) + '%',
      skills: skillsArray.slice(0, 10) // Show first 10 skills
    });
    
    return {
      data: skillsArray,
      confidence,
      source: 'skills_extraction',
      warnings
    };
  }

  // Helper methods

  private static findBestMatch(text: string, patterns: RegExp[]): { match: RegExpMatchArray; pattern: RegExp } | null {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return { match, pattern };
      }
    }
    return null;
  }

  private static normalizePhone(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX if US number
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    
    return phone; // Return original if can't normalize
  }

  private static splitIntoJobEntries(text: string): string[] {
    // Split by common job entry separators
    const entries = text.split(/\n\s*\n|\n(?=[A-Z][a-zA-Z\s&,-]+(?:Engineer|Developer|Manager|Director|Analyst|Specialist|Coordinator|Assistant|Lead|Senior|Junior|Principal|Staff))/);
    
    return entries
      .map(entry => entry.trim())
      .filter(entry => entry.length > 20); // Filter out very short entries
  }

  private static extractSingleWorkExperience(entryText: string, index: number): ExtractionResult<WorkExperience> {
    const experience: WorkExperience = {
      id: index + 1,
      jobTitle: '',
      employer: '',
      location: '',
      remote: false,
      startDate: null,
      endDate: null,
      current: false,
      accomplishments: ''
    };
    
    let confidence = 0;
    const warnings: string[] = [];
    
    // Extract job title
    const titleMatch = this.findBestMatch(entryText, this.EXPERIENCE_PATTERNS.jobTitle);
    if (titleMatch) {
      experience.jobTitle = titleMatch.match[1]?.trim() || titleMatch.match[0]?.trim() || '';
      confidence += 0.3;
    }
    
    // Extract company
    const companyMatch = this.findBestMatch(entryText, this.EXPERIENCE_PATTERNS.company);
    if (companyMatch) {
      experience.employer = companyMatch.match[1]?.trim() || '';
      confidence += 0.3;
    }
    
    // Extract dates
    const dateMatch = this.findBestMatch(entryText, this.EXPERIENCE_PATTERNS.dates);
    if (dateMatch) {
      const dateRange = dateMatch.match[0];
      const dates = this.parseDateRange(dateRange);
      experience.startDate = dates.start;
      experience.endDate = dates.end;
      experience.current = dates.current;
      confidence += 0.2;
    }
    
    // Extract location
    const locationMatch = this.findBestMatch(entryText, this.EXPERIENCE_PATTERNS.location);
    if (locationMatch) {
      experience.location = locationMatch.match[1]?.trim() || '';
      confidence += 0.1;
    }
    
    // Check for remote work indicators
    if (/remote|work from home|wfh/i.test(entryText)) {
      experience.remote = true;
      confidence += 0.05;
    }
    
    // Extract accomplishments (remaining text after removing title, company, dates)
    let accomplishments = entryText;
    if (titleMatch) accomplishments = accomplishments.replace(titleMatch.match[0], '');
    if (companyMatch) accomplishments = accomplishments.replace(companyMatch.match[0], '');
    if (dateMatch) accomplishments = accomplishments.replace(dateMatch.match[0], '');
    if (locationMatch) accomplishments = accomplishments.replace(locationMatch.match[0], '');
    
    experience.accomplishments = accomplishments.trim();
    if (experience.accomplishments.length > 10) {
      confidence += 0.05;
    }
    
    return {
      data: experience,
      confidence,
      source: 'single_experience_extraction',
      warnings
    };
  }

  private static parseDateRange(dateRange: string): { start: Date | null; end: Date | null; current: boolean } {
    const current = /present|current|now/i.test(dateRange);
    const parts = dateRange.split(/[-–—]/);
    
    let start: Date | null = null;
    let end: Date | null = null;
    
    if (parts.length >= 1) {
      start = this.parseDate(parts[0].trim());
    }
    
    if (parts.length >= 2 && !current) {
      end = this.parseDate(parts[1].trim());
    }
    
    return { start, end, current };
  }

  private static parseDate(dateStr: string): Date | null {
    // Try various date formats
    const formats = [
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{4})/i,
      /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i,
      /(\d{4})/,
      /(\d{1,2})\/(\d{4})/
    ];
    
    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format === formats[3]) { // MM/YYYY format
          return new Date(parseInt(match[2]), parseInt(match[1]) - 1);
        } else {
          return new Date(parseInt(match[1]), 0); // Year only
        }
      }
    }
    
    return null;
  }

  private static extractBulletPointSkills(text: string): string[] {
    const skills: string[] = [];
    const bulletLines = text.split('\n').filter(line => /^[-•*]\s/.test(line.trim()));
    
    for (const line of bulletLines) {
      const skill = line.replace(/^[-•*]\s/, '').trim();
      if (skill.length > 1 && skill.length < 50) {
        skills.push(skill);
      }
    }
    
    return skills;
  }

  private static extractCommaSeparatedSkills(text: string): string[] {
    const skills: string[] = [];
    
    // Look for lines that appear to be comma-separated skill lists
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.includes(',') && line.split(',').length > 2) {
        const potentialSkills = line.split(',').map(s => s.trim());
        
        // Validate that these look like skills (short, no complex sentences)
        const validSkills = potentialSkills.filter(skill => 
          skill.length > 1 && 
          skill.length < 30 && 
          !skill.includes('.') && 
          !/\d{4}/.test(skill) // Exclude years
        );
        
        if (validSkills.length > 2) {
          skills.push(...validSkills);
        }
      }
    }
    
    return skills;
  }

  /**
   * Validates extraction results
   */
  public static validateExtractionResults(results: {
    contact?: ContactExtractionResult;
    experience?: WorkExperienceExtractionResult;
    education?: EducationExtractionResult;
    skills?: SkillsExtractionResult;
  }): { isValid: boolean; warnings: string[]; confidence: number } {
    const warnings: string[] = [];
    let totalConfidence = 0;
    let sectionCount = 0;
    
    // Validate contact
    if (results.contact) {
      sectionCount++;
      totalConfidence += results.contact.confidence;
      if (!results.contact.data.email && !results.contact.data.phone) {
        warnings.push('No contact information found');
      }
    }
    
    // Validate experience
    if (results.experience) {
      sectionCount++;
      totalConfidence += results.experience.confidence;
      if (results.experience.data.length === 0) {
        warnings.push('No work experience found');
      }
    }
    
    // Validate education
    if (results.education) {
      sectionCount++;
      totalConfidence += results.education.confidence;
      if (!results.education.data.school && !results.education.data.degree) {
        warnings.push('No education information found');
      }
    }
    
    // Validate skills
    if (results.skills) {
      sectionCount++;
      totalConfidence += results.skills.confidence;
      if (results.skills.data.length === 0) {
        warnings.push('No skills found');
      }
    }
    
    const overallConfidence = sectionCount > 0 ? totalConfidence / sectionCount : 0;
    const isValid = overallConfidence > 0.3 && warnings.length < 3;
    
    return {
      isValid,
      warnings,
      confidence: overallConfidence
    };
  }
}