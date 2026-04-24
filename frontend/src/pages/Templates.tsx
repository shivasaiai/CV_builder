import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Download, Search } from "lucide-react";
import TemplateThumbnail from "@/components/resume-templates/TemplateThumbnail";
import Navigation from "@/components/Navigation";

function generateSessionId() {
    return "sess-" + Math.random().toString(36).substr(2, 9);
}

type TemplateCategory = "Modern" | "Creative" | "Classic" | "Executive" | "Simple";

interface TemplateMeta {
    id: number;
    name: string;
    category: TemplateCategory;
    description: string;
    isPopular?: boolean;
}

const templates: TemplateMeta[] = [
    { id: 1, name: "Clean Chromatic", category: "Modern", description: "Clean design with blue sidebar, perfect for any profession", isPopular: true },
    { id: 2, name: "Contemporary Contrast", category: "Modern", description: "Contemporary layout with dark sidebar and bold typography" },
    { id: 3, name: "Tranquil Chroma", category: "Simple", description: "Tranquil design with header focus and organized sections" },
    { id: 4, name: "Creative Flare", category: "Creative", description: "Creative layout with curved elements and light blue accents" },
    { id: 5, name: "Executive Professional", category: "Executive", description: "Executive-level template with elegant serif fonts", isPopular: true },
    { id: 6, name: "Minimal Modern", category: "Simple", description: "Modern minimal design with blue accents and clean lines" },
    { id: 7, name: "Classic Timeless", category: "Classic", description: "Timeless classic format with centered layout" },
    { id: 8, name: "Tech Focused", category: "Modern", description: "Developer-focused template with code-inspired design" },
    { id: 9, name: "Corporate Elite", category: "Executive", description: "Corporate elite design with sophisticated slate color" },
    { id: 10, name: "Modern Grid", category: "Modern", description: "Grid-based modern layout with indigo gradient header" },
    { id: 11, name: "Creative Edge", category: "Creative", description: "Creative edge design with diagonal header and timeline" },
    { id: 12, name: "Professional Clean", category: "Classic", description: "Ultra-clean professional layout with bold typography" },
    { id: 13, name: "Industry Standard", category: "Classic", description: "Industry standard format that works everywhere" },
    { id: 14, name: "Modern Minimal", category: "Simple", description: "Modern minimal with ultra-light typography" },
    { id: 15, name: "Teal Professional", category: "Creative", description: "Teal professional design with skill progress bars" },
    { id: 16, name: "Rose Circular", category: "Creative", description: "Rose-themed circular design with icon sections" },
    { id: 17, name: "Violet Geometric", category: "Creative", description: "Violet geometric template with creative shapes" },
];

const CATEGORIES: Array<"All" | TemplateCategory> = [
    "All",
    "Modern",
    "Creative",
    "Classic",
    "Executive",
    "Simple",
];

const TemplatesPage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get("userType");

    const [activeCategory, setActiveCategory] = useState<"All" | TemplateCategory>("All");
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const filtered = useMemo(() => {
        return templates.filter((t) => {
            const matchesCategory = activeCategory === "All" || t.category === activeCategory;
            const matchesQuery = t.name.toLowerCase().includes(query.trim().toLowerCase());
            return matchesCategory && matchesQuery;
        });
    }, [activeCategory, query]);

    const handleUseTemplate = (template: TemplateMeta) => {
        const sessionId = generateSessionId();
        const encodedTemplateName = encodeURIComponent(template.name);
        const uType = userType || "experienced";
        window.location.href = `/builder-new/${sessionId}?template=${encodedTemplateName}&userType=${uType}`;
    };

    const heading =
        userType === "fresher"
            ? "Fresh Graduate Templates"
            : userType === "experienced"
            ? "Professional Templates"
            : "Choose Your Resume Template";

    const subheading =
        userType === "fresher"
            ? "Select a template designed for new graduates and entry-level positions."
            : userType === "experienced"
            ? "Choose from professional templates designed for experienced professionals."
            : "Select a template to start building your professional resume. You can change it later.";

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <div className="pt-28 pb-20">
                <div className="container mx-auto px-4">
                    {/* Back link */}
                    <button
                        onClick={() => (window.location.href = "/")}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to home
                    </button>

                    {/* Heading */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            {heading}
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">{subheading}</p>
                    </div>

                    {/* Filter + search */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={
                                        "px-4 py-2 rounded-full text-sm font-medium transition-colors " +
                                        (activeCategory === cat
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300")
                                    }
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-72">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search templates..."
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Grid */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            No templates match your search.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
                            {filtered.map((template) => {
                                const isSelected = selectedId === template.id;
                                return (
                                    <div
                                        key={template.id}
                                        className="flex flex-col"
                                        onMouseEnter={() => setSelectedId(template.id)}
                                        onMouseLeave={() =>
                                            setSelectedId((s) => (s === template.id ? null : s))
                                        }
                                    >
                                        {/* Preview card */}
                                        <div
                                            className={
                                                "group relative bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 aspect-[3/4] " +
                                                (isSelected
                                                    ? "border-blue-500 ring-2 ring-blue-500/30"
                                                    : "border-gray-200")
                                            }
                                        >
                                            {/* Template render */}
                                            <TemplateThumbnail templateName={template.name} />

                                            {/* Badges */}
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <span className="bg-green-500 text-white text-[11px] px-2 py-1 rounded-full font-medium shadow">
                                                    ATS Friendly
                                                </span>
                                                {template.isPopular && (
                                                    <span className="bg-blue-600 text-white text-[11px] px-2 py-1 rounded-full font-medium shadow">
                                                        Popular
                                                    </span>
                                                )}
                                            </div>

                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-5">
                                                <Button
                                                    onClick={() => handleUseTemplate(template)}
                                                    className="gap-2 bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Use This Template
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Meta */}
                                        <div className="mt-4 flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="text-base font-semibold text-gray-900 truncate">
                                                    {template.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {template.description}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-[10px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                                {template.category}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <div>
                                <div className="text-3xl font-bold text-blue-600">
                                    {templates.length}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">Templates</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-green-600 inline-flex items-center gap-1">
                                    <Check className="w-6 h-6" /> 100%
                                </div>
                                <div className="text-sm text-gray-500 mt-1">ATS Friendly</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-purple-600">5</div>
                                <div className="text-sm text-gray-500 mt-1">Design Styles</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-orange-500">∞</div>
                                <div className="text-sm text-gray-500 mt-1">Customizations</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplatesPage;
