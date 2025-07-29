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

    // Show loading animation for 2.5 seconds
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
      <section id="home" className="min-h-screen flex items-center pt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Professional Resume & Cover Letter Tools{" "}
                <span className="text-primary">For Any Job</span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Create a job-winning resume in minutes with our easy-to-use builder.
                Stand out from the competition and land your dream job.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-lg text-muted-foreground">Professional templates designed by experts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-lg text-muted-foreground">ATS-friendly formatting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-lg text-muted-foreground">Free to start, no credit card required</span>
                </div>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Create Your Resume Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold mb-2 text-center">Who are you?</DialogTitle>
                    <DialogDescription className="mb-6 text-center">
                      Please select your professional status to get the best resume experience.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <Button
                      className="w-full py-4 text-lg bg-gradient-to-r from-primary to-blue-500 text-white rounded-lg shadow-md hover:scale-105 transition-transform"
                      onClick={() => handleSelect("fresher")}
                    >
                      🎓 I am a Fresher
                    </Button>
                    <Button
                      className="w-full py-4 text-lg bg-gradient-to-r from-primary to-green-500 text-white rounded-lg shadow-md hover:scale-105 transition-transform"
                      onClick={() => handleSelect("experienced")}
                    >
                      💼 I am an Experienced Professional
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex justify-center relative">
              {/* Cool 3D AI Resume Builder Visualization */}
              <div className="relative w-96 h-96">
                {/* Main 3D Resume Stack */}
                <div className="absolute inset-0 perspective-1000">
                  {/* Multiple Resume Layers with 3D effect */}
                  <div className="absolute inset-4 bg-white rounded-xl shadow-2xl transform rotate-3 animate-float-slow border-2 border-gray-100">
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-primary/30 rounded animate-shimmer"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/4 animate-shimmer-delay-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2 animate-shimmer-delay-2"></div>
                      <div className="mt-4 space-y-1">
                        <div className="h-1.5 bg-gray-100 rounded animate-shimmer-delay-3"></div>
                        <div className="h-1.5 bg-gray-100 rounded w-5/6 animate-shimmer-delay-4"></div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-2 bg-white rounded-xl shadow-xl transform -rotate-2 animate-float-reverse border-2 border-blue-100">
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-blue-400/30 rounded animate-shimmer-delay-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-2/3 animate-shimmer-delay-2"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/4 animate-shimmer-delay-3"></div>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-3xl transform rotate-1 animate-pulse-scale border-2 border-primary/20">
                    <div className="p-8 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-full animate-sparkle flex items-center justify-center">
                          <div className="text-lg">👤</div>
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="h-3 bg-primary/40 rounded animate-type-in"></div>
                          <div className="h-2 bg-gray-300 rounded w-2/3 animate-type-in-delay-1"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded animate-type-in-delay-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-5/6 animate-type-in-delay-3"></div>
                        <div className="h-2 bg-gray-200 rounded w-3/4 animate-type-in-delay-4"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="space-y-1">
                          <div className="h-1.5 bg-gray-100 rounded animate-type-in-delay-5"></div>
                          <div className="h-1.5 bg-gray-100 rounded w-4/5 animate-type-in-delay-6"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1.5 bg-gray-100 rounded animate-type-in-delay-7"></div>
                          <div className="h-1.5 bg-gray-100 rounded w-3/4 animate-type-in-delay-1"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Brain Visualization */}
                <div className="absolute -top-12 -right-8 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse-scale opacity-80 flex items-center justify-center">
                  <div className="text-3xl animate-sparkle">🧠</div>
                  {/* Neural Network Lines */}
                  <div className="absolute inset-0">
                    <div className="absolute top-2 left-2 w-1 h-8 bg-white/30 rounded animate-flash transform rotate-45"></div>
                    <div className="absolute top-4 right-2 w-1 h-6 bg-white/30 rounded animate-flash transform -rotate-45"></div>
                    <div className="absolute bottom-2 left-4 w-1 h-4 bg-white/30 rounded animate-flash transform rotate-12"></div>
                  </div>
                </div>

                {/* AI Robot Assistant */}
                <div className="absolute -top-8 -left-8 text-5xl animate-float-slow opacity-80">🤖</div>
                <div className="absolute -top-4 -left-4 w-16 h-1 bg-gradient-to-r from-blue-400 to-transparent rounded animate-flash"></div>

                {/* Magic Wand Effect - AI Writing */}
                <div className="absolute top-1/2 -left-16 text-4xl animate-writing-hand opacity-80">🪄</div>
                <div className="absolute top-1/2 -left-8 w-2 h-16 bg-gradient-to-r from-yellow-400 to-transparent rounded animate-flash transform -rotate-45"></div>

                {/* Floating Tech Elements */}
                <div className="absolute -top-4 -right-16 text-3xl animate-float-reverse opacity-80">⚡</div>
                <div className="absolute -bottom-8 -left-4 text-4xl animate-sparkle opacity-60">✨</div>
                <div className="absolute -bottom-4 -right-4 text-3xl animate-sparkle-delay opacity-70">🚀</div>
                <div className="absolute top-1/4 -left-12 text-2xl animate-float opacity-50">📊</div>
                <div className="absolute top-3/4 -right-12 text-2xl animate-float-reverse opacity-60">📈</div>

                {/* Success Indicators */}
                <div className="absolute -top-6 left-1/2 text-2xl animate-bounce opacity-70">🎯</div>
                <div className="absolute -bottom-6 left-1/2 text-2xl animate-bounce opacity-70" style={{ animationDelay: '0.5s' }}>🏆</div>

                {/* Holographic Display Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-primary/5 to-transparent animate-shimmer rounded-xl"></div>

                {/* Glowing Energy Orbs */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full animate-pulse-scale blur-sm"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full animate-float blur-sm"></div>
                <div className="absolute top-1/2 right-0 w-8 h-8 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full animate-sparkle blur-sm"></div>
                <div className="absolute top-1/3 left-0 w-10 h-10 bg-gradient-to-br from-green-400/30 to-teal-500/30 rounded-full animate-float-reverse blur-sm"></div>

                {/* Data Flow Lines */}
                <div className="absolute top-1/4 left-1/4 w-32 h-0.5 bg-gradient-to-r from-primary/50 to-transparent animate-flash transform rotate-12"></div>
                <div className="absolute bottom-1/4 right-1/4 w-24 h-0.5 bg-gradient-to-l from-blue-500/50 to-transparent animate-flash transform -rotate-12" style={{ animationDelay: '1s' }}></div>

                {/* AI Processing Indicators */}
                <div className="absolute top-8 right-8 flex space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>

                {/* Floating Keywords */}
                <div className="absolute -top-2 left-1/3 text-xs bg-primary/20 px-2 py-1 rounded-full animate-float opacity-70">AI-Powered</div>
                <div className="absolute -bottom-2 right-1/3 text-xs bg-blue-500/20 px-2 py-1 rounded-full animate-float-reverse opacity-70">Smart Design</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading Animation Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary/90 to-blue-600/90 flex items-center justify-center">
          <div className="text-center">
            {/* Resume Flash Animation */}
            <div className="relative mb-8">
              <div className="w-64 h-80 bg-white rounded-lg shadow-2xl mx-auto animate-pulse-scale">
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-primary/20 rounded animate-shimmer"></div>
                  <div className="h-3 bg-gray-200 rounded animate-shimmer-delay-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-shimmer-delay-2"></div>
                  <div className="space-y-2 mt-6">
                    <div className="h-2 bg-gray-200 rounded animate-shimmer-delay-3"></div>
                    <div className="h-2 bg-gray-200 rounded animate-shimmer-delay-4"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6 animate-shimmer-delay-5"></div>
                  </div>
                  <div className="space-y-2 mt-6">
                    <div className="h-2 bg-gray-200 rounded animate-shimmer-delay-6"></div>
                    <div className="h-2 bg-gray-200 rounded w-4/5 animate-shimmer-delay-7"></div>
                  </div>
                </div>
              </div>

              {/* Flash Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-flash"></div>

              {/* Sparkle Effects */}
              <div className="absolute -top-4 -right-4 w-8 h-8 text-yellow-300 animate-sparkle">✨</div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 text-blue-300 animate-sparkle-delay">⭐</div>
              <div className="absolute top-1/2 -right-6 w-4 h-4 text-purple-300 animate-sparkle-slow">💫</div>
            </div>

            {/* Loading Text */}
            <div className="text-white space-y-4">
              <h2 className="text-3xl font-bold animate-bounce">
                {selectedType === "fresher" ? "🎓 Preparing Your Fresher Resume..." : "💼 Crafting Your Professional Resume..."}
              </h2>
              <p className="text-xl opacity-90 animate-pulse">
                Getting templates ready for you!
              </p>

              {/* Progress Bar */}
              <div className="w-80 h-2 bg-white/20 rounded-full mx-auto mt-6">
                <div className="h-full bg-white rounded-full animate-progress"></div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-1/4 left-1/4 w-12 h-12 text-white/30 animate-float-slow">📄</div>
            <div className="absolute top-3/4 right-1/4 w-10 h-10 text-white/30 animate-float-reverse">📝</div>
            <div className="absolute bottom-1/4 left-1/3 w-8 h-8 text-white/30 animate-float">💼</div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection;