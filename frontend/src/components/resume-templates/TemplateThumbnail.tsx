import React from "react";
import { AVAILABLE_TEMPLATES } from "@/components/builder/hooks/useTemplateManager";

/**
 * Renders a real resume template scaled down to fit inside a small card on the
 * Templates gallery. Uses realistic sample data so the template previews look
 * representative, and is defensive against template-level runtime errors so
 * one broken template cannot blank out the whole page.
 */

// -- Sample data used for the live preview --------------------------------
const sampleDate = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? new Date() : d;
};

const sampleContact = {
    firstName: "Alex",
    lastName: "Taylor",
    email: "alex.taylor@email.com",
    phone: "+1 (555) 123-4567",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    summary:
        "Experienced software engineer with 6+ years building scalable web products, leading cross-functional teams and shipping user-loved features.",
};

const sampleExperienceSingle = {
    id: 1,
    jobTitle: "Senior Software Engineer",
    employer: "Nova Tech",
    company: "Nova Tech",
    city: "San Francisco",
    state: "CA",
    location: "San Francisco, CA",
    startDate: sampleDate("2022-01-10"),
    endDate: sampleDate("2024-06-30"),
    current: false,
    accomplishments:
        "Led migration to a micro-frontend architecture, improving deploy speed by 40%.\nMentored 4 junior engineers and drove a company-wide design-system initiative.\nShipped a new onboarding flow that lifted activation by 18%.",
};

const sampleExperienceArray = [
    sampleExperienceSingle,
    {
        id: 2,
        jobTitle: "Software Engineer",
        employer: "BrightApps",
        company: "BrightApps",
        city: "Austin",
        state: "TX",
        location: "Austin, TX",
        startDate: sampleDate("2019-08-01"),
        endDate: sampleDate("2021-12-31"),
        current: false,
        accomplishments:
            "Built real-time collaboration features used by 120k+ daily users.\nReduced API latency by 35% through query tuning and caching.",
    },
];

const sampleEducation = {
    degree: "B.Sc. Computer Science",
    school: "State University",
    location: "California, USA",
    gradMonth: "May",
    gradYear: "2019",
    graduationDate: sampleDate("2019-05-15"),
};

const sampleSkills = [
    "React",
    "TypeScript",
    "Node.js",
    "GraphQL",
    "PostgreSQL",
    "System Design",
];

const buildResumeData = () => ({
    contact: { ...sampleContact },
    summary: sampleContact.summary,
    skills: sampleSkills,
    workExperiences: sampleExperienceArray,
    education: sampleEducation,
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
        experience: true,
        education: true,
        skills: true,
        projects: false,
        certifications: false,
        languages: false,
        volunteer: false,
        publications: false,
        awards: false,
        references: false,
    },
});

// -- Error boundary so one broken template does not blank the gallery ----
class SafeTemplateWrapper extends React.Component<
    { children: React.ReactNode; templateName: string },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode; templateName: string }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error: unknown) {
        // eslint-disable-next-line no-console
        console.warn(`Template preview failed: ${this.props.templateName}`, error);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center text-xs text-gray-400 bg-gray-50">
                    <span className="font-medium">{this.props.templateName}</span>
                    <span>preview unavailable</span>
                </div>
            );
        }
        return this.props.children;
    }
}

// -- Public component -----------------------------------------------------
interface TemplateThumbnailProps {
    templateName: string;
    primaryColor?: string;
}

/**
 * A4-ratio card that renders the real template scaled down to fit.
 * Internally we render the template at 800px × ~1035px ("letter" ratio)
 * and scale it down using CSS transform so typography + layout stay
 * proportionally crisp.
 */
const INTRINSIC_WIDTH = 800;
const INTRINSIC_HEIGHT = 1035; // 8.5 / 11 ratio

const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
    templateName,
    primaryColor = "#334D6E",
}) => {
    const TemplateComponent =
        AVAILABLE_TEMPLATES[templateName as keyof typeof AVAILABLE_TEMPLATES];

    const resumeData = React.useMemo(buildResumeData, []);

    if (!TemplateComponent) {
        return (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-50">
                {templateName}
            </div>
        );
    }

    return (
        <div
            className="relative w-full h-full overflow-hidden bg-white"
            // Keep the card itself at an 8.5:11 aspect ratio through the parent.
        >
            <div
                className="absolute top-0 left-0 origin-top-left"
                style={{
                    width: `${INTRINSIC_WIDTH}px`,
                    height: `${INTRINSIC_HEIGHT}px`,
                    // transform is set via CSS var so parent can override
                    // We pick a safe default scale that fits a ~260px wide card.
                    transform: `scale(var(--thumb-scale, 0.32))`,
                }}
            >
                <SafeTemplateWrapper templateName={templateName}>
                    <TemplateComponent
                        contact={resumeData.contact}
                        summary={resumeData.summary}
                        skills={resumeData.skills}
                        // Single-object shape — matches what templates expect
                        experience={resumeData.workExperiences[0]}
                        // Some templates also optionally read an array
                        experiences={resumeData.workExperiences}
                        workExperiences={resumeData.workExperiences}
                        education={resumeData.education}
                        primaryColor={primaryColor}
                        colors={{
                            primary: primaryColor,
                            secondary: "#6B7280",
                            accent: "#3B82F6",
                        }}
                        projects={resumeData.projects}
                        certifications={resumeData.certifications}
                        languages={resumeData.languages}
                        volunteerExperience={resumeData.volunteerExperiences}
                        publications={resumeData.publications}
                        awards={resumeData.awards}
                        references={resumeData.references}
                        activeSections={resumeData.activeSections}
                    />
                </SafeTemplateWrapper>
            </div>
        </div>
    );
};

export default TemplateThumbnail;
