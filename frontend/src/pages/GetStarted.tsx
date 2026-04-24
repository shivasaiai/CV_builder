import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, GraduationCap, Briefcase, Upload, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

type ExperienceLevel = "fresher" | "mid" | "experienced";

interface OptionCard {
    id: ExperienceLevel;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
    highlights: string[];
}

const OPTIONS: OptionCard[] = [
    {
        id: "fresher",
        title: "Student / Fresh Graduate",
        subtitle: "0 — 1 years of experience",
        description:
            "Perfect for students, recent graduates, and first-time job seekers. We'll help you highlight your education, projects, and potential.",
        icon: <GraduationCap className="w-10 h-10" />,
        highlights: [
            "Education-forward templates",
            "Projects & internships focus",
            "Ready-to-use bullet points",
        ],
    },
    {
        id: "mid",
        title: "Mid-Level Professional",
        subtitle: "2 — 5 years of experience",
        description:
            "For professionals with a few years under their belt. Show your growing expertise and measurable impact.",
        icon: <Sparkles className="w-10 h-10" />,
        badge: "Popular",
        highlights: [
            "Balanced format",
            "Skills & achievements focus",
            "Industry keywords built in",
        ],
    },
    {
        id: "experienced",
        title: "Experienced Professional",
        subtitle: "5+ years of experience",
        description:
            "For senior professionals, managers, and executives. Showcase leadership, complex projects, and career progression.",
        icon: <Briefcase className="w-10 h-10" />,
        highlights: [
            "Executive-style templates",
            "Leadership & results focus",
            "Multi-page support",
        ],
    },
];

const GetStarted = () => {
    const navigate = useNavigate();

    const handleSelect = (level: ExperienceLevel) => {
        // Map "mid" to "experienced" template set for now, preserve "fresher"
        const uType = level === "fresher" ? "fresher" : "experienced";
        navigate(`/templates?userType=${uType}&level=${level}`);
    };

    const handleUpload = () => {
        navigate(`/templates?userType=experienced&upload=1`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-white">
            <Navigation />

            <div className="pt-28 pb-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Back */}
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to home
                    </button>

                    {/* Progress pill */}
                    <div className="flex justify-center mb-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            Step 1 of 3 · Getting to know you
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="text-center mb-14">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                            How much experience do you have?
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                            We'll pick the right resume format and tailor the content
                            suggestions to where you are in your career.
                        </p>
                    </div>

                    {/* Option cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => handleSelect(opt.id)}
                                className="group relative text-left bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 p-6 flex flex-col"
                            >
                                {opt.badge && (
                                    <span className="absolute -top-3 right-6 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                                        {opt.badge}
                                    </span>
                                )}

                                <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    {opt.icon}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                    {opt.title}
                                </h3>
                                <p className="text-sm text-blue-600 font-medium mb-3">
                                    {opt.subtitle}
                                </p>
                                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                                    {opt.description}
                                </p>

                                <ul className="space-y-2 mb-5">
                                    {opt.highlights.map((h) => (
                                        <li
                                            key={h}
                                            className="flex items-center gap-2 text-sm text-gray-700"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                            {h}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        Choose this
                                    </span>
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Divider with "or" */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                            or
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Upload existing CTA */}
                    <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl border border-gray-200 p-8">
                        <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Already have a resume?
                        </h2>
                        <p className="text-gray-600 mb-5 text-sm">
                            Upload your existing resume and we'll import your details so you
                            can start editing in seconds.
                        </p>
                        <Button onClick={handleUpload} variant="outline" className="gap-2">
                            <Upload className="w-4 h-4" />
                            Upload Existing Resume
                        </Button>
                    </div>

                    {/* Trust row */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">8M+</div>
                            <div className="text-xs text-gray-500 mt-1">Resumes created</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">17</div>
                            <div className="text-xs text-gray-500 mt-1">ATS-friendly templates</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">~10 min</div>
                            <div className="text-xs text-gray-500 mt-1">Average build time</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">100%</div>
                            <div className="text-xs text-gray-500 mt-1">Free to try</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GetStarted;
