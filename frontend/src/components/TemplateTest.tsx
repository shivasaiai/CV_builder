import React, { useState } from 'react';
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

// Sample data for testing
const sampleData = {
  contact: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    city: "New York",
    state: "NY",
    zip: "10001",
    summary: "Experienced software developer with 5+ years of experience in full-stack development."
  },
  summary: "Experienced software developer with 5+ years of experience in full-stack development.",
  skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git"],
  workExperiences: [{
    jobTitle: "Senior Software Developer",
    company: "Tech Corp",
    location: "New York, NY",
    startDate: "2022-01",
    endDate: "Present",
    responsibilities: [
      "Led development of web applications using React and Node.js",
      "Collaborated with cross-functional teams to deliver high-quality software",
      "Mentored junior developers and conducted code reviews"
    ]
  }],
  education: [{
    degree: "Bachelor of Science in Computer Science",
    school: "University of Technology",
    location: "New York, NY",
    graduationDate: "2020-05"
  }],
  projects: [],
  certifications: [],
  languages: [],
  volunteerExperiences: [],
  publications: [],
  awards: [],
  references: [],
  activeSections: {
    contact: true,
    summary: true,
    skills: true,
    experience: true,
    education: true
  }
};

const TemplateTest: React.FC = () => {
  const [activeTemplate, setActiveTemplate] = useState("Clean Chromatic");
  const [isChanging, setIsChanging] = useState(false);

  const handleTemplateChange = (templateName: string) => {
    console.log(`Testing template change: ${templateName}`);
    setIsChanging(true);
    setActiveTemplate(templateName);
    
    setTimeout(() => {
      setIsChanging(false);
    }, 300);
  };

  const TemplateComponent = templates[activeTemplate];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">🧪 Template Testing Component</h1>
          <p className="text-gray-600 mb-4">
            This component tests all resume templates to ensure they render correctly.
          </p>
          
          {/* Template Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Select Template:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.keys(templates).map((templateName) => (
                <button
                  key={templateName}
                  onClick={() => handleTemplateChange(templateName)}
                  className={`px-3 py-2 text-sm rounded transition-colors ${
                    activeTemplate === templateName
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {templateName}
                </button>
              ))}
            </div>
          </div>

          {/* Current Template Info */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm">
              <strong>Current Template:</strong> {activeTemplate}
              {isChanging && <span className="ml-2 text-blue-600">🔄 Switching...</span>}
            </p>
          </div>
        </div>

        {/* Template Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Template Preview:</h3>
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 flex justify-center">
            <div className="transform scale-50 origin-top">
              <div className="bg-white shadow-lg" style={{ width: '8.5in', minHeight: '11in' }}>
                {TemplateComponent ? (
                  <TemplateComponent
                    contact={sampleData.contact}
                    summary={sampleData.summary}
                    skills={sampleData.skills}
                    experience={sampleData.workExperiences[0]}
                    education={sampleData.education}
                    colors={{
                      primary: '#1e40af',
                      secondary: '#3b82f6',
                      accent: '#60a5fa',
                      text: '#1f2937',
                      background: '#ffffff'
                    }}
                    primaryColor="#1e40af"
                    projects={sampleData.projects}
                    certifications={sampleData.certifications}
                    languages={sampleData.languages}
                    volunteerExperience={sampleData.volunteerExperiences}
                    publications={sampleData.publications}
                    awards={sampleData.awards}
                    references={sampleData.references}
                    activeSections={sampleData.activeSections}
                  />
                ) : (
                  <div className="p-8 text-center text-red-500">
                    <h3>Template Not Found</h3>
                    <p>The template "{activeTemplate}" could not be loaded.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Template Status */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Template Status:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(templates).map(([name, component]) => (
              <div
                key={name}
                className={`p-3 rounded-lg border-2 ${
                  component ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    component ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {component ? '✅ OK' : '❌ Error'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateTest;