import { format } from 'date-fns';

const ExecutiveProfessional = ({ contact, summary, skills, experience, education, primaryColor = '#1f2937' }) => {
  return (
    <div className="w-full min-h-full font-serif bg-white rounded-lg shadow-lg overflow-hidden text-sm">
      {/* Header */}
      <div className="text-white p-8" style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)` }}>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">{contact.firstName} {contact.lastName}</h1>
          <div className="flex justify-center items-center space-x-6 text-gray-300">
            <span>{contact.phone}</span>
            <span>•</span>
            <span>{contact.email}</span>
            <span>•</span>
            <span>{contact.city}, {contact.state}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-8 space-y-8">
        {/* Professional Summary */}
        <div>
          <h2 className="text-xl font-bold mb-3 border-b-2 pb-1" style={{ color: primaryColor, borderColor: primaryColor }}>EXECUTIVE SUMMARY</h2>
          <p className="text-gray-700 leading-relaxed">{summary || "Your professional summary goes here."}</p>
        </div>

        {/* Core Competencies */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-900 pb-1">CORE COMPETENCIES</h2>
          <div className="grid grid-cols-3 gap-4">
            {skills.length > 0 ? skills.map((skill, i) => (
              <div key={i} className="bg-gray-100 px-3 py-2 rounded text-center font-medium text-gray-800">
                {skill}
              </div>
            )) : <div className="col-span-3 text-gray-500">Add your skills</div>}
          </div>
        </div>

        {/* Professional Experience */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-900 pb-1">PROFESSIONAL EXPERIENCE</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{experience.jobTitle || "Job Title"}</h3>
                  <p className="text-gray-700 font-medium">{experience.employer}</p>
                </div>
                <div className="text-right text-gray-600">
                  <p>{experience.startDate ? format(experience.startDate, 'MMM yyyy') : 'Start Date'} - {experience.current ? "Present" : (experience.endDate ? format(experience.endDate, 'MMM yyyy') : 'End Date')}</p>
                </div>
              </div>
              <ul className="space-y-1 text-gray-700">
                {(experience.accomplishments || "").split('\n').map((item, index) =>
                  item.trim() && <li key={index} className="flex items-start"><span className="mr-2">•</span><span>{item}</span></li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-900 pb-1">EDUCATION</h2>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900">{education.degree || "Degree"}</h3>
              <p className="text-gray-700">{education.school}</p>
            </div>
            <p className="text-gray-600">{education.gradMonth} {education.gradYear}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveProfessional;