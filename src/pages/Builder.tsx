import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaPhone, FaEnvelope, FaLinkedin, FaMapMarkerAlt, FaGraduationCap, FaGlobe, FaCar, FaPiedPiper } from 'react-icons/fa';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import CleanChromatic from "@/components/resume-templates/CleanChromatic";
import ContemporaryContrast from "@/components/resume-templates/ContemporaryContrast";
import TranquilChroma from "@/components/resume-templates/TranquilChroma";
import CreativeFlare from "@/components/resume-templates/CreativeFlare";
import ExecutiveProfessional from "@/components/resume-templates/ExecutiveProfessional";
import MinimalModern from "@/components/resume-templates/MinimalModern";
import ClassicTimeless from "@/components/resume-templates/ClassicTimeless";
import TechFocused from "@/components/resume-templates/TechFocused";
import CorporateElite from "@/components/resume-templates/CorporateElite";
import ModernGrid from "@/components/resume-templates/ModernGrid";
import CreativeEdge from "@/components/resume-templates/CreativeEdge";
import ProfessionalClean from "@/components/resume-templates/ProfessionalClean";
import IndustryStandard from "@/components/resume-templates/IndustryStandard";
import ModernMinimal from "@/components/resume-templates/ModernMinimal";
import Design7Template from "@/components/resume-templates/Design7Template";
import Design8Template from "@/components/resume-templates/Design8Template";
import Design9Template from "@/components/resume-templates/Design9Template";

const sections = [
  "Heading",
  "Experience",
  "Education",
  "Skills",
  "Summary",
  "Finalize"
];

const workRecommendations = {
  "Developer": [
    "Worked closely with clients to gather requirements and translate them into technical specifications for implementation.",
    "Continuously updated skills through training courses, workshops, and self-study—staying current on industry trends and emerging technologies.",
    "Debugged complex software issues, leading to a more stable product release.",
    "Collaborated with cross-functional teams to ensure seamless integration of new features.",
    "Participated in regular code reviews, ensuring high-quality standards were consistently met across all development efforts.",
    "Adapted quickly to new technologies and programming languages, enhancing overall team productivity."
  ],
  "Software Developer": [
    "Developed and maintained web applications using modern frameworks and technologies.",
    "Collaborated with product managers and designers to implement user-friendly interfaces.",
    "Optimized application performance, reducing load times by 40%.",
    "Wrote comprehensive unit tests to ensure code quality and reliability.",
    "Participated in agile development processes and sprint planning sessions."
  ],
  "Web Developer": [
    "Built responsive websites using HTML, CSS, and JavaScript frameworks.",
    "Integrated third-party APIs and services to enhance website functionality.",
    "Optimized websites for search engines, improving organic traffic by 25%.",
    "Collaborated with design teams to ensure pixel-perfect implementation of mockups.",
    "Maintained and updated existing websites to meet current web standards."
  ]
};

const relatedJobTitles = {
  "Developer": ["Software Developer", "Web Developer", "Frontend Developer", "Backend Developer"],
  "Software Developer": ["Developer", "Web Developer", "Full Stack Developer"],
  "Web Developer": ["Developer", "Software Developer", "Frontend Developer"]
};

const summaryRecommendations = [
  "Highly motivated and experienced customer service representative with over [number] years of experience in providing excellent customer service. Possesses strong communication, problem-solving, and customer service skills.",
  "Professional customer service representative with [number] years of experience in providing exceptional customer service. Possesses strong communication, problem-solving, and customer service skills. Experienced in handling customer complaints, inquiries, and requests.",
  "Results-oriented customer service representative with [number] years of experience in providing outstanding customer service. Possesses excellent interpersonal, problem-solving, and customer service skills.",
];

const skillsList = [
  "Customer Service", "Resolving Conflict", "Phone Operations", "Office Applications", "Conflict resolution", "Persuasive Speaking", "Cash Register", "Office Equipment", "Helpfulness", "Inventory Management", "Attentiveness", "Training & Development", "Market Knowledge", "Quick Learning Ability", "Customer Care", "Upselling", "Employee Scheduling", "Stress Management"
];

const templates = {
  "Clean Chromatic": CleanChromatic,
  "Contemporary Contrast": ContemporaryContrast,
  "Tranquil Chroma": TranquilChroma,
  "Creative Flare": CreativeFlare,
  "Executive Professional": ExecutiveProfessional,
  "Minimal Modern": MinimalModern,
  "Classic Timeless": ClassicTimeless,
  "Tech Focused": TechFocused,
  "Corporate Elite": CorporateElite,
  "Modern Grid": ModernGrid,
  "Creative Edge": CreativeEdge,
  "Professional Clean": ProfessionalClean,
  "Industry Standard": IndustryStandard,
  "Modern Minimal": ModernMinimal,
  "Teal Professional": Design7Template,
  "Rose Circular": Design8Template,
  "Violet Geometric": Design9Template,
};

const educationLevels = [
  "Secondary School",
  "Vocational Certificate or Diploma",
  "Apprenticeship or Internship Training",
  "Associates",
  "Bachelors",
  "Masters",
  "Doctorate or Ph.D."
];

const indianDegrees = [
  "B.A. (Bachelor of Arts)",
  "B.Sc. (Bachelor of Science)",
  "B.Com. (Bachelor of Commerce)",
  "B.Tech. (Bachelor of Technology)",
  "B.E. (Bachelor of Engineering)",
  "BBA (Bachelor of Business Administration)",
  "BCA (Bachelor of Computer Applications)",
  "B.Ed. (Bachelor of Education)",
  "B.Pharm. (Bachelor of Pharmacy)",
  "MBBS (Bachelor of Medicine and Bachelor of Surgery)",
  "BDS (Bachelor of Dental Surgery)",
  "BAMS (Bachelor of Ayurvedic Medicine and Surgery)",
  "BHMS (Bachelor of Homoeopathic Medicine and Surgery)",
  "BUMS (Bachelor of Unani Medicine and Surgery)",
  "B.Arch. (Bachelor of Architecture)",
  "B.Des. (Bachelor of Design)",
  "B.F.A. (Bachelor of Fine Arts)",
  "B.P.A. (Bachelor of Performing Arts)",
  "B.J.M.C. (Bachelor of Journalism and Mass Communication)",
  "B.Lib. (Bachelor of Library Science)",
  "B.P.E. (Bachelor of Physical Education)",
  "B.S.W. (Bachelor of Social Work)",
  "LL.B. (Bachelor of Laws)",
  "B.H.M. (Bachelor of Hotel Management)",
  "B.F.T. (Bachelor of Fashion Technology)",
  "B.Voc. (Bachelor of Vocation)",
  "M.A. (Master of Arts)",
  "M.Sc. (Master of Science)",
  "M.Com. (Master of Commerce)",
  "M.Tech. (Master of Technology)",
  "M.E. (Master of Engineering)",
  "MBA (Master of Business Administration)",
  "MCA (Master of Computer Applications)",
  "M.Ed. (Master of Education)",
  "M.Pharm. (Master of Pharmacy)",
  "MD (Doctor of Medicine)",
  "MS (Master of Surgery)",
  "MDS (Master of Dental Surgery)",
  "M.Arch. (Master of Architecture)",
  "M.Des. (Master of Design)",
  "M.F.A. (Master of Fine Arts)",
  "M.P.A. (Master of Performing Arts)",
  "M.J.M.C. (Master of Journalism and Mass Communication)",
  "M.Lib. (Master of Library Science)",
  "M.P.E. (Master of Physical Education)",
  "M.S.W. (Master of Social Work)",
  "LL.M. (Master of Laws)",
  "M.H.M. (Master of Hotel Management)",
  "M.F.T. (Master of Fashion Technology)",
  "Ph.D. (Doctor of Philosophy)",
  "D.Sc. (Doctor of Science)",
  "D.Litt. (Doctor of Literature)",
  "D.M. (Doctorate of Medicine)",
  "M.Ch. (Master of Chirurgiae)",
  "D.N.B. (Diplomate of National Board)",
  "Diploma in Engineering",
  "Diploma in Computer Applications",
  "Diploma in Hotel Management",
  "Diploma in Fashion Design",
  "Diploma in Interior Design",
  "Diploma in Pharmacy",
  "Diploma in Nursing",
  "Diploma in Medical Laboratory Technology",
  "Diploma in Radiology",
  "Diploma in Physiotherapy",
  "Certificate in Computer Applications",
  "Certificate in Digital Marketing",
  "Certificate in Web Development",
  "Certificate in Data Science",
  "Certificate in Artificial Intelligence",
  "Certificate in Machine Learning",
  "Certificate in Cybersecurity",
  "Certificate in Cloud Computing",
  "Certificate in Mobile App Development",
  "Certificate in Graphic Design",
  "Certificate in Photography",
  "Certificate in Video Editing",
  "Certificate in Animation",
  "Certificate in Interior Design",
  "Certificate in Fashion Design",
  "Certificate in Culinary Arts",
  "Certificate in Hospitality Management",
  "Certificate in Event Management",
  "Certificate in Travel and Tourism",
  "Certificate in Banking and Finance",
  "Certificate in Insurance",
  "Certificate in Real Estate",
  "Certificate in Human Resources",
  "Certificate in Marketing",
  "Certificate in Sales",
  "Certificate in Customer Service",
  "Certificate in Project Management",
  "Certificate in Quality Management",
  "Certificate in Supply Chain Management",
  "Certificate in Logistics",
  "Certificate in Import Export",
  "Certificate in Foreign Trade",
  "Certificate in Taxation",
  "Certificate in Accounting",
  "Certificate in Auditing",
  "Certificate in Financial Planning",
  "Certificate in Investment Banking",
  "Certificate in Stock Market",
  "Certificate in Mutual Funds",
  "Certificate in Insurance",
  "Certificate in Risk Management",
  "Certificate in Compliance",
  "Certificate in Legal Studies",
  "Certificate in Paralegal Studies",
  "Certificate in Court Reporting",
  "Certificate in Mediation",
  "Certificate in Arbitration",
  "Certificate in Intellectual Property",
  "Certificate in Corporate Law",
  "Certificate in Criminal Law",
  "Certificate in Family Law",
  "Certificate in Environmental Law",
  "Certificate in Labour Law",
  "Certificate in Constitutional Law",
  "Certificate in International Law",
  "Certificate in Cyber Law",
  "Certificate in Medical Law",
  "Certificate in Banking Law",
  "Certificate in Insurance Law",
  "Certificate in Real Estate Law",
  "Certificate in Tax Law",
  "Certificate in Company Law",
  "Certificate in Contract Law",
  "Certificate in Tort Law",
  "Certificate in Property Law",
  "Certificate in Evidence Law",
  "Certificate in Procedure Law",
  "Certificate in Administrative Law",
  "Certificate in Human Rights Law",
  "Certificate in Women and Law",
  "Certificate in Child Rights",
  "Certificate in Elder Law",
  "Certificate in Disability Law",
  "Certificate in Mental Health Law",
  "Certificate in Health Law",
  "Certificate in Bioethics",
  "Certificate in Medical Ethics",
  "Certificate in Research Ethics",
  "Certificate in Business Ethics",
  "Certificate in Professional Ethics",
  "Certificate in Engineering Ethics",
  "Certificate in Legal Ethics",
  "Certificate in Journalism Ethics",
  "Certificate in Media Ethics",
  "Certificate in Advertising Ethics",
  "Certificate in Marketing Ethics",
  "Certificate in Sales Ethics",
  "Certificate in Customer Service Ethics",
  "Certificate in Human Resources Ethics",
  "Certificate in Finance Ethics",
  "Certificate in Banking Ethics",
  "Certificate in Insurance Ethics",
  "Certificate in Investment Ethics",
  "Certificate in Audit Ethics",
  "Certificate in Tax Ethics",
  "Certificate in Accounting Ethics",
  "Certificate in Management Ethics",
  "Certificate in Leadership Ethics",
  "Certificate in Corporate Governance",
  "Certificate in Risk Management Ethics",
  "Certificate in Compliance Ethics",
  "Certificate in Environmental Ethics",
  "Certificate in Social Responsibility",
  "Certificate in Sustainability",
  "Certificate in Green Technology",
  "Certificate in Renewable Energy",
  "Certificate in Environmental Management",
  "Certificate in Waste Management",
  "Certificate in Water Management",
  "Certificate in Air Quality Management",
  "Certificate in Climate Change",
  "Certificate in Carbon Management",
  "Certificate in Energy Management",
  "Certificate in Environmental Impact Assessment",
  "Certificate in Environmental Audit",
  "Certificate in Environmental Law",
  "Certificate in Environmental Policy",
  "Certificate in Environmental Economics",
  "Certificate in Environmental Science",
  "Certificate in Environmental Engineering",
  "Certificate in Environmental Health",
  "Certificate in Environmental Safety",
  "Certificate in Occupational Health and Safety",
  "Certificate in Industrial Safety",
  "Certificate in Fire Safety",
  "Certificate in Construction Safety",
  "Certificate in Electrical Safety",
  "Certificate in Chemical Safety",
  "Certificate in Food Safety",
  "Certificate in Laboratory Safety",
  "Certificate in Radiation Safety",
  "Certificate in Nuclear Safety",
  "Certificate in Transportation Safety",
  "Certificate in Aviation Safety",
  "Certificate in Marine Safety",
  "Certificate in Road Safety",
  "Certificate in Railway Safety",
  "Certificate in Mining Safety",
  "Certificate in Oil and Gas Safety",
  "Certificate in Petrochemical Safety",
  "Certificate in Pharmaceutical Safety",
  "Certificate in Biotechnology Safety",
  "Certificate in Information Security",
  "Certificate in Network Security",
  "Certificate in Web Security",
  "Certificate in Mobile Security",
  "Certificate in Cloud Security",
  "Certificate in Database Security",
  "Certificate in Application Security",
  "Certificate in System Security",
  "Certificate in Endpoint Security",
  "Certificate in Email Security",
  "Certificate in Wireless Security",
  "Certificate in IoT Security",
  "Certificate in Blockchain Security",
  "Certificate in AI Security",
  "Certificate in Machine Learning Security",
  "Certificate in Data Privacy",
  "Certificate in Digital Forensics",
  "Certificate in Incident Response",
  "Certificate in Vulnerability Assessment",
  "Certificate in Penetration Testing",
  "Certificate in Security Audit",
  "Certificate in Security Compliance",
  "Certificate in Security Governance",
  "Certificate in Security Risk Management",
  "Certificate in Security Awareness",
  "Certificate in Security Training",
  "Certificate in Security Consulting",
  "Certificate in Security Management",
  "Certificate in Security Operations",
  "Certificate in Security Architecture",
  "Certificate in Security Engineering",
  "Certificate in Security Analysis",
  "Certificate in Security Research",
  "Certificate in Security Policy",
  "Certificate in Security Standards",
  "Certificate in Security Certification",
  "Certificate in Security Documentation"
].sort();

const expertRecommendedSkills = [
  "Communication", "Customer Service", "Leadership", "Project Management", "Management",
  "Analytics", "Teamwork", "Sales", "Problem-Solving", "Research", "Adaptability",
  "Cloud Computing", "Artificial Intelligence", "Blockchain Development", "Cybersecurity",
  "Full-Stack Development", "Strategic Planning", "Financial Modeling", "Business Intelligence",
  "Change Management", "UX/UI Design", "Video Production and Editing", "3D Modeling and Animation",
  "Brand Strategy", "Virtual Reality Design", "Data Science", "Big Data Analytics",
  "Predictive Modeling", "Data Visualization", "Statistical Analysis", "Public Speaking",
  "Negotiation", "Cross-Cultural Communication", "Emotional Intelligence", "Quantum Computing",
  "5G Network Architecture", "Edge Computing", "Algorithmic Trading", "Risk Management",
  "Cryptocurrency Analysis", "Bioinformatics", "Medical AI Development", "Telemedicine Systems Design",
  "Growth Hacking", "Neuromarketing", "AI-Powered Sales Analytics", "Robotics Engineering",
  "Additive Manufacturing (3D Printing)", "Industrial IoT Implementation", "Natural Language Processing (NLP)",
  "Reinforcement Learning", "Explainable AI (XAI)", "Decentralized Finance (DeFi) Development",
  "Non-Fungible Token (NFT) Creation", "Blockchain Security", "Renewable Energy Systems Design",
  "Carbon Footprint Analysis", "Circular Economy Implementation", "AR/VR Content Creation",
  "Spatial Computing", "VR/AR Hardware Development", "Cloud Security", "IoT Security", "Privacy Engineering",
  "Python", "Java", "JavaScript", "C++", "DevOps", "API Development", "Agile Methodologies",
  "SQL", "R", "Deep Learning", "Investment Analysis", "Excel", "Business Intelligence Tools",
  "Financial Reporting", "Forecasting", "Mergers and Acquisitions Analysis", "SEO/SEM",
  "Social Media Marketing", "Content Marketing", "Email Marketing", "Marketing Automation",
  "PPC Advertising", "CRM Systems", "A/B Testing", "Conversion Rate Optimization", "Scrum Methodologies",
  "Budgeting", "Stakeholder Management", "Team Leadership", "Critical Thinking", "Time Management",
  "Contract Negotiation", "Process Optimization", "Innovative Thinking", "Solution-Based Selling",
  "Customer Engagement & Support", "Go-to-Market (GTM) Strategy", "Regulatory Compliance",
  "Growth Strategy", "Risk Assessment", "AI Literacy", "Conflict Mitigation", "Payroll",
  "Retail Sales", "PET", "Food Handling", "Sales Floor", "Store Operations", "Store Associates",
  "POS", "Store Management", "Retail Store", "Product Knowledge", "Loss Prevention",
  "Inventory Control", "Customer Complaints", "Product Selection", "Sales Associates",
  "Store Sales", "Purchase Orders", "Groceries", "Store Appearance", "Bank Deposits",
  "Inventory Management", "Customer Inquiries", "Computer System", "Stock Shelves",
  "Store Products", "Customer Assistance", "Sales Reports", "Store Maintenance",
  "Customer Orders", "Cash Drawers", "Credit Card Transactions", "Stock Room",
  "Store Policies", "PowerPoint", "HR", "Customer Relations", "Store Locations",
  "Store Displays", "Store Merchandise", "Store Opening", "Merchandise Displays",
  "Store Inventory", "Stock Merchandise", "Window Displays", "Clean Store", "Friendly, positive attitude",
  "Resolving Conflict", "Phone Operations", "Office Applications", "Conflict resolution",
  "Persuasive Speaking", "Cash Register", "Office Equipment", "Helpfulness", "Training & Development",
  "Market Knowledge", "Quick Learning Ability", "Customer Care", "Upselling", "Employee Scheduling", "Stress Management",
  "Active Listening", "Decision Making", "Interpersonal Skills", "Analytical Skills", "Organization",
  "Writing", "Technical Skills", "Creative Thinking", "Critical Thinking", "Detail-Oriented",
  "Collaboration", "Conceptual Skills", "Presentation Skills", "Administrative Skills",
  "Marketing Skills", "Computer Skills", "IT Skills", "Multitasking", "MS Office",
  "Data Entry", "Team Management"
];


const BuilderPage = () => {
  const { sessionId } = useParams();
  const [activeIndex, setActiveIndex] = useState(0); // Start at Heading
  
  // Debug logging
  console.log('BuilderPage rendered, sessionId:', sessionId);
  console.log('activeIndex:', activeIndex);
  const [showWorkRec, setShowWorkRec] = useState(false);
  const [showSummaryRec, setShowSummaryRec] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("Clean Chromatic");
  const [resumeCompleteness, setResumeCompleteness] = useState(0);
  const [educationStep, setEducationStep] = useState(1); // 1 for level selection, 2 for details
  const [searchQuery, setSearchQuery] = useState("");
  const [degreeSearchQuery, setDegreeSearchQuery] = useState("");
  const [showDegreeDropdown, setShowDegreeDropdown] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showColorEditor, setShowColorEditor] = useState(false);
  const [templateColors, setTemplateColors] = useState({
    primary: '#3B82F6', // Default blue
    secondary: '#6B7280', // Default gray
    accent: '#10B981', // Default green
    background: '#FFFFFF', // Default white
    text: '#1F2937' // Default dark gray
  });

  // Close degree dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDegreeDropdown && !event.target.closest('.degree-dropdown-container')) {
        setShowDegreeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDegreeDropdown]);

  // Get selected template from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const templateParam = urlParams.get('template');
    if (templateParam) {
      const decodedTemplate = decodeURIComponent(templateParam);
      if (templates[decodedTemplate]) {
        setActiveTemplate(decodedTemplate);
      }
    }
  }, []);

  // Contact form state
  const [contact, setContact] = useState({
    firstName: "",
    lastName: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: ""
  });
  // Work history form state - now supports multiple experiences
  const [workExperiences, setWorkExperiences] = useState([{
    id: 1,
    jobTitle: "",
    employer: "",
    location: "",
    remote: false,
    startDate: null,
    endDate: null,
    current: false,
    accomplishments: "",
  }]);

  const [currentWorkIndex, setCurrentWorkIndex] = useState(0);

  // Experience step state
  const [experienceStep, setExperienceStep] = useState(1); // 1 for basic info, 2 for job description
  // Education form state
  const [education, setEducation] = useState({
    school: "",
    location: "",
    degree: "",
    field: "",
    gradYear: "",
    gradMonth: ""
  });
  // Skills state
  const [skills, setSkills] = useState([]);
  // Summary state
  const [summary, setSummary] = useState("");
  // Additional sections state
  const [additionalSections, setAdditionalSections] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [volunteerExperiences, setVolunteerExperiences] = useState([]);
  const [publications, setPublications] = useState([]);
  const [awards, setAwards] = useState([]);
  const [references, setReferences] = useState([]);
  const [activeSections, setActiveSections] = useState({
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
  });
  const [scale, setScale] = useState(1);
  const previewContainerRef = useRef(null);
  const previewContentRef = useRef(null);

  useEffect(() => {
    // Calculate resume completeness based on filled fields
    let completed = 0;
    if (contact.firstName && contact.lastName) completed++;
    if (workExperiences.length > 0 && workExperiences[0].jobTitle && workExperiences[0].employer) completed++;
    if (education.school && education.degree) completed++;
    if (skills.length > 0) completed++;
    if (summary) completed++;
    setResumeCompleteness(Math.round((completed / 5) * 100));
  }, [contact, workExperiences, education, skills, summary]);

  useEffect(() => {
    const calculateScale = () => {
      if (previewContainerRef.current && previewContentRef.current) {
        const container = previewContainerRef.current;
        const content = previewContentRef.current;

        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        const contentWidth = content.scrollWidth;
        const contentHeight = content.scrollHeight;

        if (contentHeight === 0 || contentWidth === 0) return;

        const scaleX = (containerWidth - 32) / contentWidth;
        const scaleY = (containerHeight - 32) / contentHeight;

        const newScale = Math.min(scaleX, scaleY);
        setScale(newScale);
      }
    };

    const timer = setTimeout(calculateScale, 100);
    window.addEventListener("resize", calculateScale);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateScale);
    };
  }, [contact, workExperiences, education, skills, summary, activeTemplate]);

  const handleDownloadPDF = () => {
    const element = document.getElementById('pdf-generator-content');

    // Calculate the actual height of the content
    const contentHeight = element.scrollHeight;
    const contentWidth = element.scrollWidth;

    // Convert pixels to inches (assuming 96 DPI)
    const heightInInches = contentHeight / 96;
    const widthInInches = contentWidth / 96;

    const opt = {
      margin: 0,
      filename: 'resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        height: contentHeight,
        width: contentWidth
      },
      jsPDF: {
        unit: 'in',
        format: [widthInInches, heightInInches], // Dynamic size based on content
        orientation: 'portrait',
        compress: true
      }
    };

    html2pdf().from(element).set(opt).save();
  };

  const goToSection = useCallback((idx) => {
    setActiveIndex(idx);
    // Reset experience step when navigating away from Experience section
    if (sections[idx] !== "Experience") {
      setExperienceStep(1);
    }
  }, []);

  const handleContinue = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % sections.length);
  }, []);

  const handleBack = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + sections.length) % sections.length);
  }, []);

  const handleAddSkill = (skillToAdd: string) => {
    if (!skills.includes(skillToAdd)) {
      const newSkills = [...skills, skillToAdd];
      setSkills(newSkills);

      // Auto-append to text editor
      const textArea = document.querySelector('.skills-textarea') ||
        document.querySelector('textarea[placeholder*="skill"]');
      if (textArea && textArea instanceof HTMLTextAreaElement) {
        const currentValue = textArea.value;
        const newValue = currentValue ? currentValue + '\n' + skillToAdd : skillToAdd;
        textArea.value = newValue;
        // Trigger change event to update state
        const event = new Event('input', { bubbles: true });
        textArea.dispatchEvent(event);
      }
    }
  };

  // Helper functions for work experiences
  const addNewWorkExperience = () => {
    const newId = Math.max(...workExperiences.map(exp => exp.id)) + 1;
    const newExperience = {
      id: newId,
      jobTitle: "",
      employer: "",
      location: "",
      remote: false,
      startDate: null,
      endDate: null,
      current: false,
      accomplishments: "",
    };
    setWorkExperiences([...workExperiences, newExperience]);
    setCurrentWorkIndex(workExperiences.length);
  };

  const removeWorkExperience = (id) => {
    if (workExperiences.length > 1) {
      const updatedExperiences = workExperiences.filter(exp => exp.id !== id);
      setWorkExperiences(updatedExperiences);
      if (currentWorkIndex >= updatedExperiences.length) {
        setCurrentWorkIndex(updatedExperiences.length - 1);
      }
    }
  };

  const updateCurrentWorkExperience = (updates) => {
    const updatedExperiences = workExperiences.map((exp, index) =>
      index === currentWorkIndex ? { ...exp, ...updates } : exp
    );
    setWorkExperiences(updatedExperiences);
  };

  const getCurrentWorkExperience = () => {
    return workExperiences[currentWorkIndex] || workExperiences[0];
  };

  // Calculate years of experience for current work
  const calculateExperienceYears = () => {
    const currentWork = getCurrentWorkExperience();
    if (!currentWork.startDate) return 0;
    const endDate = currentWork.current ? new Date() : (currentWork.endDate || new Date());
    const startDate = new Date(currentWork.startDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25)); // Use 365.25 to account for leap years
    return diffYears;
  };

  // Generate automatic summary based on experience
  const generateAutoSummary = () => {
    const experienceYears = calculateExperienceYears();
    const currentWork = getCurrentWorkExperience();
    const jobTitle = currentWork.jobTitle || "Professional";
    const degree = education.degree || "graduate";
    const topSkills = skills.slice(0, 3).join(", ");

    let summaryText = "";

    if (experienceYears > 0) {
      summaryText = `${experienceYears}+ years experienced ${jobTitle.toLowerCase()} with expertise in ${topSkills || "various technologies"}. `;
    } else {
      summaryText = `Recent ${degree.toLowerCase()} seeking opportunities as ${jobTitle.toLowerCase()}. `;
    }

    if (topSkills) {
      summaryText += `Skilled in ${topSkills} with a proven track record of delivering high-quality results. `;
    }

    summaryText += `Strong problem-solving abilities and excellent communication skills. Passionate about continuous learning and professional growth.`;

    return summaryText;
  };

  // Auto-generate summary when experience or education changes
  useEffect(() => {
    const currentWork = getCurrentWorkExperience();
    if (currentWork.jobTitle && (currentWork.startDate || education.degree) && !summary) {
      const autoSummary = generateAutoSummary();
      setSummary(autoSummary);
    }
  }, [workExperiences, currentWorkIndex, education.degree, skills]);

  const handleSkillsChange = (event) => {
    const newSkills = event.target.value.split('\n').filter(skill => skill.trim() !== '');
    const uniqueSkills = [...new Set(newSkills)];
    setSkills(uniqueSkills);
  };

  const filteredSkills = expertRecommendedSkills.filter(skill =>
    skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render the currently active template
  const ResumePreview = () => {
    try {
      const TemplateComponent = templates[activeTemplate];
      if (!TemplateComponent) {
        return <div className="p-4 text-center text-gray-500">Template not found</div>;
      }
      return <TemplateComponent
        contact={contact}
        summary={summary}
        skills={skills}
        experience={workExperiences}
        education={education}
        colors={templateColors}
        primaryColor={templateColors.primary}
        projects={projects}
        certifications={certifications}
        languages={languages}
        volunteerExperience={volunteerExperiences}
        publications={publications}
        awards={awards}
        references={references}
        activeSections={activeSections}
      />;
    } catch (error) {
      console.error('Error rendering template:', error);
      return <div className="p-4 text-center text-red-500">Error loading template</div>;
    }
  };

  // Section renderers
  const renderSection = () => {
    switch (sections[activeIndex]) {
      case "Heading":
        return (
          <div className="max-w-2xl w-full flex flex-col items-center justify-center h-[80vh]">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">Let's create a header for your resume</h1>
            <p className="text-xl text-gray-500 mb-8">Use a professional email and a phone for employers to reach you</p>
            <form className="grid grid-cols-2 gap-4 mb-8" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="block text-gray-700 mb-1">First Name</label>
                <input className="w-full border rounded px-3 py-2" placeholder="Jane" value={contact.firstName} onChange={e => setContact({ ...contact, firstName: e.target.value })} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Last Name</label>
                <input className="w-full border rounded px-3 py-2" placeholder="Doe" value={contact.lastName} onChange={e => setContact({ ...contact, lastName: e.target.value })} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">City</label>
                <input className="w-full border rounded px-3 py-2" placeholder="Bengaluru" value={contact.city} onChange={e => setContact({ ...contact, city: e.target.value })} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">State</label>
                <input className="w-full border rounded px-3 py-2" placeholder="KA" value={contact.state} onChange={e => setContact({ ...contact, state: e.target.value })} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Zip</label>
                <input className="w-full border rounded px-3 py-2" placeholder="560056" value={contact.zip} onChange={e => setContact({ ...contact, zip: e.target.value })} />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Phone</label>
                <input className="w-full border rounded px-3 py-2" placeholder="(123) 456-7890" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 mb-1">Email</label>
                <input className="w-full border rounded px-3 py-2" placeholder="jane.doe@email.com" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} />
              </div>
            </form>
            <div className="flex gap-4 mt-8 w-full justify-between">
              <button className="px-6 py-2 rounded bg-gray-200 text-gray-700" onClick={handleBack}>Back</button>
              <button className="px-6 py-2 rounded bg-blue-600 text-white" onClick={handleContinue}>Continue</button>
            </div>
          </div>
        );
      case "Experience":
        if (experienceStep === 1) {
          const currentWork = getCurrentWorkExperience();
          return (
            <div className="max-w-4xl w-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Tell us about your work experience</h1>
                  <p className="text-lg text-gray-600">Add your work experiences, starting with the most recent. You can add multiple positions.</p>
                </div>
                <div className="text-sm text-gray-500">
                  Experience {currentWorkIndex + 1} of {workExperiences.length}
                </div>
              </div>

              {/* Work Experience Tabs */}
              <div className="flex items-center gap-2 mb-6 border-b">
                {workExperiences.map((exp, index) => (
                  <button
                    key={exp.id}
                    className={`px-4 py-2 border-b-2 font-medium ${index === currentWorkIndex
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    onClick={() => setCurrentWorkIndex(index)}
                  >
                    {exp.jobTitle || `Experience ${index + 1}`}
                    {workExperiences.length > 1 && (
                      <button
                        className="ml-2 text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeWorkExperience(exp.id);
                        }}
                      >
                        ×
                      </button>
                    )}
                  </button>
                ))}
                <button
                  className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                  onClick={addNewWorkExperience}
                >
                  + Add Experience
                </button>
              </div>

              <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-1">Job Title *</label>
                    <input
                      className="w-full border rounded-lg px-4 py-2"
                      placeholder="Developer"
                      value={currentWork.jobTitle}
                      onChange={e => updateCurrentWorkExperience({ jobTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Employer</label>
                    <input
                      className="w-full border rounded-lg px-4 py-2"
                      placeholder="Company Name"
                      value={currentWork.employer}
                      onChange={e => updateCurrentWorkExperience({ employer: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Location</label>
                  <input
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="Hyderabad, India"
                    value={currentWork.location}
                    onChange={e => updateCurrentWorkExperience({ location: e.target.value })}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={currentWork.remote}
                    onChange={e => updateCurrentWorkExperience({ remote: e.target.checked })}
                  />
                  <span>Remote</span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-1">Start Date</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="w-full border rounded-lg px-4 py-2"
                        value={currentWork.startDate ? currentWork.startDate.getMonth() : ''}
                        onChange={(e) => {
                          const month = parseInt(e.target.value);
                          const year = currentWork.startDate ? currentWork.startDate.getFullYear() : new Date().getFullYear();
                          updateCurrentWorkExperience({ startDate: new Date(year, month, 1) });
                        }}
                      >
                        <option value="">Month</option>
                        {['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                          ))}
                      </select>
                      <select
                        className="w-full border rounded-lg px-4 py-2"
                        value={currentWork.startDate ? currentWork.startDate.getFullYear() : ''}
                        onChange={(e) => {
                          const year = parseInt(e.target.value);
                          const month = currentWork.startDate ? currentWork.startDate.getMonth() : 0;
                          updateCurrentWorkExperience({ startDate: new Date(year, month, 1) });
                        }}
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">End Date</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="w-full border rounded-lg px-4 py-2"
                        value={currentWork.endDate ? currentWork.endDate.getMonth() : ''}
                        onChange={(e) => {
                          const month = parseInt(e.target.value);
                          const year = currentWork.endDate ? currentWork.endDate.getFullYear() : new Date().getFullYear();
                          updateCurrentWorkExperience({ endDate: new Date(year, month, 1) });
                        }}
                        disabled={currentWork.current}
                      >
                        <option value="">Month</option>
                        {['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                          ))}
                      </select>
                      <select
                        className="w-full border rounded-lg px-4 py-2"
                        value={currentWork.endDate ? currentWork.endDate.getFullYear() : ''}
                        onChange={(e) => {
                          const year = parseInt(e.target.value);
                          const month = currentWork.endDate ? currentWork.endDate.getMonth() : 0;
                          updateCurrentWorkExperience({ endDate: new Date(year, month, 1) });
                        }}
                        disabled={currentWork.current}
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={currentWork.current}
                    onChange={e => updateCurrentWorkExperience({ current: e.target.checked })}
                  />
                  <span>I currently work here</span>
                </div>
              </form>
              <div className="flex gap-4 mt-8 w-full justify-between">
                <button className="px-6 py-2 rounded-lg border border-gray-300" onClick={handleBack}>Back</button>
                <button
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white"
                  onClick={() => setExperienceStep(2)}
                  disabled={!currentWork.jobTitle}
                >
                  Next: Add Job Description
                </button>
              </div>
            </div>
          );
        } else {
          const currentWork = getCurrentWorkExperience();
          const currentJobRecommendations = workRecommendations[currentWork.jobTitle] || workRecommendations["Developer"];
          const currentRelatedTitles = relatedJobTitles[currentWork.jobTitle] || relatedJobTitles["Developer"];

          return (
            <div className="max-w-6xl w-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <button
                    className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
                    onClick={() => setExperienceStep(1)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Go Back
                  </button>
                  <div className="flex items-center text-blue-600 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tips
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Experience {currentWorkIndex + 1} of {workExperiences.length}
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-2">What did you do as a {currentWork.jobTitle}?</h1>
              <p className="text-lg text-gray-600 mb-8">Add your job responsibilities and achievements for this position.</p>

              <div className="grid grid-cols-2 gap-8">
                {/* Left Column - Recommendations */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">SEARCH BY JOB TITLE FOR PRE-WRITTEN EXAMPLES</label>
                    <div className="relative">
                      <input
                        className="w-full border rounded-lg px-4 py-2 pr-12"
                        placeholder={currentWork.jobTitle}
                        value={currentWork.jobTitle}
                        onChange={e => updateCurrentWorkExperience({ jobTitle: e.target.value })}
                      />
                      <button className="absolute right-2 top-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Related Job Titles</span>
                      <button className="text-blue-600 text-sm">More</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentRelatedTitles.map(title => (
                        <button
                          key={title}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200"
                          onClick={() => updateCurrentWorkExperience({ jobTitle: title })}
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">Showing examples for</span>
                      <button className="text-blue-600 text-sm flex items-center">
                        Filter by Keyword
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                      </button>
                    </div>
                    <div className="font-semibold text-gray-800 mb-4">{currentWork.jobTitle}</div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {currentJobRecommendations.map((recommendation, index) => (
                        <div
                          key={index}
                          className="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            const currentAccomplishments = currentWork.accomplishments ? currentWork.accomplishments.split('\n') : [];
                            if (!currentAccomplishments.includes(recommendation)) {
                              updateCurrentWorkExperience({
                                accomplishments: [...currentAccomplishments, recommendation].join('\n')
                              });
                            }
                          }}
                        >
                          <button className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                            +
                          </button>
                          <span className="text-sm text-gray-700">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Job Description Editor */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-semibold text-lg">{currentWork.jobTitle} | {currentWork.employer}</div>
                    <div className="text-gray-600">
                      {currentWork.location} - {currentWork.startDate ? format(currentWork.startDate, 'MMMM yyyy') : 'Start Date'} - {currentWork.current ? 'Current' : (currentWork.endDate ? format(currentWork.endDate, 'MMMM yyyy') : 'End Date')}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Job description:</label>
                    <div className="border rounded-lg">
                      {/* Rich Text Editor Toolbar */}
                      <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
                        <button className="p-1 hover:bg-gray-200 rounded" title="Bold">
                          <strong>B</strong>
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded" title="Italic">
                          <em>I</em>
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded" title="Underline">
                          <u>U</u>
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded" title="Bullet List">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded" title="Numbered List">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded" title="Clear Formatting">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div className="ml-auto flex gap-2">
                          <button className="p-1 hover:bg-gray-200 rounded" title="Undo">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                          </button>
                          <button className="p-1 hover:bg-gray-200 rounded" title="Redo">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Text Area */}
                      <textarea
                        className="w-full p-4 min-h-[300px] border-none focus:ring-0 resize-none"
                        placeholder="• Add your job responsibilities and achievements here..."
                        value={currentWork.accomplishments}
                        onChange={e => updateCurrentWorkExperience({ accomplishments: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 justify-between">
                    <div className="flex gap-2">
                      {workExperiences.length > 1 && currentWorkIndex > 0 && (
                        <button
                          className="px-4 py-2 rounded-lg border border-gray-300"
                          onClick={() => setCurrentWorkIndex(currentWorkIndex - 1)}
                        >
                          Previous Experience
                        </button>
                      )}
                      {currentWorkIndex < workExperiences.length - 1 && (
                        <button
                          className="px-4 py-2 rounded-lg border border-gray-300"
                          onClick={() => setCurrentWorkIndex(currentWorkIndex + 1)}
                        >
                          Next Experience
                        </button>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <button
                        className="px-6 py-2 rounded-lg border border-blue-600 text-blue-600"
                        onClick={addNewWorkExperience}
                      >
                        + Add Another Experience
                      </button>
                      <button
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white"
                        onClick={handleContinue}
                      >
                        Continue to Education
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      case "Education":
        return (
          <div className="max-w-3xl w-full">
            {educationStep === 1 ? (
              <div>
                <h1 className="text-4xl font-bold mb-2">What best describes your level of education?</h1>
                <p className="text-lg text-gray-600 mb-8">Select the best option and we'll help you structure your education section.</p>
                <div className="grid grid-cols-3 gap-4">
                  {educationLevels.map(level => (
                    <button key={level} className="p-4 border rounded-lg text-center" onClick={() => setEducationStep(2)}>{level}</button>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <button className="text-blue-500 underline" onClick={() => setEducationStep(2)}>Prefer not to answer</button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-4xl font-bold mb-2">Tell us about your education</h1>
                <p className="text-lg text-gray-600 mb-8">Enter your education experience so far, even if you are a current student or did not graduate.</p>
                <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-1">School Name *</label>
                      <input className="w-full border rounded-lg px-4 py-2" placeholder="School Name" value={education.school} onChange={e => setEducation({ ...education, school: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">School Location</label>
                      <input className="w-full border rounded-lg px-4 py-2" placeholder="Delhi, India" value={education.location} onChange={e => setEducation({ ...education, location: e.target.value })} />
                    </div>
                  </div>
                  <div className="relative degree-dropdown-container">
                    <label className="block text-gray-700 mb-1">Degree</label>
                    <input
                      className="w-full border rounded-lg px-4 py-2"
                      placeholder="Search and select degree..."
                      value={degreeSearchQuery || education.degree}
                      onChange={(e) => {
                        setDegreeSearchQuery(e.target.value);
                        setShowDegreeDropdown(true);
                      }}
                      onFocus={() => setShowDegreeDropdown(true)}
                    />
                    {showDegreeDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {indianDegrees
                          .filter(degree =>
                            degree.toLowerCase().includes((degreeSearchQuery || '').toLowerCase())
                          )
                          .slice(0, 10)
                          .map((degree, index) => (
                            <div
                              key={index}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => {
                                setEducation({ ...education, degree });
                                setDegreeSearchQuery('');
                                setShowDegreeDropdown(false);
                              }}
                            >
                              {degree}
                            </div>
                          ))
                        }
                        {indianDegrees.filter(degree =>
                          degree.toLowerCase().includes((degreeSearchQuery || '').toLowerCase())
                        ).length === 0 && (
                            <div className="px-4 py-2 text-gray-500 text-sm">No degrees found</div>
                          )}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-1">Field of Study</label>
                      <input className="w-full border rounded-lg px-4 py-2" placeholder="Financial Accounting" value={education.field} onChange={e => setEducation({ ...education, field: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Graduation Date (or expected Graduation Date)</label>
                      <div className="flex gap-2">
                        <select
                          className="w-full border rounded-lg px-4 py-2"
                          value={education.gradMonth}
                          onChange={(e) => setEducation({ ...education, gradMonth: e.target.value })}
                        >
                          <option value="">Month</option>
                          {['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                              <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                        <select
                          className="w-full border rounded-lg px-4 py-2"
                          value={education.gradYear}
                          onChange={(e) => setEducation({ ...education, gradYear: e.target.value })}
                        >
                          <option value="">Year</option>
                          {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() + 5 - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </form>
                <div className="flex gap-4 mt-8 w-full justify-end">
                  <button className="px-6 py-2 rounded-lg border border-gray-300">Preview</button>
                  <button className="px-6 py-2 rounded-lg bg-yellow-500 text-white" onClick={handleContinue}>Next: Skills</button>
                </div>
              </div>
            )}
          </div>
        );
      case "Skills":
        return (
          <div className="max-w-4xl w-full">
            <h1 className="text-4xl font-bold mb-2">What skills would you like to highlight?</h1>
            <p className="text-lg text-gray-600 mb-8">Choose from our pre-written examples below or write your own.</p>
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column: Skill Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Search by job title for pre-written examples</label>
                  <div className="relative">
                    <input
                      className="w-full border rounded-lg px-4 py-2 pr-10"
                      placeholder="Search by job title"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button className="absolute right-2 top-2 text-white bg-blue-600 rounded-full w-7 h-7 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                    </button>
                  </div>
                </div>
                <div className="text-sm">
                  Popular Job Titles: <a href="#" className="text-blue-500">Cashier</a>, <a href="#" className="text-blue-500">Customer Service Representative</a>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Ready-to-use-examples</h3>
                  <div className="space-y-2">
                    {filteredSkills.map(skill => (
                      <div key={skill} className="flex items-center p-2 border rounded-lg">
                        <button onClick={() => handleAddSkill(skill)} className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">+</button>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Right Column: Text Editor */}
              <div className="relative">
                <div className="border rounded-lg p-4 min-h-[300px]">
                  <div className="flex border-b mb-2">
                    <button className="px-4 py-2 border-b-2 border-blue-600 font-semibold">Text Editor</button>
                    <button className="px-4 py-2 text-gray-500">Skills Rating</button>
                  </div>
                  <textarea
                    className="w-full h-full border-none focus:ring-0 skills-textarea"
                    placeholder="Add your skills here..."
                    value={skills.join('\n')}
                    onChange={handleSkillsChange}
                  />
                </div>
                <div className="absolute bottom-10 right-10 bg-white p-4 rounded-lg shadow-lg">
                  <p className="font-semibold mb-2">Highlight a bullet point and enhance with AI.</p>
                  <div className="text-gray-500 mb-4">~~~~~~~~~~~~ ~~~~ ~~~~~~~.</div>
                  <div className="flex justify-end items-center">
                    <button className="text-sm text-gray-500 mr-4">Got It</button>
                    <button className="px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm">+ Enhance with AI</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8 w-full justify-end">
              <button className="px-6 py-2 rounded-lg border border-gray-300">Preview</button>
              <button className="px-6 py-2 rounded-lg bg-yellow-500 text-white" onClick={handleContinue}>Next: Summary</button>
            </div>
          </div>
        );
      case "Summary":
        return (
          <div className="max-w-2xl w-full flex flex-col items-center justify-center h-[80vh]">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">Let's showcase your expertise with a summary</h1>
            <p className="text-xl text-gray-500 mb-8">A summary is your pitch to impress the employer</p>

            {/* Auto-generated summary info */}
            {getCurrentWorkExperience().jobTitle && (
              <div className="w-full mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-800">Auto-Generated Summary</h3>
                  <span className="text-sm text-blue-600">
                    {calculateExperienceYears() > 0 ? `${calculateExperienceYears()}+ years experience` : 'Entry Level'}
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  Based on your {getCurrentWorkExperience().jobTitle} role{calculateExperienceYears() > 0 ? ` with ${calculateExperienceYears()}+ years of experience` : ''}
                  {skills.length > 0 ? ` and skills in ${skills.slice(0, 3).join(', ')}` : ''}
                </p>
                <button
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  onClick={() => setSummary(generateAutoSummary())}
                >
                  Use Auto-Generated Summary
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8 w-full">
              <div>
                <label className="block text-gray-700 mb-1">Search By Job Title</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  placeholder={getCurrentWorkExperience().jobTitle || "Customer Service Representative"}
                  value={getCurrentWorkExperience().jobTitle || ""}
                  readOnly
                />
              </div>
              <div className="flex items-end">
                <button className="ml-2 px-4 py-2 rounded bg-teal-500 text-white">Search</button>
              </div>
            </div>
            <div className="flex gap-8 w-full">
              <div className="flex-1">
                <div className="mb-2 text-gray-700 font-semibold">
                  Showing Results for {getCurrentWorkExperience().jobTitle || "Customer Service Representative"}
                </div>
                <div className="flex flex-col gap-2">
                  {summaryRecommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 bg-gray-100 rounded border text-gray-700 text-sm cursor-pointer hover:bg-gray-200"
                      onClick={() => setSummary(rec.replace('[number]', calculateExperienceYears() > 0 ? calculateExperienceYears().toString() : '2'))}
                    >
                      {rec.replace('[number]', calculateExperienceYears() > 0 ? calculateExperienceYears().toString() : '2')}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-2 text-gray-700 font-semibold">Summary</div>
                <textarea
                  className="w-full border rounded px-3 py-2 min-h-[120px]"
                  placeholder="Write your summary here..."
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {summary.length}/500 characters
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8 w-full justify-between">
              <button className="px-6 py-2 rounded bg-gray-200 text-gray-700" onClick={handleBack}>Back</button>
              <button className="px-6 py-2 rounded bg-blue-600 text-white" onClick={handleContinue}>Continue</button>
            </div>
          </div>
        );
      case "Finalize":
        return (
          <div className="max-w-2xl w-full flex flex-col items-center justify-center h-[80vh]">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">Finalize</h1>
            <p className="text-xl text-gray-500 mb-8">Review and finish your resume</p>
            <div className="flex gap-4 mt-8 w-full justify-end">
              <button className="px-6 py-2 rounded bg-blue-600 text-white" onClick={handleDownloadPDF}>Finish & Download PDF</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };



  return (
    <div className="flex min-h-screen bg-[#F4F7F9]">
      {/* Sidebar */}
      <aside className="w-1/4 bg-[#0F172A] text-white flex flex-col p-8">
        <div className="flex items-center text-2xl font-bold mb-12">
          <FaPiedPiper className="mr-2" />
          <span>Pied Piper</span>
        </div>
        <nav className="flex-1">
          {sections.map((section, idx) => (
            <div key={section} className="flex items-center mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${activeIndex === idx ? 'bg-blue-500' : 'bg-gray-600'}`}>
                {idx + 1}
              </div>
              <button
                className={`text-lg ${activeIndex === idx ? 'font-bold' : ''}`}
                onClick={() => goToSection(idx)}
              >
                {section}
              </button>
            </div>
          ))}
        </nav>

        {/* Template Selector */}
        <div className="mb-8">
          <div className="text-sm mb-4">TEMPLATE</div>
          <div className="relative">
            <select
              value={activeTemplate}
              onChange={(e) => setActiveTemplate(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 text-sm"
            >
              {Object.keys(templates).map((templateName) => (
                <option key={templateName} value={templateName}>
                  {templateName}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Change template anytime
          </div>
        </div>

        <div>
          <div className="text-sm mb-2">RESUME COMPLETENESS</div>
          <div className="w-full bg-gray-600 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${resumeCompleteness}%` }}></div>
          </div>
          <div className="text-right text-sm mt-1">{resumeCompleteness}%</div>
        </div>
        <div className="text-xs text-gray-400 mt-8">
          <p>Terms And Conditions</p>
          <p>Privacy Policy</p>
          <p>Accessibility</p>
          <p>Contact Us</p>
          <p className="mt-4">© 2025, Works Limited. All rights reserved.</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 flex">
        <div className="w-2/3 pr-8">
          <div className="mb-8">
            <button onClick={handleBack} className="text-blue-500">&larr; Go Back</button>
          </div>
          {renderSection()}
        </div>
        {/* Live Preview */}
        <div className="w-1/3">
          <div className="sticky top-12">
            <div className="bg-white p-4 rounded-lg shadow-md mb-4 text-center">
              <p className="text-sm">Our Resume Builder delivers results.<sup>1</sup></p>
              <p className="text-green-500 font-bold">&uarr; 42% Higher response rate from recruiters</p>
            </div>
            <div
              ref={previewContainerRef}
              className="bg-gray-200 p-4 rounded-lg shadow-inner flex justify-center items-center overflow-hidden"
              style={{ height: '550px' }}
            >
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'center center',
                }}
              >
                <div ref={previewContentRef} className="bg-white shadow-lg" style={{ width: '8.5in', minHeight: '11in' }}>
                  <ResumePreview />
                </div>
              </div>
            </div>
            {/* Template Controls */}
            <div className="mt-4 space-y-3">
              {/* Template Switching Buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                {Object.keys(templates).slice(0, 4).map((templateName) => (
                  <button
                    key={templateName}
                    onClick={() => setActiveTemplate(templateName)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${activeTemplate === templateName
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    {templateName.split(' ')[0]}
                  </button>
                ))}
                <button
                  onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                  className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  More...
                </button>
              </div>

              {/* Extended Template Selector */}
              {showTemplateSelector && (
                <div className="bg-white border rounded-lg p-4 shadow-lg">
                  <h3 className="font-semibold mb-3 text-center">Choose Template</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {Object.keys(templates).map((templateName) => (
                      <button
                        key={templateName}
                        onClick={() => {
                          setActiveTemplate(templateName);
                          setShowTemplateSelector(false);
                        }}
                        className={`px-3 py-2 text-xs rounded text-left transition-colors ${activeTemplate === templateName
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {templateName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Customization */}
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setShowColorEditor(!showColorEditor)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                >
                  🎨 Edit Colors
                </button>
              </div>

              {/* Color Editor Panel */}
              {showColorEditor && (
                <div className="bg-white border rounded-lg p-4 shadow-lg">
                  <h3 className="font-semibold mb-3 text-center">Customize Colors</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Primary Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={templateColors.primary}
                            onChange={(e) => setTemplateColors({ ...templateColors, primary: e.target.value })}
                            className="w-8 h-8 rounded border"
                          />
                          <input
                            type="text"
                            value={templateColors.primary}
                            onChange={(e) => setTemplateColors({ ...templateColors, primary: e.target.value })}
                            className="flex-1 px-2 py-1 text-xs border rounded"
                            placeholder="#3B82F6"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Secondary Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={templateColors.secondary}
                            onChange={(e) => setTemplateColors({ ...templateColors, secondary: e.target.value })}
                            className="w-8 h-8 rounded border"
                          />
                          <input
                            type="text"
                            value={templateColors.secondary}
                            onChange={(e) => setTemplateColors({ ...templateColors, secondary: e.target.value })}
                            className="flex-1 px-2 py-1 text-xs border rounded"
                            placeholder="#6B7280"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Accent Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={templateColors.accent}
                            onChange={(e) => setTemplateColors({ ...templateColors, accent: e.target.value })}
                            className="w-8 h-8 rounded border"
                          />
                          <input
                            type="text"
                            value={templateColors.accent}
                            onChange={(e) => setTemplateColors({ ...templateColors, accent: e.target.value })}
                            className="flex-1 px-2 py-1 text-xs border rounded"
                            placeholder="#10B981"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={templateColors.text}
                            onChange={(e) => setTemplateColors({ ...templateColors, text: e.target.value })}
                            className="w-8 h-8 rounded border"
                          />
                          <input
                            type="text"
                            value={templateColors.text}
                            onChange={(e) => setTemplateColors({ ...templateColors, text: e.target.value })}
                            className="flex-1 px-2 py-1 text-xs border rounded"
                            placeholder="#1F2937"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preset Color Schemes */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Quick Presets</label>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setTemplateColors({
                            primary: '#3B82F6', secondary: '#6B7280', accent: '#10B981',
                            background: '#FFFFFF', text: '#1F2937'
                          })}
                          className="w-8 h-8 rounded border-2 border-gray-300"
                          style={{ background: 'linear-gradient(45deg, #3B82F6 50%, #10B981 50%)' }}
                          title="Blue & Green"
                        />
                        <button
                          onClick={() => setTemplateColors({
                            primary: '#EF4444', secondary: '#6B7280', accent: '#F59E0B',
                            background: '#FFFFFF', text: '#1F2937'
                          })}
                          className="w-8 h-8 rounded border-2 border-gray-300"
                          style={{ background: 'linear-gradient(45deg, #EF4444 50%, #F59E0B 50%)' }}
                          title="Red & Orange"
                        />
                        <button
                          onClick={() => setTemplateColors({
                            primary: '#8B5CF6', secondary: '#6B7280', accent: '#EC4899',
                            background: '#FFFFFF', text: '#1F2937'
                          })}
                          className="w-8 h-8 rounded border-2 border-gray-300"
                          style={{ background: 'linear-gradient(45deg, #8B5CF6 50%, #EC4899 50%)' }}
                          title="Purple & Pink"
                        />
                        <button
                          onClick={() => setTemplateColors({
                            primary: '#059669', secondary: '#6B7280', accent: '#0891B2',
                            background: '#FFFFFF', text: '#1F2937'
                          })}
                          className="w-8 h-8 rounded border-2 border-gray-300"
                          style={{ background: 'linear-gradient(45deg, #059669 50%, #0891B2 50%)' }}
                          title="Green & Teal"
                        />
                        <button
                          onClick={() => setTemplateColors({
                            primary: '#1F2937', secondary: '#6B7280', accent: '#374151',
                            background: '#FFFFFF', text: '#1F2937'
                          })}
                          className="w-8 h-8 rounded border-2 border-gray-300"
                          style={{ background: 'linear-gradient(45deg, #1F2937 50%, #374151 50%)' }}
                          title="Professional Gray"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Hidden component for PDF generation */}
      <div style={{ position: 'fixed', left: '100vw', top: 0, zIndex: -1 }}>
        <div id="pdf-generator-content" className="bg-white" style={{ width: '8.5in', height: 'auto' }}>
          <ResumePreview />
        </div>
      </div>
    </div>
  );
};

export default BuilderPage; 