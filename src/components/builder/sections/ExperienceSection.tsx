import { useState } from 'react';
import { SectionProps } from '../types';
import { WorkExperience } from '../types';
import { Calendar, Plus, Trash2, MapPin, Building } from 'lucide-react';

const ExperienceSection = ({ 
  resumeData, 
  builderState,
  updateResumeData, 
  updateBuilderState,
  onNext, 
  onBack 
}: SectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Debug logging to see what work experience data we have
  console.log('=== ExperienceSection Debug ===');
  console.log('resumeData.workExperiences:', resumeData.workExperiences);
  console.log('currentIndex:', currentIndex);
  console.log('workExperiences length:', resumeData.workExperiences.length);
  
  const currentExperience = resumeData.workExperiences[currentIndex] || {
    id: Date.now(),
    jobTitle: '',
    employer: '',
    location: '',
    remote: false,
    startDate: null,
    endDate: null,
    current: false,
    accomplishments: ''
  };
  
  console.log('currentExperience:', currentExperience);
  console.log('Form field values:', {
    jobTitle: currentExperience.jobTitle,
    employer: currentExperience.employer,
    location: currentExperience.location,
    accomplishments: currentExperience.accomplishments
  });

  const handleExperienceChange = (field: keyof WorkExperience, value: any) => {
    const updatedExperiences = [...resumeData.workExperiences];
    updatedExperiences[currentIndex] = {
      ...updatedExperiences[currentIndex],
      [field]: value
    };
    
    updateResumeData({
      workExperiences: updatedExperiences
    });
  };

  const addNewExperience = () => {
    const newExperience: WorkExperience = {
      id: Date.now(),
      jobTitle: '',
      employer: '',
      location: '',
      remote: false,
      startDate: null,
      endDate: null,
      current: false,
      accomplishments: ''
    };
    
    updateResumeData({
      workExperiences: [...resumeData.workExperiences, newExperience]
    });
    
    setCurrentIndex(resumeData.workExperiences.length);
  };

  const removeExperience = (indexToRemove: number) => {
    if (resumeData.workExperiences.length <= 1) return;
    
    const updatedExperiences = resumeData.workExperiences.filter((_, index) => index !== indexToRemove);
    updateResumeData({
      workExperiences: updatedExperiences
    });
    
    if (currentIndex >= updatedExperiences.length) {
      setCurrentIndex(Math.max(0, updatedExperiences.length - 1));
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const parseDate = (dateString: string) => {
    return dateString ? new Date(dateString) : null;
  };

  const accomplishmentSuggestions = [
    "Increased sales by X% through implementation of new strategies",
    "Managed a team of X employees and improved productivity by X%",
    "Reduced costs by $X through process optimization",
    "Led X successful projects from conception to completion",
    "Improved customer satisfaction scores by X%",
    "Streamlined processes, resulting in X% time savings",
    "Developed and launched X new products/services",
    "Exceeded targets by X% for consecutive quarters"
  ];

  return (
    <div className="max-w-4xl w-full mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          Tell us about your work experience
        </h1>
        <p className="text-xl text-gray-500">
          Start with your most recent position. We'll help you write compelling descriptions.
        </p>
      </div>

      {/* Experience Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex space-x-2">
          {resumeData.workExperiences.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`px-4 py-2 rounded-lg border font-medium ${
                currentIndex === index
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {index === 0 ? 'Current/Recent' : `Position ${index + 1}`}
            </button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={addNewExperience}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Position</span>
          </button>
          
          {resumeData.workExperiences.length > 1 && (
            <button
              onClick={() => removeExperience(currentIndex)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      {/* Experience Form */}
      <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={currentExperience.jobTitle}
              onChange={(e) => handleExperienceChange('jobTitle', e.target.value)}
              placeholder="e.g. Marketing Manager"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg transition duration-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={currentExperience.employer}
                onChange={(e) => handleExperienceChange('employer', e.target.value)}
                placeholder="e.g. Google"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition duration-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={currentExperience.location}
                onChange={(e) => handleExperienceChange('location', e.target.value)}
                placeholder="e.g. New York, NY"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Remote Work */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remote"
              checked={currentExperience.remote}
              onChange={(e) => handleExperienceChange('remote', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="remote" className="ml-2 text-sm text-gray-700">
              This was a remote position
            </label>
          </div>
        </div>

        {/* Employment Period */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Employment Period
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={formatDate(currentExperience.startDate)}
                  onChange={(e) => handleExperienceChange('startDate', parseDate(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={currentExperience.current ? '' : formatDate(currentExperience.endDate)}
                  onChange={(e) => handleExperienceChange('endDate', parseDate(e.target.value))}
                  disabled={currentExperience.current}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                id="current"
                checked={currentExperience.current}
                onChange={(e) => handleExperienceChange('current', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="current" className="ml-2 text-sm text-gray-700">
                I currently work here
              </label>
            </div>
          </div>
        </div>

        {/* Job Description & Achievements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description & Key Achievements
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Describe your responsibilities and quantify your achievements. Use bullet points and action verbs.
          </p>
          
          <textarea
            value={currentExperience.accomplishments}
            onChange={(e) => handleExperienceChange('accomplishments', e.target.value)}
            placeholder="• Managed a team of 10 sales representatives and increased revenue by 25%
• Developed and implemented new customer acquisition strategies
• Collaborated with cross-functional teams to launch 3 new products"
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Achievement Suggestions */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Need inspiration? Try these templates:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {accomplishmentSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const currentText = currentExperience.accomplishments;
                    const newText = currentText ? `${currentText}\n• ${suggestion}` : `• ${suggestion}`;
                    handleExperienceChange('accomplishments', newText);
                  }}
                  className="text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  • {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button 
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          ← Back to Contact
        </button>
        
        <button 
          onClick={onNext}
          disabled={
            !currentExperience.jobTitle ||
            !currentExperience.employer ||
            !currentExperience.startDate ||
            (!currentExperience.current && !currentExperience.endDate)
          }
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Continue to Education →
        </button>
      </div>
    </div>
  );
};

export default ExperienceSection; 