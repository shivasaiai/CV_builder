import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import TemplatePreviewMini from "@/components/resume-templates/TemplatePreviewMini";

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
                <h2 className="text-4xl font-bold text-center text-foreground mb-4 animate-fade-in">
                    {userType === 'fresher' ? 'Fresh Graduate Templates' : userType === 'experienced' ? 'Professional Templates' : 'Choose Your Resume Template'}
                </h2>
                <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in">
                    {userType === 'fresher' 
                        ? 'Select a template designed for new graduates and entry-level positions. Showcase your potential and skills effectively.'
                        : userType === 'experienced'
                        ? 'Choose from professional templates designed for experienced professionals. Highlight your achievements and career progression.'
                        : 'Select a template to start building your professional resume. You can change it later.'
                    }
                </p>
                {/* Template Categories */}
                <div className="mb-12">
                    <div className="flex justify-center mb-8">
                        <div className="bg-white rounded-lg p-2 shadow-md">
                            <div className="flex space-x-2 text-sm">
                                <span className="px-4 py-2 bg-primary text-white rounded-md">All Templates</span>
                                <span className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer">Executive</span>
                                <span className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer">Modern</span>
                                <span className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer">Creative</span>
                                <span className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer">Classic</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12 animate-fade-in">
                    {templates.map((template) => (
                        <div key={template.id} className="group transition-all duration-300 flex flex-col items-center">
                            <div className="relative mb-3">
                                <h3 className="text-xl font-bold text-center text-foreground mb-4">
                                    {template.name}
                                </h3>
                                {/* Template Category Badge */}
                                <div className="absolute -top-2 -right-4">
                                    {template.id >= 5 && template.id <= 7 && (
                                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                            Executive
                                        </span>
                                    )}
                                    {template.id >= 8 && template.id <= 10 && (
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                            Modern
                                        </span>
                                    )}
                                    {template.id >= 11 && template.id <= 14 && (
                                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                            Creative
                                        </span>
                                    )}
                                    {template.id >= 15 && template.id <= 17 && (
                                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                            Designer
                                        </span>
                                    )}
                                    {template.id >= 13 && template.id <= 14 && (
                                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                            Classic
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div
                                className="relative w-full max-w-[260px] cursor-pointer hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]"
                                onClick={() => handleUseTemplate(template.name, template.id)}
                            >
                                <TemplatePreviewMini title={template.name} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 rounded-xl">
                                    <div className="text-white text-center mb-2">
                                        <h4 className="font-semibold text-lg mb-1">
                                            Use {template.name}
                                        </h4>
                                        <p className="text-sm text-gray-200">
                                            Click to select this template
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="gap-2 pointer-events-none bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-all duration-200 shadow-lg"
                                    >
                                        <Download className="w-4 h-4" />
                                        Use This Template
                                    </Button>
                                </div>
                                {/* ATS Badge */}
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                    ATS Friendly
                                </div>
                            </div>
                            {/* Template Description */}
                            <p className="text-center text-muted-foreground text-sm mt-3 max-w-[280px]">
                                {template.id === 1 && "Clean design with blue sidebar, perfect for any profession"}
                                {template.id === 2 && "Contemporary layout with dark sidebar and bold typography"}
                                {template.id === 3 && "Tranquil design with header focus and organized sections"}
                                {template.id === 4 && "Creative layout with curved elements and light blue accents"}
                                {template.id === 5 && "Executive-level template with elegant serif fonts and gradient header"}
                                {template.id === 6 && "Modern minimal design with blue accents and clean lines"}
                                {template.id === 7 && "Timeless classic format with centered layout and traditional styling"}
                                {template.id === 8 && "Developer-focused template with code-inspired terminal design"}
                                {template.id === 9 && "Corporate elite design with sophisticated slate color scheme"}
                                {template.id === 10 && "Grid-based modern layout with indigo gradient header"}
                                {template.id === 11 && "Creative edge design with diagonal header and timeline"}
                                {template.id === 12 && "Ultra-clean professional layout with bold typography"}
                                {template.id === 13 && "Industry standard format that works everywhere"}
                                {template.id === 14 && "Modern minimal with ultra-light typography and clean elements"}
                                {template.id === 15 && "Teal professional design with skill progress bars and timeline layout"}
                                {template.id === 16 && "Rose-themed circular design with icon sections and elegant styling"}
                                {template.id === 17 && "Violet geometric template with creative shapes and modern cards"}
                            </p>

                        </div>
                    ))}
                </div>

                {/* Template Stats */}
                <div className="text-center bg-card rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in">
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