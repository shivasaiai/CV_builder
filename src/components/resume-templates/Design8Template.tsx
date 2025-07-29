import { format } from 'date-fns';

const Design8Template = ({ contact, summary, skills, experience, education }) => {
  return (
    <div className="w-full min-h-full font-sans bg-white rounded-lg shadow-lg overflow-hidden text-sm">
      {/* Circular Header Design */}
      <div className="relative bg-gradient-to-br from-rose-500 to-pink-600 text-white p-8 pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">{contact.firstName} {contact.lastName}</h1>
            <p className="text-rose-100 text-lg">Professional Specialist</p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="mt-6 flex justify-between items-center text-rose-100">
          <span>{contact.email}</span>
          <span>{contact.phone}</span>
          <span>{contact.city}, {contact.state}</span>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute -bottom-8 left-8 w-16 h-16 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-4 left-20 w-8 h-8 bg-white/20 rounded-full"></div>
        <div className="absolute -bottom-6 right-16 w-12 h-12 bg-white/15 rounded-full"></div>
      </div>

      <div className="p-8 pt-12 space-y-8">
        {/* About Me */}
        <div>
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-lg">👤</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">ABOUT ME</h2>
          </div>
          <p className="text-gray-700 leading-relaxed ml-14">{summary || "Your professional summary goes here."}</p>
        </div>

        {/* Experience */}
        <div>
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-lg">💼</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">EXPERIENCE</h2>
          </div>
          <div className="ml-14 space-y-4">
            <div className="relative">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{experience.jobTitle || "Job Title"}</h3>
                  <p className="text-rose-600 font-medium">{experience.employer}</p>
                </div>
                <div className="text-right">
                  <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-medium">
                    {experience.startDate ? format(experience.startDate, 'MMM yyyy') : 'Start'} - {experience.current ? "Present" : (experience.endDate ? format(experience.endDate, 'MMM yyyy') : 'End')}
                  </span>
                </div>
              </div>
              <ul className="space-y-2 text-gray-700">
                {(experience.accomplishments || "").split('\n').map((item, index) => 
                  item.trim() && <li key={index} className="flex items-start"><span className="w-2 h-2 bg-rose-400 rounded-full mr-3 mt-2 flex-shrink-0"></span><span>{item}</span></li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Skills & Education Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Skills */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-lg">⚡</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">SKILLS</h2>
            </div>
            <div className="ml-14 space-y-3">
              {skills.length > 0 ? skills.map((skill, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-3 h-3 bg-rose-400 rounded-full mr-3"></div>
                  <span className="text-gray-700 font-medium">{skill}</span>
                </div>
              )) : <div className="text-gray-500">Add your skills</div>}
            </div>
          </div>

          {/* Education */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-lg">🎓</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">EDUCATION</h2>
            </div>
            <div className="ml-14">
              <h3 className="font-bold text-gray-900">{education.degree || "Degree"}</h3>
              <p className="text-rose-600 font-medium">{education.school}</p>
              <p className="text-gray-600">{education.gradMonth} {education.gradYear}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Design8Template;