import { format } from 'date-fns';

const CreativeEdge = ({ contact, summary, skills, experience, education }) => {
  return (
    <div className="w-full min-h-full font-sans bg-white rounded-lg shadow-lg overflow-hidden text-sm">
      {/* Diagonal Header */}
      <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8 pb-16">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">{contact.firstName} {contact.lastName}</h1>
          <p className="text-emerald-100 text-lg mb-4">Creative Professional</p>
          <div className="flex flex-wrap gap-4 text-emerald-100">
            <span>📧 {contact.email}</span>
            <span>📱 {contact.phone}</span>
            <span>📍 {contact.city}, {contact.state}</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-8 bg-white transform -skew-y-1 origin-bottom-left"></div>
      </div>

      <div className="p-8 pt-4 space-y-6">
        {/* Summary with Creative Border */}
        <div>
          <h2 className="text-xl font-bold text-emerald-600 mb-3 relative">
            ABOUT ME
            <div className="absolute -bottom-1 left-0 w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded"></div>
          </h2>
          <div className="relative">
            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-500 rounded"></div>
            <p className="text-gray-700 leading-relaxed pl-6">{summary || "Your professional summary goes here."}</p>
          </div>
        </div>

        {/* Skills with Creative Layout */}
        <div>
          <h2 className="text-xl font-bold text-emerald-600 mb-3 relative">
            EXPERTISE
            <div className="absolute -bottom-1 left-0 w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded"></div>
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? skills.map((skill, i) => (
              <div key={i} className="relative group">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-xs font-medium shadow-md transform hover:scale-105 transition-transform">
                  {skill}
                </div>
              </div>
            )) : <div className="text-gray-500">Add your skills</div>}
          </div>
        </div>

        {/* Experience with Timeline */}
        <div>
          <h2 className="text-xl font-bold text-emerald-600 mb-3 relative">
            EXPERIENCE
            <div className="absolute -bottom-1 left-0 w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded"></div>
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-0 w-0.5 h-full bg-gradient-to-b from-emerald-300 to-teal-300"></div>
            <div className="space-y-6">
              <div className="relative pl-12">
                <div className="absolute left-2 top-2 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white shadow-md"></div>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border-l-4 border-emerald-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{experience.jobTitle || "Job Title"}</h3>
                      <p className="text-emerald-600 font-medium">{experience.employer}</p>
                    </div>
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {experience.startDate ? format(experience.startDate, 'MMM yyyy') : 'Start'} - {experience.current ? "Now" : (experience.endDate ? format(experience.endDate, 'MMM yyyy') : 'End')}
                    </span>
                  </div>
                  <ul className="space-y-1 text-gray-700">
                    {(experience.accomplishments || "").split('\n').map((item, index) => 
                      item.trim() && <li key={index} className="flex items-start text-xs"><span className="text-emerald-500 mr-2">▸</span><span>{item}</span></li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-xl font-bold text-emerald-600 mb-3 relative">
            EDUCATION
            <div className="absolute -bottom-1 left-0 w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded"></div>
          </h2>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">{education.degree || "Degree"}</h3>
                <p className="text-emerald-600">{education.school}</p>
              </div>
              <div className="text-right">
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {education.gradMonth} {education.gradYear}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeEdge;