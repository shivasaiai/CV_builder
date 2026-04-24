import { format } from 'date-fns';

interface ModernMinimalProps {
  contact: any;
  summary: string;
  skills: string[];
  experience: any;
  education: any;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
}

const ModernMinimal = ({ contact, summary, skills, experience, education, colors = {} }: ModernMinimalProps) => {
  // Handle both single experience object (legacy) and array of experiences (new)
  const experiences = Array.isArray(experience) ? experience : [experience].filter(Boolean);
  // Default colors with fallback to original template colors
  const templateColors = {
    primary: colors.primary || '#1F2937',
    secondary: colors.secondary || '#6B7280',
    accent: colors.accent || '#374151',
    background: colors.background || '#FFFFFF',
    text: colors.text || '#111827'
  };
  return (
    <div className="w-full min-h-full font-sans bg-white rounded-lg shadow-lg overflow-hidden text-sm">
      {/* Minimal Header */}
      <div className="p-8 pb-6">
        <h1 className="text-4xl font-extralight text-gray-900 mb-1">
          {contact.firstName} <span className="font-normal">{contact.lastName}</span>
        </h1>
        <div className="w-16 h-0.5 bg-gray-900 mb-4"></div>
        <div className="text-gray-600 space-y-1">
          <p>{contact.email} • {contact.phone}</p>
          <p>{contact.city}, {contact.state}</p>
        </div>
      </div>

      <div className="px-8 pb-8 space-y-8">
        {/* Summary */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-widest">Profile</h2>
          <p className="text-gray-700 leading-relaxed">{summary || "Your professional summary goes here."}</p>
        </div>

        {/* Experience */}
        <div>
          <h2 className="text-sm font-bold mb-4 uppercase tracking-widest" style={{ color: templateColors.primary }}>Experience</h2>
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-lg font-light" style={{ color: templateColors.text }}>{exp.jobTitle || "Job Title"}</h3>
                  <span className="text-xs" style={{ color: templateColors.secondary }}>
                    {exp.startDate ? format(exp.startDate, 'yyyy') : 'Start'} - {exp.current ? "Present" : (exp.endDate ? format(exp.endDate, 'yyyy') : 'End')}
                  </span>
                </div>
                <p className="mb-3 font-medium" style={{ color: templateColors.accent }}>{exp.employer}</p>
                <div className="space-y-2" style={{ color: templateColors.text }}>
                  {(exp.accomplishments || "").split('\n').map((item: string, itemIndex: number) =>
                    item.trim() && <p key={itemIndex} className="leading-relaxed">— {item}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-widest">Skills</h2>
          <div className="space-y-2">
            {skills.length > 0 ? skills.map((skill: string, i: number) => (
              <div key={i} className="inline-block mr-4 mb-2">
                <span className="text-gray-700">{skill}</span>
                {i < skills.length - 1 && <span className="text-gray-400 ml-4">•</span>}
              </div>
            )) : <span className="text-gray-500">Add your skills</span>}
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Education</h2>
          <div className="flex justify-between items-baseline">
            <div>
              <h3 className="text-lg font-light text-gray-900">{education.degree || "Degree"}</h3>
              <p className="text-gray-600 font-medium">{education.school}</p>
            </div>
            <span className="text-gray-500 text-xs">{education.gradYear}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernMinimal;