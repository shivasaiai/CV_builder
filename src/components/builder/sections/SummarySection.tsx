import { useState } from 'react';
import { SectionProps } from '../types';
import { Lightbulb, Copy, RefreshCw, CheckCircle } from 'lucide-react';

const SummarySection = ({ 
  resumeData, 
  builderState,
  updateResumeData, 
  updateBuilderState,
  onNext, 
  onBack 
}: SectionProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  
  const handleSummaryChange = (value: string) => {
    updateResumeData({
      contact: {
        ...resumeData.contact,
        summary: value
      }
    });
  };

  const summaryTemplates = [
    {
      title: "Professional Experience Focus",
      template: "Experienced [Job Title] with [X] years of experience in [Industry/Field]. Proven track record of [key achievement/skill]. Skilled in [relevant skills] and passionate about [relevant area]. Seeking to leverage expertise to contribute to [target role/company type]."
    },
    {
      title: "Skills-Based Summary",
      template: "Results-driven professional with expertise in [key skills]. Strong background in [relevant area] with demonstrated ability to [key accomplishment]. Committed to [relevant value/goal] and eager to bring [specific skills] to a dynamic team."
    },
    {
      title: "Career Change Focus",
      template: "Motivated professional transitioning from [previous field] to [target field]. Bringing transferable skills in [relevant skills] and a passion for [new field interest]. Completed [relevant training/education] and ready to apply knowledge in [target role]."
    },
    {
      title: "Recent Graduate",
      template: "Recent [Degree] graduate with strong foundation in [field of study]. Demonstrated [relevant skills/qualities] through [academic projects/internships]. Eager to apply theoretical knowledge and contribute fresh perspectives to [target industry/role]."
    }
  ];

  const generatePersonalizedSummary = () => {
    const experience = resumeData.workExperiences[0];
    const education = resumeData.education;
    const skills = resumeData.skills.slice(0, 3).join(', ');
    
    let summary = "";
    
    if (experience?.jobTitle && experience?.employer) {
      // Experienced professional
      summary = `Experienced ${experience.jobTitle} with proven success at ${experience.employer}. `;
      
      if (skills) {
        summary += `Skilled in ${skills} with a track record of driving results. `;
      }
      
      if (experience.accomplishments) {
        const firstAccomplishment = experience.accomplishments.split('\n')[0]?.replace('•', '').trim();
        if (firstAccomplishment) {
          summary += `${firstAccomplishment}. `;
        }
      }
      
      summary += `Seeking to leverage expertise to contribute to organizational growth and success.`;
    } else if (education?.degree && education?.school) {
      // Recent graduate or student
      summary = `Recent ${education.degree} graduate from ${education.school}. `;
      
      if (skills) {
        summary += `Strong foundation in ${skills} `;
      }
      
      if (education.field) {
        summary += `with specialized knowledge in ${education.field}. `;
      }
      
      summary += `Eager to apply academic knowledge and contribute fresh perspectives to drive innovation and results.`;
    } else {
      // General template
      summary = `Motivated professional with strong analytical and problem-solving abilities. `;
      
      if (skills) {
        summary += `Experienced in ${skills} `;
      }
      
      summary += `with a commitment to excellence and continuous learning. Ready to contribute to team success and organizational objectives.`;
    }
    
    handleSummaryChange(summary);
  };

  const summaryTips = [
    "Keep it concise: 2-4 sentences or 50-150 words",
    "Start with your job title or profession",
    "Include years of experience if relevant",
    "Mention 2-3 key skills or achievements",
    "Tailor it to match the job description",
    "Use action words and quantifiable results",
    "Avoid personal pronouns (I, me, my)",
    "End with what you're seeking or can offer"
  ];

  const currentSummary = resumeData.contact.summary || '';

  return (
    <div className="max-w-4xl w-full mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          Write a professional summary
        </h1>
        <p className="text-xl text-gray-500">
          A compelling summary can make you stand out. We'll help you craft one that highlights your best qualities.
        </p>
      </div>

      {/* Quick Generate */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🚀 Smart Summary Generator
            </h3>
            <p className="text-blue-700">
              Let AI create a personalized summary based on your experience and skills
            </p>
          </div>
          <button
            onClick={generatePersonalizedSummary}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Generate Summary</span>
          </button>
        </div>
      </div>

      {/* Summary Editor */}
      <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
        <label className="block text-lg font-medium text-gray-900 mb-4">
          Professional Summary
        </label>
        
        <textarea
          value={currentSummary}
          onChange={(e) => handleSummaryChange(e.target.value)}
          placeholder="Write a brief summary of your professional background, key skills, and career objectives..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg transition duration-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 text-base leading-relaxed"
        />
        
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>
            {currentSummary.length} characters | {currentSummary.split(' ').filter(word => word.length > 0).length} words
          </span>
          <span className={`${currentSummary.length >= 50 && currentSummary.length <= 500 ? 'text-green-600' : 'text-orange-600'}`}>
            Recommended: 50-500 characters
          </span>
        </div>
      </div>

      {/* Templates */}
      <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          📝 Summary Templates
        </h3>
        <p className="text-gray-600 mb-6">
          Choose a template that fits your situation and customize it with your information
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaryTemplates.map((template, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTemplate === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTemplate(index)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{template.title}</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSummaryChange(template.template);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                  title="Use this template"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {template.template}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-green-900 mb-3 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2" />
          Professional Summary Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {summaryTips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-green-800">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Examples */}
      <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          ✨ Example Summaries
        </h3>
        
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-2">Marketing Manager</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              "Results-driven Marketing Manager with 5+ years of experience in digital marketing and brand management. Proven track record of increasing brand awareness by 40% and generating $2M in revenue through innovative campaigns. Skilled in SEO, social media marketing, and data analytics. Seeking to leverage expertise to drive growth for a forward-thinking company."
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-2">Software Developer</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              "Full-stack Software Developer with 3+ years of experience building scalable web applications. Proficient in React, Node.js, and Python with strong problem-solving abilities. Successfully reduced application load time by 50% and improved user engagement by 30%. Passionate about creating efficient solutions and eager to contribute to innovative projects."
            </p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-2">Recent Graduate</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              "Recent Computer Science graduate with strong foundation in software development and data structures. Completed internship at tech startup where I contributed to mobile app development serving 10,000+ users. Skilled in Java, Python, and agile methodologies. Eager to apply academic knowledge and fresh perspectives to drive innovation in software development."
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button 
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          ← Back to Skills
        </button>
        
        <button 
          onClick={onNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Continue to Finalize →
        </button>
      </div>
    </div>
  );
};

export default SummarySection; 