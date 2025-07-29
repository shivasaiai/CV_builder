import React from 'react';
import { format } from 'date-fns';

const TranquilChroma = ({ contact, summary, skills, experience, education, primaryColor = '#1A2E4C' }) => {
  return (
    <div className="w-full min-h-full font-sans bg-white rounded-lg shadow-lg overflow-hidden text-sm">
      {/* Header (Dark Blue) */}
      <div className="text-white p-6 break-words" style={{ backgroundColor: primaryColor }}>
        <h1 className="text-3xl font-bold tracking-wider">{contact.firstName} {contact.lastName}</h1>
        <div className="flex justify-between mt-2 flex-wrap">
          <span>{contact.phone}</span>
          <span>{contact.email}</span>
          <span>{contact.city}, {contact.state}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-8 break-words">
        <div>
          <h2 className="text-lg font-bold pb-1 mb-4 border-b-2" style={{ color: primaryColor, borderColor: primaryColor }}>SUMMARY</h2>
          <p className="text-gray-700">{summary || "Your professional summary goes here."}</p>
        </div>

        <div className="mt-6">
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

        <div className="mt-6">
          <h2 className="text-lg font-bold pb-1 mb-4 border-b-2" style={{ color: primaryColor, borderColor: primaryColor }}>SKILLS</h2>
          <ul className="list-disc list-inside grid grid-cols-2 gap-x-8">
            {skills.length > 0 ? skills.map((skill, i) => <li key={i}>{skill}</li>) : <li>Add your skills</li>}
          </ul>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-bold text-[#1A2E4C] border-b-2 border-[#1A2E4C] pb-1 mb-4">EDUCATION</h2>
          <div>
            <h3 className="font-bold text-base">{education.degree || "Degree"}</h3>
            <p className="text-gray-600">{education.school} | {education.gradMonth} {education.gradYear}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranquilChroma; 