import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-foreground mb-4">Simple Pricing Plans</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Start free and create unlimited resumes. Upgrade for premium templates and advanced features.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in">
          <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-foreground mb-4">
                Basic
              </CardTitle>
              <div className="text-4xl font-bold text-foreground mb-2">
                $0
              </div>
              <p className="text-muted-foreground">Forever free</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground mb-4">Perfect for getting started with your first resume</p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">1 resume template</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Basic customization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">PDF download</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Community support</span>
                </div>
              </div>
              
              <Button className="w-full mt-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground hover:scale-105 transition-transform duration-300">
                Get Started Free
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-primary hover:shadow-lg transition-all duration-300 hover:scale-105 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-foreground mb-4">
                Premium
              </CardTitle>
              <div className="text-4xl font-bold text-foreground mb-2">
                $2.70
              </div>
              <p className="text-muted-foreground">per month</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground mb-4">Best value for job seekers who want all features</p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Unlimited resume downloads</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">18+ professional templates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Cover letter builder</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Expert resume review</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Priority support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">ATS-friendly formats</span>
                </div>
              </div>
              
              <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform duration-300">
                Start Premium Trial
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-foreground mb-4">
                Premium Plus
              </CardTitle>
              <div className="text-4xl font-bold text-foreground mb-2">
                $5.95
              </div>
              <p className="text-muted-foreground">per month</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground mb-4">For professionals who need premium support</p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Everything in Premium</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">LinkedIn profile optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Personal career consultation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Interview preparation guide</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Salary negotiation tips</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">Career coaching session</span>
                </div>
              </div>
              
              <Button className="w-full mt-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground hover:scale-105 transition-transform duration-300">
                Choose Premium Plus
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;