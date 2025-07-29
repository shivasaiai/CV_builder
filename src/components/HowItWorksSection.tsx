const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-foreground mb-4">How Can We Help You?</h2>
        <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
          Our comprehensive suite of tools will help you create the perfect resume and land your dream job
        </p>

        <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
          <div className="text-center group">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Resume Builder</h3>
            <p className="text-muted-foreground leading-relaxed">CraftmyCV's resume builder will save you time and provide expert tips every step of the way. Creating a resume has never been easier.</p>
          </div>

          <div className="text-center group">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Cover Letter Builder</h3>
            <p className="text-muted-foreground leading-relaxed">Smoothly generate a job-winning cover letter with our drag-and-drop interface and professional templates.</p>
          </div>

          <div className="text-center group">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">ATS-Friendly Templates</h3>
            <p className="text-muted-foreground leading-relaxed">Grab recruiters' attention with our collection of professional resume templates optimized for applicant tracking systems.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;