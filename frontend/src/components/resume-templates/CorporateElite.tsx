import { format } from 'date-fns';

const CorporateElite = ({ contact, summary, skills, experience, education }) => {
  return (
    <div className="w-full min-h-full font-sans bg-white rounded-lg shadow-lg overflow-hidden text-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">{contact.firstName} {contact.lastName}</h1>
            <p className="text-slate-300 text-lg">Professional Executive</p>
          </div>
          <div className="text-right text-slate-300 space-y-1">
            <p>{contact.phone}</p>
            <p>{contact.email}</p>
            <p>{contact.city}, {contact.state}</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Executive Summary */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <div className="w-1 h-6 bg-slate-800 mr-3"></div>
            EXECUTIVE SUMMARY
          </h2>
          <p className="text-gray-700 leading-relaxed bg-slate-50 p-4 rounded">{summary || "Your professional summary goes here."}</p>
        </div>

        {/* Core Competencies */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <div className="w-1 h-6 bg-slate-800 mr-3"></div>
            CORE COMPETENCIES
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {skills.length > 0 ? skills.map((skill, i) => (
              <div key={i} className="flex items-center bg-slate-50 p-3 rounded">
                <div className="w-2 h-2 bg-slate-600 rounded-full mr-3"></div>
                <span className="font-medium text-gray-800">{skill}</span>
              </div>
            )) : <div className="col-span-2 text-gray-500 text-center py-4">Add your skills</div>}
          </div>
        </div>

        {/* Professional Experience */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <div className="w-1 h-6 bg-slate-800 mr-3"></div>
            PROFESSIONAL EXPERIENCE
          </h2>
          <div className="bg-slate-50 p-6 rounded">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{experience.jobTitle || "Job Title"}</h3>
                <p className="text-slate-700 font-medium">{experience.employer}</p>
              </div>
              <div className="text-right text-slate-600 bg-white px-3 py-1 rounded">
                <p className="font-medium">{experience.startDate ? format(experience.startDate, 'MMM yyyy') : 'Start Date'} - {experience.current ? "Present" : (experience.endDate ? format(experience.endDate, 'MMM yyyy') : 'End Date')}</p>
              </div>
            </div>
            <ul className="space-y-2 text-gray-700">
              {(experience.accomplishments || "").split('\n').map((item, index) => 
                item.trim() && <li key={index} className="flex items-start"><span className="w-2 h-2 bg-slate-400 rounded-full mr-3 mt-2 flex-shrink-0"></span><span>{item}</span></li>
              )}
            </ul>
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <div className="w-1 h-6 bg-slate-800 mr-3"></div>
            EDUCATION
          </h2>
          <div className="bg-slate-50 p-4 rounded flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900">{education.degree || "Degree"}</h3>
              <p className="text-slate-700">{education.school}</p>
            </div>
            <p className="text-slate-600 font-medium">{education.gradMonth} {education.gradYear}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateElite;