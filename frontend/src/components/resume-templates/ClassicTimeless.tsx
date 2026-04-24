import { format } from 'date-fns';

const ClassicTimeless = ({ contact, summary, skills, experience, education }) => {
  return (
    <div className="w-full min-h-full font-serif bg-white rounded-lg shadow-lg overflow-hidden text-sm">
      {/* Header */}
      <div className="text-center p-8 border-b border-gray-300">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{contact.firstName} {contact.lastName}</h1>
        <div className="text-gray-600 space-y-1">
          <p>{contact.city}, {contact.state}</p>
          <p>{contact.phone} | {contact.email}</p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Objective */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 text-center border-b border-gray-300 pb-2">PROFESSIONAL OBJECTIVE</h2>
          <p className="text-gray-700 text-center leading-relaxed">{summary || "Your professional summary goes here."}</p>
        </div>

        {/* Experience */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 text-center border-b border-gray-300 pb-2">PROFESSIONAL EXPERIENCE</h2>
          <div className="space-y-4">
            <div>
              <div className="text-center mb-2">
                <h3 className="font-bold text-gray-900">{experience.jobTitle || "Job Title"}</h3>
                <p className="text-gray-700 italic">{experience.employer}</p>
                <p className="text-gray-600 text-xs">
                  {experience.startDate ? format(experience.startDate, 'MMMM yyyy') : 'Start Date'} - {experience.current ? "Present" : (experience.endDate ? format(experience.endDate, 'MMMM yyyy') : 'End Date')}
                </p>
              </div>
              <ul className="space-y-1 text-gray-700">
                {(experience.accomplishments || "").split('\n').map((item, index) => 
                  item.trim() && <li key={index} className="text-center">• {item}</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 text-center border-b border-gray-300 pb-2">EDUCATION</h2>
          <div className="text-center">
            <h3 className="font-bold text-gray-900">{education.degree || "Degree"}</h3>
            <p className="text-gray-700 italic">{education.school}</p>
            <p className="text-gray-600 text-xs">{education.gradMonth} {education.gradYear}</p>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 text-center border-b border-gray-300 pb-2">CORE COMPETENCIES</h2>
          <div className="text-center">
            {skills.length > 0 ? (
              <p className="text-gray-700 leading-relaxed">
                {skills.join(' • ')}
              </p>
            ) : (
              <p className="text-gray-500">Add your skills</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassicTimeless;