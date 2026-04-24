import React from "react";
import { AVAILABLE_TEMPLATES } from "@/components/builder/hooks/useTemplateManager";

interface TemplatePreviewMiniProps {
  title: string;
  categoryLabel?: string;
}

/**
 * Extremely lightweight visual preview used only on the templates listing page.
 * Designed to stay very small in the bundle (< ~15kb once built and minified).
 */
const TemplatePreviewMini: React.FC<TemplatePreviewMiniProps> = ({
  title,
  categoryLabel,
}) => {
  const TemplateComponent =
    AVAILABLE_TEMPLATES[title as keyof typeof AVAILABLE_TEMPLATES];

  const sampleResumeData = {
    contact: {
      firstName: "Alex",
      lastName: "Taylor",
      email: "alex.taylor@email.com",
      phone: "+1 (555) 123-4567",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      summary:
        "Results-driven software engineer with experience building scalable web applications.",
    },
    summary:
      "Results-driven software engineer with experience building scalable web applications.",
    skills: ["React", "TypeScript", "Node.js", "Python", "PostgreSQL"],
    workExperiences: [
      {
        jobTitle: "Software Engineer",
        company: "Nova Tech",
        location: "San Francisco, CA",
        startDate: "2022-01",
        endDate: "Present",
        responsibilities: [
          "Built and maintained React applications for core business workflows",
          "Improved page performance and reliability across critical user journeys",
        ],
      },
    ],
    education: [
      {
        degree: "B.Tech in Computer Science",
        school: "State University",
        location: "California, USA",
        graduationDate: "2021-05",
      },
    ],
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
      education: true,
    },
  };

  return (
    <div className="relative w-full aspect-[8.5/11] rounded-xl border bg-white shadow-sm overflow-hidden">
      {TemplateComponent ? (
        <div className="w-full h-full overflow-hidden">
          <div className="transform scale-[0.15] origin-top-left w-[567px] h-[735px] bg-white">
            <TemplateComponent
              contact={sampleResumeData.contact}
              summary={sampleResumeData.summary}
              skills={sampleResumeData.skills}
              experience={sampleResumeData.workExperiences[0]}
              education={sampleResumeData.education}
              primaryColor="#334D6E"
              colors={{ primary: "#334D6E", secondary: "#6B7280", accent: "#3B82F6" }}
              projects={sampleResumeData.projects}
              certifications={sampleResumeData.certifications}
              languages={sampleResumeData.languages}
              volunteerExperience={sampleResumeData.volunteerExperiences}
              publications={sampleResumeData.publications}
              awards={sampleResumeData.awards}
              references={sampleResumeData.references}
              activeSections={sampleResumeData.activeSections}
            />
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 text-xs">
          Preview unavailable
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 px-2 py-1 bg-white/95 border-t text-[10px] flex items-center justify-between">
        <span className="font-medium truncate" title={title}>
          {title}
        </span>
        {categoryLabel && (
          <span className="text-[9px] text-gray-500 ml-2 truncate">
            {categoryLabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default TemplatePreviewMini;


