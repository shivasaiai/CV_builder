import { format } from 'date-fns';

const TechFocused = ({ contact, summary, skills, experience, education, colors = {} }) => {
  // Handle both single experience object (legacy) and array of experiences (new)
  const experiences = Array.isArray(experience) ? experience : [experience].filter(Boolean);
  // Default colors with fallback to original template colors
  const templateColors = {
    primary: colors.primary || '#1F2937',
    secondary: colors.secondary || '#10B981',
    accent: colors.accent || '#059669',
    background: colors.background || '#FFFFFF',
    text: colors.text || '#111827'
  };
  return (
    <div className="w-full min-h-full font-mono rounded-lg shadow-lg overflow-hidden text-sm" style={{ backgroundColor: templateColors.background }}>
      {/* Header */}
      <div className="p-6" style={{ backgroundColor: templateColors.primary, color: templateColors.secondary }}>
        <div className="border p-4" style={{ borderColor: templateColors.secondary }}>
          <h1 className="text-2xl font-bold mb-2">&gt; {contact.firstName}_{contact.lastName}</h1>
          <div className="space-y-1" style={{ color: templateColors.accent }}>
            <p>📧 {contact.email}</p>
            <p>📱 {contact.phone}</p>
            <p>📍 {contact.city}, {contact.state}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div>
          <h2 className="text-lg font-bold mb-3 border-l-4 pl-3" style={{ color: templateColors.text, borderColor: templateColors.secondary }}>// ABOUT_ME</h2>
          <div className="p-4 rounded border-l-4" style={{ backgroundColor: `${templateColors.primary}10`, borderColor: templateColors.accent }}>
            <p style={{ color: templateColors.text }}>{summary || "Your professional summary goes here."}</p>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-lg font-bold mb-3 border-l-4 pl-3" style={{ color: templateColors.text, borderColor: templateColors.secondary }}>// TECH_STACK</h2>
          <div className="p-4 rounded" style={{ backgroundColor: templateColors.primary, color: templateColors.secondary }}>
            <div className="grid grid-cols-2 gap-2">
              {skills.length > 0 ? skills.map((skill, i) => (
                <div key={i} className="flex items-center">
                  <span className="mr-2" style={{ color: templateColors.accent }}>$</span>
                  <span>{skill}</span>
                </div>
              )) : <div style={{ color: templateColors.accent }}>// Add your skills</div>}
            </div>
          </div>
        </div>

        {/* Experience */}
        <div>
          <h2 className="text-lg font-bold mb-3 border-l-4 pl-3" style={{ color: templateColors.text, borderColor: templateColors.secondary }}>// WORK_HISTORY</h2>
          <div className="space-y-4">
            <div className="border rounded p-4" style={{ borderColor: templateColors.accent }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold" style={{ color: templateColors.text }}>function {experience.jobTitle?.replace(/\s+/g, '') || "JobTitle"}() {`{`}</h3>
                  <p className="ml-4" style={{ color: templateColors.secondary }}>// {experience.employer}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded" style={{ color: templateColors.secondary, backgroundColor: `${templateColors.accent}20` }}>
                  {experience.startDate ? format(experience.startDate, 'yyyy.MM') : 'start'} - {experience.current ? "current" : (experience.endDate ? format(experience.endDate, 'yyyy.MM') : 'end')}
                </span>
              </div>
              <div className="ml-4 space-y-1" style={{ color: templateColors.text }}>
                {(experience.accomplishments || "").split('\n').map((item, index) => 
                  item.trim() && <p key={index} className="text-xs">• {item}</p>
                )}
              </div>
              <p className="mt-2" style={{ color: templateColors.text }}>{`}`}</p>
            </div>
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-lg font-bold mb-3 border-l-4 pl-3" style={{ color: templateColors.text, borderColor: templateColors.secondary }}>// EDUCATION</h2>
          <div className="p-4 rounded border" style={{ backgroundColor: `${templateColors.primary}10`, borderColor: templateColors.accent }}>
            <h3 className="font-bold" style={{ color: templateColors.text }}>class {education.degree?.replace(/\s+/g, '') || "Degree"} {`{`}</h3>
            <p className="ml-4" style={{ color: templateColors.secondary }}>institution: "{education.school}"</p>
            <p className="ml-4" style={{ color: templateColors.secondary }}>graduated: "{education.gradMonth} {education.gradYear}"</p>
            <p style={{ color: templateColors.text }}>{`}`}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechFocused;