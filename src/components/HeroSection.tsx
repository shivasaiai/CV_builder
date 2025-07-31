import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import heroIllustration from "@/assets/hero-illustration.png";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";

const HeroSection = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const handleSelect = async (type: "fresher" | "experienced") => {
    console.log("Selected user type:", type);
    setSelectedType(type);
    setOpen(false);
    setIsLoading(true);

    // Show loading animation for 2.5 seconds then go to templates
    setTimeout(() => {
      window.location.href = "/templates";
    }, 2500);

    // Fire API call in background
    try {
      await fetch("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType: type }),
      });
    } catch (e) {
      console.error("Failed to update user type", e);
    }
  };

  return (
    <>
      <section id="home"
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Build Your Dream Resume in{" "}
              <span className="text-blue-600">Minutes</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create professional, ATS-friendly resumes with our AI-powered builder. 
              Choose from stunning templates and land your dream job faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="px-8 py-4 text-lg">
                    Build My Resume - Free
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>What's your experience level?</DialogTitle>
                    <DialogDescription>
                      Help us personalize your resume building experience
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Button
                      variant="outline"
                      className="h-16 text-left justify-start"
                      onClick={() => handleSelect("fresher")}
                    >
                      <div>
                        <div className="font-semibold">I'm a fresher</div>
                        <div className="text-sm text-gray-500">
                          Starting my career or have limited experience
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 text-left justify-start"
                      onClick={() => handleSelect("experienced")}
                    >
                      <div>
                        <div className="font-semibold">I'm experienced</div>
                        <div className="text-sm text-gray-500">
                          Have professional work experience
                        </div>
                      </div>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                View Templates
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mb-12">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>ATS-Friendly</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Professional Templates</span>
              </div>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <img
                src={heroIllustration}
                alt="Resume Builder Illustration"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Setting Up Your Experience...</h3>
            <p className="text-gray-600">
              Customizing templates for your experience level
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection;