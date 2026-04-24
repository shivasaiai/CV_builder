import React from 'react';
import { format } from 'date-fns';

const CreativeFlare = ({ contact, summary, skills, experience, education, primaryColor = '#2C5282' }) => {
  // Create a lighter version of the primary color for backgrounds
  const lightColor = primaryColor + '20'; // Adding transparency
  return (
    <div className="w-full min-h-full flex font-sans bg-white rounded-lg shadow-lg overflow-hidden text-sm">
      {/* Left Sidebar (Light Blue) */}
      <div className="w-1/3 p-6 flex flex-col gap-6 break-words" style={{ backgroundColor: lightColor }}>
        <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-wider" style={{ color: primaryColor }}>{contact.firstName} {contact.lastName}</h1>
        </div>
        <div>
          <h3 className="text-base font-semibold pb-1 mb-2 border-b-2" style={{ color: primaryColor, borderColor: primaryColor + '80' }}>CONTACT</h3>
          <p className="text-gray-700">{contact.city}, {contact.state}</p>
          <p className="text-gray-700">{contact.phone}</p>
          <p className="text-gray-700">{contact.email}</p>
        </div>
        <div>
          <h3 className="text-base font-semibold pb-1 mb-2 border-b-2" style={{ color: primaryColor, borderColor: primaryColor + '80' }}>SKILLS</h3>
          <ul className="list-disc list-inside text-gray-700">
            {skills.length > 0 ? skills.map((skill, i) => <li key={i}>{skill}</li>) : <li>Add your skills</li>}
          </ul>
        </div>
        <div>
          <h3 className="text-base font-semibold pb-1 mb-2 border-b-2" style={{ color: primaryColor, borderColor: primaryColor + '80' }}>EDUCATION</h3>
          <div>
            <h4 className="font-bold text-gray-800 text-base">{education.degree || "Degree"}</h4>
            <p className="text-gray-600">{education.school}</p>
            <p className="text-gray-600">{education.gradMonth} {education.gradYear}</p>
          </div>
        </div>
      </div>

      {/* Right Content Area (White with blue curve) */}
      <div className="w-2/3 p-8 relative break-words">
        <div className="absolute top-0 right-0 h-full w-1/4" style={{ backgroundColor: lightColor, borderTopLeftRadius: '50% 100px', borderBottomLeftRadius: '50% 100px' }}></div>
        <div className="relative z-10">
          <div>
            <h2 className="text-lg font-bold pb-1 mb-4 border-b-2" style={{ color: primaryColor, borderColor: primaryColor + '80' }}>SUMMARY</h2>
            <p className="text-gray-700 mb-6">{summary || "Your professional summary goes here."}</p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#2C5282] border-b-2 border-[#2C5282]/50 pb-1 mb-4">EXPERIENCE</h2>
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 text-base">{experience.jobTitle || "Job Title"}</h3>
              <p className="text-gray-600">
                {experience.employer} | {experience.startDate ? format(experience.startDate, 'MMM yyyy') : 'Start Date'} - {experience.current ? "Present" : (experience.endDate ? format(experience.endDate, 'MMM yyyy') : 'End Date')}
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-700">
                {(experience.accomplishments || "").split('\n').map((item, index) => item.trim() && <li key={index}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeFlare; 