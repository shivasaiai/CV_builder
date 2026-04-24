import { Button } from "@/components/ui/button";
import { Code } from "lucide-react";

const Navigation = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300 cursor-pointer">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CraftmyCV</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-foreground hover:text-primary transition-colors duration-300 hover:scale-105"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="text-foreground hover:text-primary transition-colors duration-300 hover:scale-105"
            >
              How it works
            </button>
            <button 
              onClick={() => scrollToSection('templates')}
              className="text-foreground hover:text-primary transition-colors duration-300 hover:scale-105"
            >
              Templates
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="text-foreground hover:text-primary transition-colors duration-300 hover:scale-105"
            >
              Pricing
            </button>
            <Button 
              onClick={() => scrollToSection('get-started')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform duration-300"
            >
              Create Resume Now
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;