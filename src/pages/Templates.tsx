import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Download, Palette } from "lucide-react";
import { useState } from "react";
import CleanChromatic from '@/components/resume-templates/CleanChromatic';
import ContemporaryContrast from '@/components/resume-templates/ContemporaryContrast';
import TranquilChroma from '@/components/resume-templates/TranquilChroma';
import CreativeFlare from '@/components/resume-templates/CreativeFlare';
import ExecutiveProfessional from '@/components/resume-templates/ExecutiveProfessional';
import MinimalModern from '@/components/resume-templates/MinimalModern';
import ClassicTimeless from '@/components/resume-templates/ClassicTimeless';
import TechFocused from '@/components/resume-templates/TechFocused';
import CorporateElite from '@/components/resume-templates/CorporateElite';
import ModernGrid from '@/components/resume-templates/ModernGrid';
import CreativeEdge from '@/components/resume-templates/CreativeEdge';
import ProfessionalClean from '@/components/resume-templates/ProfessionalClean';
import IndustryStandard from '@/components/resume-templates/IndustryStandard';
import ModernMinimal from '@/components/resume-templates/ModernMinimal';
import Design7Template from '@/components/resume-templates/Design7Template';
import Design8Template from '@/components/resume-templates/Design8Template';
import Design9Template from '@/components/resume-templates/Design9Template';

function generateSessionId() {
  return 'sess-' + Math.random().toString(36).substr(2, 9);
}

const dummyData = {
    contact: { firstName: 'Ishaan', lastName: 'Agarwal', city: 'Noida', state: 'DL', phone: '911 999 3344', email: 'ishaan@agarwal.com' },
    summary: 'Diligent and adaptable recent college graduate with a B.S in Financial Accounting seeking a junior accountant position. Offering a proven ability to manage and maintain financial records, prepare financial reports, and ensure compliance with accounting principles.',
    skills: ['Teamwork', 'MS Office', 'Customer Service', 'Retail Operation', 'Full-Lifecycle Recruiting', 'Documentation and Reporting', 'Bookkeeping Expertise'],
    experience: { jobTitle: 'Retail Sales Associate', employer: 'V-Mart', startMonth: 'Feb', startYear: '2017', endMonth: 'Mar', endYear: '2021', current: false, city: 'Delhi', state: 'India' },
    education: { degree: 'B.S in Finacial Accounting', school: 'Oxford Software Institute & Oxford School of English, New Delhi', gradMonth: 'Jul', gradYear: '2016' }
};

const templates = [
    { id: 1, name: 'Clean Chromatic', Component: CleanChromatic },
    { id: 2, name: 'Contemporary Contrast', Component: ContemporaryContrast },
    { id: 3, name: 'Tranquil Chroma', Component: TranquilChroma },
    { id: 4, name: 'Creative Flare', Component: CreativeFlare },
    { id: 5, name: 'Executive Professional', Component: ExecutiveProfessional },
    { id: 6, name: 'Minimal Modern', Component: MinimalModern },
    { id: 7, name: 'Classic Timeless', Component: ClassicTimeless },
    { id: 8, name: 'Tech Focused', Component: TechFocused },
    { id: 9, name: 'Corporate Elite', Component: CorporateElite },
    { id: 10, name: 'Modern Grid', Component: ModernGrid },
    { id: 11, name: 'Creative Edge', Component: CreativeEdge },
    { id: 12, name: 'Professional Clean', Component: ProfessionalClean },
    { id: 13, name: 'Industry Standard', Component: IndustryStandard },
    { id: 14, name: 'Modern Minimal', Component: ModernMinimal },
    { id: 15, name: 'Teal Professional', Component: Design7Template },
    { id: 16, name: 'Rose Circular', Component: Design8Template },
    { id: 17, name: 'Violet Geometric', Component: Design9Template },
];


const TemplatesPage = () => {
    const [selectedColors, setSelectedColors] = useState<{[key: number]: string}>({});
    
    const availableColors = [
        { color: '#1e40af', name: 'Professional Blue' },
        { color: '#059669', name: 'Corporate Green' },
        { color: '#7c3aed', name: 'Executive Purple' },
        { color: '#dc2626', name: 'Bold Red' },
        { color: '#ea580c', name: 'Creative Orange' },
        { color: '#1f2937', name: 'Classic Charcoal' },
        { color: '#0891b2', name: 'Modern Teal' },
        { color: '#be123c', name: 'Elegant Rose' },
        { color: '#4338ca', name: 'Deep Indigo' },
        { color: '#16a34a', name: 'Fresh Emerald' },
        { color: '#7c2d12', name: 'Warm Brown' },
        { color: '#581c87', name: 'Royal Purple' },
        { color: '#0f172a', name: 'Midnight Black' },
        { color: '#374151', name: 'Slate Gray' },
        { color: '#0d9488', name: 'Professional Teal' },
    ];

    const handleColorChange = (templateId: number, color: string) => {
        setSelectedColors(prev => ({
            ...prev,
            [templateId]: color
        }));
    };

    const handleUseTemplate = (templateName: string) => {
        const sessionId = generateSessionId();
        const encodedTemplateName = encodeURIComponent(templateName);
        window.location.href = `/builder/${sessionId}?template=${encodedTemplateName}`;
    };

    return (
        <div className="min-h-screen bg-background py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-foreground mb-4 animate-fade-in">
                    Choose Your Resume Template
                </h2>
                <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in">
                    Select a template to start building your professional resume. You can change it later.
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mb-12 animate-fade-in">
                    {templates.map((template) => (
                        <div key={template.id} className="group transition-all duration-300 flex flex-col items-center">
                            <div className="relative">
                                <h3 className="text-xl font-bold text-center text-foreground mb-4">{template.name}</h3>
                                {/* Template Category Badge */}
                                <div className="absolute -top-2 -right-4">
                                    {template.id <= 4 && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Original</span>}
                                    {template.id >= 5 && template.id <= 7 && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Executive</span>}
                                    {template.id >= 8 && template.id <= 10 && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Modern</span>}
                                    {template.id >= 11 && template.id <= 14 && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Creative</span>}
                                    {template.id >= 15 && template.id <= 17 && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Designer</span>}
                                    {template.id >= 13 && template.id <= 14 && <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Classic</span>}
                                </div>
                            </div>
                            <div
                                className="relative h-[400px] w-full max-w-[280px] overflow-hidden rounded-lg shadow-lg border cursor-pointer hover:shadow-xl transition-all duration-300 group-hover:scale-105 hover:border-primary"
                                onClick={() => handleUseTemplate(template.name)}
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 transform scale-[0.32] origin-top w-[8.5in] h-[11in]">
                                    <template.Component 
                                        {...dummyData} 
                                        experience={dummyData.experience} 
                                        education={dummyData.education}
                                        primaryColor={selectedColors[template.id] || availableColors[0].color}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button size="lg" className="gap-2 pointer-events-none bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-transform duration-300">
                                        <Download className="w-4 h-4" />
                                        Use Template
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
                            
                            {/* Color Selection */}
                            <div className="mt-4 p-4 bg-card rounded-lg border max-w-[280px] w-full">
                                <div className="flex items-center gap-2 mb-3">
                                    <Palette className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">Choose Color</span>
                                </div>
                                <ColorPicker
                                    colors={availableColors}
                                    selectedColor={selectedColors[template.id] || availableColors[0]}
                                    onColorChange={(color) => handleColorChange(template.id, color)}
                                    className="justify-center"
                                />
                            </div>
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