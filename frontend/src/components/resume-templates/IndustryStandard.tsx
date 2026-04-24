import { format } from 'date-fns';

const IndustryStandard = ({ contact, summary, skills, experience, education }) => {
  return (
    <div className="w-full min-h-full font-sans bg-white rounded-lg shadow-lg overflow-hidden text-sm">
      {/* Standard Header */}
      <div className="text-center p-8 border-b-2 border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{contact.firstName} {contact.lastName}</h1>
        <div className="text-gray-600 flex justify-center items-center space-x-4">
          <span>{contact.phone}</span>
          <span>|</span>
          <span>{contact.email}</span>
          <span>|</span>
          <span>{contact.city}, {contact.state}</span>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Summary */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Summary</h2>
          <p className="text-gray-700 leading-relaxed">{summary || "Your professional summary goes here."}</p>
        </div>

        {/* Experience */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Experience</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="font-bold text-gray-900">{experience.jobTitle || "Job Title"}</h3>
                  <p className="text-gray-700">{experience.employer}</p>
                </div>
                <p className="text-gray-600 text-right">
                  {experience.startDate ? format(experience.startDate, 'MM/yyyy') : 'Start'} - {experience.current ? "Present" : (experience.endDate ? format(experience.endDate, 'MM/yyyy') : 'End')}
                </p>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                {(experience.accomplishments || "").split('\n').map((item, index) => 
                  item.trim() && <li key={index}>{item}</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Education</h2>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900">{education.degree || "Degree"}</h3>
              <p className="text-gray-700">{education.school}</p>
            </div>
            <p className="text-gray-600">{education.gradMonth} {education.gradYear}</p>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Skills</h2>
          <div className="text-gray-700">
            {skills.length > 0 ? (
              <p>{skills.join(', ')}</p>
            ) : (
              <p className="text-gray-500">Add your skills</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryStandard;