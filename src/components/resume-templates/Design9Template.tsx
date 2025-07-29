import { format } from 'date-fns';

const Design9Template = ({ contact, summary, skills, experience, education }) => {
  return (
    <div className="w-full min-h-full font-sans bg-white rounded-lg shadow-lg overflow-hidden text-sm">
      {/* Geometric Header */}
      <div className="relative">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">{contact.firstName} {contact.lastName}</h1>
              <p className="text-violet-200 text-xl">Creative Professional</p>
            </div>
            <div className="text-right text-violet-200 space-y-1">
              <p>{contact.phone}</p>
              <p>{contact.email}</p>
              <p>{contact.city}, {contact.state}</p>
            </div>
          </div>
        </div>
        
        {/* Geometric shapes */}
        <div className="absolute -bottom-4 left-0 w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-t-[40px] border-t-violet-600"></div>
        <div className="absolute -bottom-2 right-8 w-8 h-8 bg-violet-500 transform rotate-45"></div>
        <div className="absolute -bottom-1 right-20 w-4 h-4 bg-purple-400 rounded-full"></div>
      </div>

      <div className="p-8 pt-12 space-y-8">
        {/* Summary with geometric accent */}
        <div className="relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-violet-600 to-purple-600 rounded"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-violet-600 mr-4 transform rotate-45"></div>
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-gray-700 leading-relaxed ml-10">{summary || "Your professional summary goes here."}</p>
        </div>

        {/* Experience with timeline */}
        <div className="relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-violet-600 to-purple-600 rounded"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="w-6 h-6 bg-violet-600 mr-4 transform rotate-45"></div>
            WORK EXPERIENCE
          </h2>
          <div className="ml-10 relative">
            <div className="absolute left-0 top-0 w-0.5 h-full bg-violet-200"></div>
            <div className="relative pl-8">
              <div className="absolute -left-2 top-2 w-4 h-4 bg-violet-600 transform rotate-45"></div>
              <div className="bg-violet-50 p-4 rounded-lg border-l-4 border-violet-600">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{experience.jobTitle || "Job Title"}</h3>
                    <p className="text-violet-600 font-medium">{experience.employer}</p>
                  </div>
                  <div className="bg-violet-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {experience.startDate ? format(experience.startDate, 'MMM yyyy') : 'Start'} - {experience.current ? "Now" : (experience.endDate ? format(experience.endDate, 'MMM yyyy') : 'End')}
                  </div>
                </div>
                <ul className="space-y-2 text-gray-700">
                  {(experience.accomplishments || "").split('\n').map((item, index) => 
                    item.trim() && <li key={index} className="flex items-start"><span className="text-violet-600 mr-2 font-bold">▸</span><span>{item}</span></li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Skills and Education in cards */}
        <div className="grid grid-cols-2 gap-6">
          {/* Skills Card */}
          <div className="relative">
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-violet-600 transform rotate-45"></div>
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-lg border border-violet-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-3 h-3 bg-violet-600 mr-3 rounded-full"></div>
                SKILLS
              </h2>
              <div className="space-y-3">
                {skills.length > 0 ? skills.map((skill, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">{skill}</span>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, index) => (
                        <div key={index} className={`w-2 h-2 rounded-full ${index < 4 ? 'bg-violet-600' : 'bg-gray-300'}`}></div>
                      ))}
                    </div>
                  </div>
                )) : <div className="text-gray-500">Add your skills</div>}
              </div>
            </div>
          </div>

          {/* Education Card */}
          <div className="relative">
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-600 rounded-full"></div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-3 h-3 bg-purple-600 mr-3 rounded-full"></div>
                EDUCATION
              </h2>
              <div>
                <h3 className="font-bold text-gray-900">{education.degree || "Degree"}</h3>
                <p className="text-purple-600 font-medium">{education.school}</p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                  <span className="text-gray-600">{education.gradMonth} {education.gradYear}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Design9Template;