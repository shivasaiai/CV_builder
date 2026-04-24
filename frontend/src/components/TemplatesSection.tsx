import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ColorPicker } from "@/components/ui/color-picker";
import { Eye, Download, Star, Palette } from "lucide-react";
import { useState } from "react";

const TemplatesSection = () => {
  const [selectedColors, setSelectedColors] = useState<{[key: number]: string}>({});
  
  const availableColors = [
    '#1e40af', // blue
    '#059669', // green
    '#7c3aed', // purple
    '#dc2626', // red
    '#ea580c', // orange
    '#1f2937', // dark gray
    '#0891b2', // cyan
    '#be123c', // rose
    '#4338ca', // indigo
    '#16a34a', // emerald
  ];

  const handleColorChange = (templateId: number, color: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [templateId]: color
    }));
  };

  const templates = [
    {
      id: 1,
      name: "Modern Professional",
      category: "Executive",
      image: "/placeholder.svg",
      downloads: "12.5k",
      rating: 4.9,
      featured: true
    },
    {
      id: 2,
      name: "Creative Designer",
      category: "Creative",
      image: "/placeholder.svg",
      downloads: "8.2k",
      rating: 4.8,
      featured: false
    },
    {
      id: 3,
      name: "Tech Minimalist",
      category: "Technology",
      image: "/placeholder.svg",
      downloads: "15.1k",
      rating: 4.9,
      featured: true
    },
    {
      id: 4,
      name: "Classic Business",
      category: "Business",
      image: "/placeholder.svg",
      downloads: "9.7k",
      rating: 4.7,
      featured: false
    },
    {
      id: 5,
      name: "Bold Modern",
      category: "Creative",
      image: "/placeholder.svg",
      downloads: "6.8k",
      rating: 4.8,
      featured: false
    },
    {
      id: 6,
      name: "Executive Elite",
      category: "Executive",
      image: "/placeholder.svg",
      downloads: "11.3k",
      rating: 4.9,
      featured: true
    }
  ];

  return (
    <section id="templates" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-foreground mb-4">
          Professional Resume Templates
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Choose from our collection of ATS-friendly templates designed by career experts and loved by recruiters
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-fade-in">
          {templates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img 
                    src={template.image} 
                    alt={template.name}
                    className="w-full h-48 object-cover bg-muted"
                  />
                  {template.featured && (
                    <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                      Popular
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" className="gap-2 hover:scale-105 transition-transform duration-300">
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button size="sm" className="gap-2 hover:scale-105 transition-transform duration-300">
                      <Download className="w-4 h-4" />
                      Use Template
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 fill-current text-yellow-500" />
                      {template.rating}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{template.category}</span>
                    <span>{template.downloads} downloads</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="gap-2 hover:scale-105 transition-transform duration-300">
            View All Templates
            <span className="text-sm opacity-75">(50+ Available)</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TemplatesSection;