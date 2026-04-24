import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import TemplateGridSystem from "@/components/builder/components/TemplateGrid/TemplateGridSystem";

function generateSessionId() {
  return 'sess-' + Math.random().toString(36).substr(2, 9);
}

const templates = [
    { id: 1, name: 'Clean Chromatic' },
    { id: 2, name: 'Contemporary Contrast' },
    { id: 3, name: 'Tranquil Chroma' },
    { id: 4, name: 'Creative Flare' },
    { id: 5, name: 'Executive Professional' },
    { id: 6, name: 'Minimal Modern' },
    { id: 7, name: 'Classic Timeless' },
    { id: 8, name: 'Tech Focused' },
    { id: 9, name: 'Corporate Elite' },
    { id: 10, name: 'Modern Grid' },
    { id: 11, name: 'Creative Edge' },
    { id: 12, name: 'Professional Clean' },
    { id: 13, name: 'Industry Standard' },
    { id: 14, name: 'Modern Minimal' },
    { id: 15, name: 'Teal Professional' },
    { id: 16, name: 'Rose Circular' },
    { id: 17, name: 'Violet Geometric' },
];

const previewResumeData = {
    contact: {
        firstName: "Alex",
        lastName: "Taylor",
        email: "alex.taylor@email.com",
        phone: "+1 (555) 123-4567",
        city: "San Francisco",
        state: "CA",
        zip: "94105",
        summary: "Experienced software engineer with strong product and system design skills."
    },
    workExperiences: [{
        jobTitle: "Software Engineer",
        company: "Nova Tech",
        location: "San Francisco, CA",
        startDate: "2022-01",
        endDate: "Present",
        responsibilities: [
            "Built user-facing features in React and TypeScript",
            "Improved application performance and reliability"
        ]
    }],
    education: {
        degree: "B.Tech in Computer Science",
        school: "State University",
        location: "California, USA",
        graduationDate: "2021-05"
    },
    skills: ["React", "TypeScript", "Node.js", "SQL", "System Design"],
    summary: "Experienced software engineer with strong product and system design skills.",
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
        references: false
    },
    theme: {
        template: "Clean Chromatic",
        colors: {
            primary: "#334D6E",
            secondary: "#6B7280",
            accent: "#3B82F6"
        },
        font: "Inter"
    }
};

const templatesForGrid = templates.map((template) => ({
    id: String(template.id),
    name: template.name,
    category: "All",
}));


const TemplatesPage = () => {

    const handleUseTemplate = (templateName: string, templateId: number) => {
        const sessionId = generateSessionId();
        const encodedTemplateName = encodeURIComponent(templateName);
        
        // Get user type from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const userType = urlParams.get('userType') || 'experienced';
        
        window.location.href = `/builder-new/${sessionId}?template=${encodedTemplateName}&userType=${userType}`;
    };

    // Get user type from URL params for dynamic content
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('userType');
    
    return (
        <div className="min-h-screen bg-background py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-foreground mb-4">
                    {userType === 'fresher' ? 'Fresh Graduate Templates' : userType === 'experienced' ? 'Professional Templates' : 'Choose Your Resume Template'}
                </h2>
                <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                    {userType === 'fresher' 
                        ? 'Select a template designed for new graduates and entry-level positions. Showcase your potential and skills effectively.'
                        : userType === 'experienced'
                        ? 'Choose from professional templates designed for experienced professionals. Highlight your achievements and career progression.'
                        : 'Select a template to start building your professional resume. You can change it later.'
                    }
                </p>
                <div className="mb-10 flex justify-center">
                    <span className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium">
                        All Templates
                    </span>
                </div>

                <div className="mb-12">
                    <TemplateGridSystem
                        selectedTemplate={undefined}
                        filteredTemplates={templatesForGrid}
                        resumeData={previewResumeData as any}
                        gridColumns={4}
                        showSearch={false}
                        showFilters={false}
                        onTemplateSelect={(templateName) => {
                            const selected = templates.find((t) => t.name === templateName);
                            if (selected) handleUseTemplate(templateName, selected.id);
                        }}
                    />
                </div>

                {/* Template Stats */}
                <div className="text-center bg-card rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-2xl font-bold text-foreground mb-4">Choose from 17 Professional Templates</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center group">
                            <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform duration-300">17</div>
                            <div className="text-muted-foreground">Templates</div>
                        </div>
                        <div className="text-center group">
                            <div className="text-3xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">100%</div>
                            <div className="text-muted-foreground">ATS Friendly</div>
                        </div>
                        <div className="text-center group">
                            <div className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">6</div>
                            <div className="text-muted-foreground">Design Styles</div>
                        </div>
                        <div className="text-center group">
                            <div className="text-3xl font-bold text-purple-600 group-hover:scale-110 transition-transform duration-300">∞</div>
                            <div className="text-muted-foreground">Customizations</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplatesPage; 