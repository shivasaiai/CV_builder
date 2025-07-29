import React from 'react';
import { format } from 'date-fns';

const ContemporaryContrast = ({ contact, summary, skills, experience, education, primaryColor = '#4A5568' }) => {
  return (
    <div className="w-full min-h-full flex font-sans bg-white rounded-lg shadow-lg overflow-hidden text-sm">
      {/* Left Sidebar (Dark Gray) */}
      <div className="w-1/3 text-white p-6 flex flex-col gap-6 break-words" style={{ backgroundColor: primaryColor }}>
        <div>
          <h3 className="text-base font-semibold border-b-2 border-white/50 pb-1 mb-2">CONTACT</h3>
          <p>{contact.city}, {contact.state}</p>
          <p>{contact.phone}</p>
          <p>{contact.email}</p>
        </div>
        <div>
          <h3 className="text-base font-semibold border-b-2 border-white/50 pb-1 mb-2">SKILLS</h3>
          <ul className="list-disc list-inside">
            {skills.length > 0 ? skills.map((skill, i) => <li key={i}>{skill}</li>) : <li>Add your skills</li>}
          </ul>
        </div>
      </div>

      {/* Right Content Area (White) */}
      <div className="w-2/3 p-8 break-words">
        <h1 className="text-3xl font-extrabold tracking-wider mb-2">{contact.firstName} {contact.lastName}</h1>
        <p className="text-gray-600 mb-6">{summary || "Your professional summary goes here."}</p>
        <div>
          <h2 className="text-lg font-bold pb-1 mb-4 border-b-2" style={{ color: primaryColor, borderColor: primaryColor }}>EXPERIENCE</h2>
          <div className="mb-4">
            <h3 className="font-bold text-base">{experience.jobTitle || "Job Title"}</h3>
            <p className="text-gray-600">
              {experience.employer} | {experience.startDate ? format(experience.startDate, 'MMM yyyy') : 'Start Date'} - {experience.current ? "Present" : (experience.endDate ? format(experience.endDate, 'MMM yyyy') : 'End Date')}
            </p>
            <ul className="list-disc list-inside mt-2">
              {(experience.accomplishments || "").split('\n').map((item, index) => item.trim() && <li key={index}>{item}</li>)}
            </ul>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#4A5568] border-b-2 border-[#4A5568] pb-1 mb-4">EDUCATION</h2>
          <div>
            <h3 className="font-bold text-base">{education.degree || "Degree"}</h3>
            <p className="text-gray-600">{education.school} | {education.gradMonth} {education.gradYear}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContemporaryContrast; 