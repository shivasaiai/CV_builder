import { useState } from 'react';
import { SectionProps } from '../types';
import { Plus, X, Search, Star } from 'lucide-react';

const SkillsSection = ({ 
  resumeData, 
  builderState,
  updateResumeData, 
  updateBuilderState,
  onNext, 
  onBack 
}: SectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Technical');
  
  const skillCategories = {
    'Technical': [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'MongoDB', 'AWS',
      'Docker', 'Git', 'TypeScript', 'Angular', 'Vue.js', 'PHP', 'C++', 'C#',
      'Ruby', 'Go', 'Swift', 'Kotlin', 'Flutter', 'React Native', 'Redux',
      'GraphQL', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'Kubernetes'
    ],
    'Software': [
      'Microsoft Office', 'Excel', 'PowerPoint', 'Word', 'Adobe Photoshop',
      'Adobe Illustrator', 'Figma', 'Sketch', 'AutoCAD', 'Salesforce',
      'HubSpot', 'Slack', 'Trello', 'Asana', 'Jira', 'Confluence',
      'Google Analytics', 'Google Ads', 'Facebook Ads', 'Mailchimp'
    ],
    'Languages': [
      'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Korean',
      'Italian', 'Portuguese', 'Russian', 'Arabic', 'Hindi', 'Dutch'
    ],
    'Soft Skills': [
      'Leadership', 'Communication', 'Problem Solving', 'Team Work', 'Project Management',
      'Time Management', 'Critical Thinking', 'Adaptability', 'Creativity',
      'Public Speaking', 'Negotiation', 'Customer Service', 'Sales',
      'Training', 'Mentoring', 'Conflict Resolution', 'Strategic Planning'
    ],
    'Industry': [
      'Digital Marketing', 'SEO', 'SEM', 'Content Marketing', 'Social Media Marketing',
      'Email Marketing', 'Brand Management', 'Market Research', 'Data Analysis',
      'Financial Analysis', 'Accounting', 'Budgeting', 'Risk Management',
      'Compliance', 'Quality Assurance', 'Supply Chain', 'Logistics'
    ]
  };

  const addSkill = (skill: string) => {
    if (!resumeData.skills.includes(skill)) {
      updateResumeData({
        skills: [...resumeData.skills, skill]
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateResumeData({
      skills: resumeData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addCustomSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !resumeData.skills.includes(trimmedSkill)) {
      addSkill(trimmedSkill);
      setSearchTerm('');
    }
  };

  const filteredSkills = skillCategories[activeCategory as keyof typeof skillCategories]
    .filter(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !resumeData.skills.includes(skill)
    );

  const getSkillLevel = (skill: string) => {
    // This could be extended to track skill levels
    return 'Intermediate';
  };

  return (
    <div className="max-w-4xl w-full mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          What skills should we add?
        </h1>
        <p className="text-xl text-gray-500">
          Add skills that are relevant to your target job. You can always edit these later.
        </p>
      </div>

      {/* Current Skills */}
      {resumeData.skills.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Your Skills ({resumeData.skills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm"
              >
                <span>{skill}</span>
                <button
                  onClick={() => removeSkill(skill)}
                  className="hover:text-blue-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Categories */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.keys(skillCategories).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomSkill(searchTerm)}
            placeholder={`Search ${activeCategory.toLowerCase()} skills or add your own...`}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => addCustomSkill(searchTerm)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Skill Suggestions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {filteredSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => addSkill(skill)}
              className="flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <span className="text-sm text-gray-700 group-hover:text-blue-700">
                {skill}
              </span>
              <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
            </button>
          ))}
        </div>

        {searchTerm && filteredSkills.length === 0 && !resumeData.skills.includes(searchTerm.trim()) && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              No skills found matching "{searchTerm}"
            </p>
            <button
              onClick={() => addCustomSkill(searchTerm)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add "{searchTerm.trim()}" as custom skill</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Add Recommendations */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-green-900 mb-3">
          🚀 Recommended for Your Experience Level
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['Communication', 'Team Work', 'Problem Solving', 'Leadership', 'Time Management', 'Microsoft Office', 'Project Management', 'Customer Service']
            .filter(skill => !resumeData.skills.includes(skill))
            .slice(0, 8)
            .map((skill) => (
              <button
                key={skill}
                onClick={() => addSkill(skill)}
                className="flex items-center space-x-2 p-2 bg-white border border-green-300 rounded text-sm text-green-700 hover:bg-green-100 transition-colors"
              >
                <Star className="w-4 h-4" />
                <span>{skill}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Skills Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-blue-900 mb-2">💡 Skills Tips</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Include 6-12 relevant skills for your target job</li>
          <li>• Mix technical skills with soft skills</li>
          <li>• Match skills mentioned in job descriptions</li>
          <li>• Be honest about your skill levels</li>
          <li>• Prioritize skills most relevant to your industry</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button 
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          ← Back to Education
        </button>
        
        <button 
          onClick={onNext}
          disabled={resumeData.skills.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Continue to Summary →
        </button>
      </div>
    </div>
  );
};

export default SkillsSection; 