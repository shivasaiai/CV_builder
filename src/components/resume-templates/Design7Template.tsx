import { format } from 'date-fns';

const Design7Template = ({ contact, summary, skills, experience, education }) => {
  return (
    <div className="w-full min-h-full font-sans bg-white rounded-lg shadow-lg overflow-hidden text-sm">
      {/* Two-tone Header */}
      <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="flex">
          {/* Left side - Name */}
          <div className="w-2/3 p-8">
            <h1 className="text-4xl font-bold mb-2">{contact.firstName}</h1>
            <h1 className="text-4xl font-light">{contact.lastName}</h1>
            <div className="w-20 h-1 bg-white mt-4"></div>
          </div>
          {/* Right side - Contact */}
          <div className="w-1/3 bg-teal-700 p-8 flex flex-col justify-center">
            <div className="space-y-2 text-teal-100">
              <p className="text-xs">📧 {contact.email}</p>
              <p className="text-xs">📱 {contact.phone}</p>
              <p className="text-xs">📍 {contact.city}, {contact.state}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Column */}
        <div className="w-1/3 bg-gray-50 p-6 space-y-6">
          {/* Skills */}
          <div>
            <h2 className="text-lg font-bold text-teal-600 mb-4 border-b-2 border-teal-600 pb-1">SKILLS</h2>
            <div className="space-y-3">
              {skills.length > 0 ? skills.map((skill, i) => (
                <div key={i} className="relative">
                  <div className="text-gray-800 font-medium text-xs mb-1">{skill}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-teal-500 h-2 rounded-full" style={{width: `${85 + (i % 3) * 5}%`}}></div>
                  </div>
                </div>
              )) : <div className="text-gray-500">Add your skills</div>}
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-lg font-bold text-teal-600 mb-4 border-b-2 border-teal-600 pb-1">EDUCATION</h2>
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-xs">{education.degree || "Degree"}</h3>
              <p className="text-gray-600 text-xs">{education.school}</p>
              <p className="text-teal-600 text-xs font-medium">{education.gradMonth} {education.gradYear}</p>
            </div>
          </div>

          {/* Additional Section */}
          <div>
            <h2 className="text-lg font-bold text-teal-600 mb-4 border-b-2 border-teal-600 pb-1">LANGUAGES</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-800 text-xs">English</span>
                <span className="text-teal-600 text-xs">Native</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-800 text-xs">Spanish</span>
                <span className="text-teal-600 text-xs">Fluent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-2/3 p-8 space-y-6">
          {/* Profile */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-0.5 bg-teal-600 mr-3"></div>
              PROFILE
            </h2>
            <p className="text-gray-700 leading-relaxed">{summary || "Your professional summary goes here."}</p>
          </div>

          {/* Experience */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-0.5 bg-teal-600 mr-3"></div>
              EXPERIENCE
            </h2>
            <div className="space-y-4">
              <div className="relative pl-6">
                <div className="absolute left-0 top-2 w-3 h-3 bg-teal-600 rounded-full"></div>
                <div className="absolute left-1.5 top-5 w-0.5 h-16 bg-teal-200"></div>
                <div className="mb-2">
                  <h3 className="font-bold text-gray-900">{experience.jobTitle || "Job Title"}</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-teal-600 font-medium">{experience.employer}</p>
                    <span className="text-gray-500 text-xs">
                      {experience.startDate ? format(experience.startDate, 'MMM yyyy') : 'Start'} - {experience.current ? "Present" : (experience.endDate ? format(experience.endDate, 'MMM yyyy') : 'End')}
                    </span>
                  </div>
                </div>
                <ul className="space-y-1 text-gray-700">
                  {(experience.accomplishments || "").split('\n').map((item, index) => 
                    item.trim() && <li key={index} className="text-xs leading-relaxed">• {item}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Design7Template;