import { SectionProps } from '../types';
import { Education } from '../types';
import { GraduationCap, MapPin, Calendar, Award } from 'lucide-react';

const EducationSection = ({ 
  resumeData, 
  builderState,
  updateResumeData, 
  updateBuilderState,
  onNext, 
  onBack 
}: SectionProps) => {
  const education = resumeData.education;

  const handleEducationChange = (field: keyof Education, value: string) => {
    updateResumeData({
      education: {
        ...education,
        [field]: value
      }
    });
  };

  const degreeOptions = [
    "High School Diploma",
    "Associate of Arts (AA)",
    "Associate of Science (AS)",
    "Associate of Applied Science (AAS)",
    "Bachelor of Arts (BA)",
    "Bachelor of Science (BS)",
    "Bachelor of Business Administration (BBA)",
    "Bachelor of Engineering (BE)",
    "Bachelor of Technology (BTech)",
    "Master of Arts (MA)",
    "Master of Science (MS)",
    "Master of Business Administration (MBA)",
    "Master of Engineering (ME)",
    "Doctor of Philosophy (PhD)",
    "Doctor of Medicine (MD)",
    "Juris Doctor (JD)",
    "Other"
  ];

  const fieldSuggestions = [
    "Computer Science", "Business Administration", "Engineering", "Marketing",
    "Psychology", "Biology", "Chemistry", "Physics", "Mathematics",
    "English Literature", "Communications", "Finance", "Accounting",
    "Economics", "Political Science", "Sociology", "History"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 50}, (_, i) => currentYear - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="max-w-4xl w-full mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          Tell us about your education
        </h1>
        <p className="text-xl text-gray-500">
          Include your most recent or highest level of education first.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Degree */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Degree *
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={education.degree}
                onChange={(e) => handleEducationChange('degree', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select your degree</option>
                {degreeOptions.map((degree) => (
                  <option key={degree} value={degree}>
                    {degree}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Field of Study */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field of Study
            </label>
            <input
              type="text"
              value={education.field}
              onChange={(e) => handleEducationChange('field', e.target.value)}
              placeholder="e.g. Computer Science"
              list="field-suggestions"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <datalist id="field-suggestions">
              {fieldSuggestions.map((field) => (
                <option key={field} value={field} />
              ))}
            </datalist>
          </div>

          {/* School Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School Name *
            </label>
            <input
              type="text"
              value={education.school}
              onChange={(e) => handleEducationChange('school', e.target.value)}
              placeholder="e.g. Stanford University"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
                value={education.location}
                onChange={(e) => handleEducationChange('location', e.target.value)}
                placeholder="e.g. Stanford, CA"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Graduation Date */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Graduation Date
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Month</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={education.gradMonth}
                  onChange={(e) => handleEducationChange('gradMonth', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select month</option>
                  {months.map((month, index) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Year</label>
              <select
                value={education.gradYear}
                onChange={(e) => handleEducationChange('gradYear', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select year</option>
                {years.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Additional Information (Optional)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GPA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GPA
              </label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="3.8 / 4.0"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Only include if 3.5 or higher</p>
            </div>

            {/* Honors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Honors & Awards
              </label>
              <input
                type="text"
                placeholder="e.g. Magna Cum Laude, Dean's List"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Relevant Coursework */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relevant Coursework
            </label>
            <textarea
              placeholder="List relevant courses that relate to your target job (separate with commas)
e.g. Data Structures, Machine Learning, Database Systems, Software Engineering"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Activities & Organizations */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activities & Organizations
            </label>
            <textarea
              placeholder="Include clubs, organizations, leadership positions, or extracurricular activities
e.g. Student Government President, Computer Science Club Member, Debate Team Captain"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Add More Education */}
        <div className="mt-6 pt-6 border-t">
          <button className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">
            + Add Another Degree or Certification
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-blue-900 mb-2">💡 Education Tips</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• List your most recent or highest degree first</li>
          <li>• Include GPA only if it's 3.5 or higher</li>
          <li>• Add relevant coursework if you're a recent graduate</li>
          <li>• Include honors, awards, and leadership positions</li>
          <li>• For high school: only include if it's your highest education level</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button 
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          ← Back to Experience
        </button>
        
        <button 
          onClick={onNext}
          disabled={!education.school || !education.degree}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Continue to Skills →
        </button>
      </div>
    </div>
  );
};

export default EducationSection; 