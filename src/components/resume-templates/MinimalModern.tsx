import { format } from 'date-fns';

const MinimalModern = ({ contact, summary, skills, experience, education }) => {
  return (
    <div className="w-full min-h-full font-sans bg-white rounded-lg shadow-lg overflow-hidden text-sm">
      {/* Header */}
      <div className="p-8 border-b-4 border-blue-600">
        <h1 className="text-3xl font-light text-gray-900 mb-2">{contact.firstName} <span className="font-bold">{contact.lastName}</span></h1>
        <div className="flex flex-wrap gap-4 text-gray-600">
          <span>{contact.phone}</span>
          <span>{contact.email}</span>
          <span>{contact.city}, {contact.state}</span>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Summary */}
        <div>
          <h2 className="text-lg font-bold text-blue-600 mb-3">PROFESSIONAL SUMMARY</h2>
          <p className="text-gray-700 leading-relaxed">{summary || "Your professional summary goes here."}</p>
        </div>

        {/* Experience */}
        <div>
          <h2 className="text-lg font-bold text-blue-600 mb-3">EXPERIENCE</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-600 pl-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900">{experience.jobTitle || "Job Title"}</h3>
                <span className="text-gray-500 text-xs">
                  {experience.startDate ? format(experience.startDate, 'MMM yyyy') : 'Start Date'} - {experience.current ? "Present" : (experience.endDate ? format(experience.endDate, 'MMM yyyy') : 'End Date')}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{experience.employer}</p>
              <ul className="space-y-1 text-gray-700">
                {(experience.accomplishments || "").split('\n').map((item, index) => 
                  item.trim() && <li key={index} className="text-xs leading-relaxed">• {item}</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-lg font-bold text-blue-600 mb-3">SKILLS</h2>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                {skill}
              </span>
            )) : <span className="text-gray-500">Add your skills</span>}
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-lg font-bold text-blue-600 mb-3">EDUCATION</h2>
          <div className="border-l-4 border-blue-600 pl-4">
            <h3 className="font-bold text-gray-900">{education.degree || "Degree"}</h3>
            <p className="text-gray-600">{education.school}</p>
            <p className="text-gray-500 text-xs">{education.gradMonth} {education.gradYear}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalModern;