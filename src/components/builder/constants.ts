// Builder Constants

export const WORK_RECOMMENDATIONS = {
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
} as const;

export const RELATED_JOB_TITLES = {
  "Developer": ["Software Developer", "Web Developer", "Frontend Developer", "Backend Developer"],
  "Software Developer": ["Developer", "Web Developer", "Full Stack Developer"],
  "Web Developer": ["Developer", "Software Developer", "Frontend Developer"]
} as const;

export const SUMMARY_RECOMMENDATIONS = [
  "Highly motivated and experienced customer service representative with over [number] years of experience in providing excellent customer service. Possesses strong communication, problem-solving, and customer service skills.",
  "Professional customer service representative with [number] years of experience in providing exceptional customer service. Possesses strong communication, problem-solving, and customer service skills. Experienced in handling customer complaints, inquiries, and requests.",
  "Results-oriented customer service representative with [number] years of experience in providing outstanding customer service. Possesses excellent interpersonal, problem-solving, and customer service skills.",
] as const;

export const SKILLS_LIST = [
  "Customer Service", "Resolving Conflict", "Phone Operations", "Office Applications", 
  "Conflict resolution", "Persuasive Speaking", "Cash Register", "Office Equipment", 
  "Helpfulness", "Inventory Management", "Attentiveness", "Training & Development", 
  "Market Knowledge", "Quick Learning Ability", "Customer Care", "Upselling", 
  "Employee Scheduling", "Stress Management"
] as const;

export const EXPERT_RECOMMENDED_SKILLS = [
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
  "PPC Advertising", "CRM Systems", "A/B Testing", "Team Management"
] as const;

export const EDUCATION_LEVELS = [
  "Secondary School",
  "Vocational Certificate or Diploma", 
  "Apprenticeship or Internship Training",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctoral Degree",
  "Professional Certification"
] as const;

export const DEGREE_OPTIONS = [
  "Associate of Arts (AA)",
  "Associate of Science (AS)", 
  "Associate of Applied Science (AAS)",
  "Bachelor of Arts (BA)",
  "Bachelor of Science (BS)",
  "Bachelor of Business Administration (BBA)",
  "Bachelor of Engineering (BE)",
  "Bachelor of Technology (BTech)",
  "Master of Arts (MA)",
  "Master of Science (MS)",
  "Master of Business Administration (MBA)",
  "Master of Engineering (ME)",
  "Doctor of Philosophy (PhD)",
  "Doctor of Medicine (MD)",
  "Juris Doctor (JD)"
] as const;

export const DEFAULT_TEMPLATE_COLORS = {
  primary: '#3B82F6',
  secondary: '#6B7280', 
  accent: '#10B981',
  background: '#FFFFFF',
  text: '#1F2937'
} as const;

export const COLOR_THEMES = [
  {
    name: "Professional Blue",
    colors: { primary: '#3B82F6', secondary: '#6B7280', accent: '#1E40AF', background: '#FFFFFF', text: '#1F2937' }
  },
  {
    name: "Modern Purple", 
    colors: { primary: '#8B5CF6', secondary: '#6B7280', accent: '#7C3AED', background: '#FFFFFF', text: '#1F2937' }
  },
  {
    name: "Corporate Red",
    colors: { primary: '#EF4444', secondary: '#6B7280', accent: '#DC2626', background: '#FFFFFF', text: '#1F2937' }
  },
  {
    name: "Green & Teal",
    colors: { primary: '#059669', secondary: '#6B7280', accent: '#0891B2', background: '#FFFFFF', text: '#1F2937' }
  },
  {
    name: "Professional Gray",
    colors: { primary: '#1F2937', secondary: '#6B7280', accent: '#374151', background: '#FFFFFF', text: '#1F2937' }
  }
] as const; 