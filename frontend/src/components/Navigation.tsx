import { Button } from "@/components/ui/button";
import { Code, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isHome = location.pathname === "/";

    const navigateHome = () => {
        navigate("/");
    };

    const handleSectionLink = (id: string) => {
        setMobileOpen(false);
        if (isHome) {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        } else {
            navigate(`/#${id}`);
            setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    };

    const handleRouteLink = (path: string) => {
        setMobileOpen(false);
        navigate(path);
    };

    const links = [
        { label: "Home", onClick: () => (isHome ? handleSectionLink("home") : handleRouteLink("/")) },
        { label: "How it works", onClick: () => handleSectionLink("how-it-works") },
        { label: "Templates", onClick: () => handleRouteLink("/templates") },
        { label: "Pricing", onClick: () => handleSectionLink("pricing") },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Brand */}
                    <button
                        onClick={navigateHome}
                        className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
                    >
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Code className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-foreground">CraftmyCV</span>
                    </button>

                    {/* Desktop */}
                    <div className="hidden md:flex items-center space-x-8">
                        {links.map((l) => (
                            <button
                                key={l.label}
                                onClick={l.onClick}
                                className="text-foreground hover:text-primary transition-colors duration-300"
                            >
                                {l.label}
                            </button>
                        ))}
                        <Button
                            onClick={() => handleRouteLink("/get-started")}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground transition-transform duration-300 hover:scale-105"
                        >
                            Create Resume Now
                        </Button>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden p-2 rounded-lg text-foreground hover:bg-gray-100"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden mt-3 pb-3 border-t border-border pt-3 flex flex-col gap-3">
                        {links.map((l) => (
                            <button
                                key={l.label}
                                onClick={l.onClick}
                                className="text-left text-foreground hover:text-primary transition-colors duration-300"
                            >
                                {l.label}
                            </button>
                        ))}
                        <Button
                            onClick={() => handleRouteLink("/get-started")}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                        >
                            Create Resume Now
                        </Button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navigation;
