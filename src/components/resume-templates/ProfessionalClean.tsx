import { format } from 'date-fns';

const ProfessionalClean = ({ 
  contact, 
  summary, 
  skills, 
  experience, 
  education, 
  colors = {},
  projects = [],
  certifications = [],
  languages = [],
  volunteerExperience = [],
  publications = [],
  awards = [],
  references = [],
  activeSections = {}
}) => {
  // Handle both single experience object (legacy) and array of experiences (new)
  const experiences = Array.isArray(experience) ? experience : [experience].filter(Boolean);
  // Default colors with fallback to original template colors
  const templateColors = {
    primary: colors.primary || '#1F2937',
    secondary: colors.secondary || '#6B7280',
    accent: colors.accent || '#374151',
    background: colors.background || '#FFFFFF',
    text: colors.text || '#111827'
  };
  return (
    <div className="w-full min-h-full font-sans rounded-lg shadow-lg overflow-hidden text-sm" style={{ backgroundColor: templateColors.background }}>
      {/* Clean Header */}
      <div className="border-b-4 p-8" style={{ borderColor: templateColors.primary }}>
        <h1 className="text-4xl font-light mb-2" style={{ color: templateColors.text }}>
          {contact.firstName} <span className="font-bold">{contact.lastName}</span>
        </h1>
        <div className="flex justify-between items-center">
          <p className="text-lg" style={{ color: templateColors.secondary }}>Professional Resume</p>
          <div className="text-right space-y-1" style={{ color: templateColors.secondary }}>
            <p>{contact.phone}</p>
            <p>{contact.email}</p>
            <p>{contact.city}, {contact.state}</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Professional Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: templateColors.primary }}>PROFESSIONAL SUMMARY</h2>
          <div className="border-l-4 pl-6" style={{ borderColor: templateColors.primary }}>
            <p className="leading-relaxed text-base" style={{ color: templateColors.text }}>{summary || "Your professional summary goes here."}</p>
          </div>
        </div>

        {/* Experience */}
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: templateColors.primary }}>PROFESSIONAL EXPERIENCE</h2>
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div key={index} className="border-l-4 pl-6" style={{ borderColor: templateColors.accent }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: templateColors.text }}>{exp.jobTitle || "Job Title"}</h3>
                    <p className="font-medium text-lg" style={{ color: templateColors.accent }}>{exp.employer}</p>
                  </div>
                  <div className="text-right" style={{ color: templateColors.secondary }}>
                    <p className="font-medium">
                      {exp.startDate ? format(exp.startDate, 'MMMM yyyy') : 'Start Date'} - {exp.current ? "Present" : (exp.endDate ? format(exp.endDate, 'MMMM yyyy') : 'End Date')}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 mt-4" style={{ color: templateColors.text }}>
                  {(exp.accomplishments || "").split('\n').map((item, itemIndex) => 
                    item.trim() && <li key={itemIndex} className="flex items-start"><span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="leading-relaxed">{item}</span></li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: templateColors.primary }}>CORE COMPETENCIES</h2>
          <div className="border-l-4 pl-6" style={{ borderColor: templateColors.primary }}>
            <div className="grid grid-cols-2 gap-4">
              {skills.length > 0 ? skills.map((skill, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: templateColors.primary }}></div>
                  <span className="font-medium" style={{ color: templateColors.text }}>{skill}</span>
                </div>
              )) : <div className="col-span-2" style={{ color: templateColors.secondary }}>Add your skills</div>}
            </div>
          </div>
        </div>

        {/* Education */}
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: templateColors.primary }}>EDUCATION</h2>
          <div className="border-l-4 pl-6" style={{ borderColor: templateColors.accent }}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold" style={{ color: templateColors.text }}>{education.degree || "Degree"}</h3>
                <p className="font-medium text-lg" style={{ color: templateColors.accent }}>{education.school}</p>
              </div>
              <p className="font-medium" style={{ color: templateColors.secondary }}>{education.gradMonth} {education.gradYear}</p>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        {activeSections?.projects && projects.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: templateColors.primary }}>PROJECTS</h2>
            <div className="space-y-6">
              {projects.map((project, index) => (
                <div key={index} className="border-l-4 pl-6" style={{ borderColor: templateColors.accent }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: templateColors.text }}>{project.title || "Project Title"}</h3>
                      {project.role && <p className="font-medium text-lg" style={{ color: templateColors.accent }}>{project.role}</p>}
                      {project.organization && <p style={{ color: templateColors.secondary }}>{project.organization}</p>}
                    </div>
                    <div className="text-right" style={{ color: templateColors.secondary }}>
                      <p className="font-medium">
                        {project.startDate ? format(project.startDate, 'MMMM yyyy') : ''} 
                        {project.startDate && (project.endDate || project.current) ? ' - ' : ''}
                        {project.current ? "Present" : (project.endDate ? format(project.endDate, 'MMMM yyyy') : '')}
                      </p>
                    </div>
                  </div>
                  {project.description && (
                    <ul className="space-y-2 mt-4" style={{ color: templateColors.text }}>
                      {project.description.split('\n').map((item, itemIndex) => 
                        item.trim() && <li key={itemIndex} className="flex items-start"><span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="leading-relaxed">{item}</span></li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications Section */}
        {activeSections?.certifications && certifications.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: templateColors.primary }}>CERTIFICATIONS</h2>
            <div className="border-l-4 pl-6" style={{ borderColor: templateColors.primary }}>
              <div className="space-y-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: templateColors.text }}>{cert.name || "Certification Name"}</h3>
                      <p className="font-medium" style={{ color: templateColors.accent }}>{cert.issuer}</p>
                      {cert.credentialID && <p style={{ color: templateColors.secondary }}>Credential ID: {cert.credentialID}</p>}
                    </div>
                    <div className="text-right" style={{ color: templateColors.secondary }}>
                      <p className="font-medium">
                        {cert.issueDate ? format(cert.issueDate, 'MMMM yyyy') : ''}
                        {cert.issueDate && !cert.noExpiry && cert.expiryDate ? ' - ' : ''}
                        {!cert.noExpiry && cert.expiryDate ? format(cert.expiryDate, 'MMMM yyyy') : (cert.noExpiry ? ' (No Expiry)' : '')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Languages Section */}
        {activeSections?.languages && languages.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: templateColors.primary }}>LANGUAGES</h2>
            <div className="border-l-4 pl-6" style={{ borderColor: templateColors.primary }}>
              <div className="grid grid-cols-2 gap-4">
                {languages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: templateColors.primary }}></div>
                      <span className="font-medium" style={{ color: templateColors.text }}>{lang.language}</span>
                    </div>
                    <span style={{ color: templateColors.secondary }}>{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Volunteer Experience Section */}
        {activeSections?.volunteerexperience && volunteerExperience.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: templateColors.primary }}>VOLUNTEER EXPERIENCE</h2>
            <div className="space-y-6">
              {volunteerExperience.map((vol, index) => (
                <div key={index} className="border-l-4 pl-6" style={{ borderColor: templateColors.accent }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: templateColors.text }}>{vol.role || "Volunteer Role"}</h3>
                      <p className="font-medium text-lg" style={{ color: templateColors.accent }}>{vol.organization}</p>
                    </div>
                    <div className="text-right" style={{ color: templateColors.secondary }}>
                      <p className="font-medium">
                        {vol.startDate ? format(vol.startDate, 'MMMM yyyy') : ''} 
                        {vol.startDate && (vol.endDate || vol.current) ? ' - ' : ''}
                        {vol.current ? "Present" : (vol.endDate ? format(vol.endDate, 'MMMM yyyy') : '')}
                      </p>
                    </div>
                  </div>
                  {vol.description && (
                    <ul className="space-y-2 mt-4" style={{ color: templateColors.text }}>
                      {vol.description.split('\n').map((item, itemIndex) => 
                        item.trim() && <li key={itemIndex} className="flex items-start"><span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></span><span className="leading-relaxed">{item}</span></li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publications Section */}
        {activeSections?.publications && publications.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: templateColors.primary }}>PUBLICATIONS</h2>
            <div className="border-l-4 pl-6" style={{ borderColor: templateColors.primary }}>
              <div className="space-y-4">
                {publications.map((pub, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: templateColors.text }}>{pub.title || "Publication Title"}</h3>
                      <p className="font-medium" style={{ color: templateColors.accent }}>{pub.publisher}</p>
                      {pub.authors && <p style={{ color: templateColors.secondary }}>Authors: {pub.authors}</p>}
                      {pub.description && <p className="mt-2" style={{ color: templateColors.text }}>{pub.description}</p>}
                    </div>
                    {pub.publicationDate && (
                      <p style={{ color: templateColors.secondary }}>{format(pub.publicationDate, 'MMMM yyyy')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Awards Section */}
        {activeSections?.awards && awards.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: templateColors.primary }}>AWARDS & HONORS</h2>
            <div className="border-l-4 pl-6" style={{ borderColor: templateColors.primary }}>
              <div className="space-y-4">
                {awards.map((award, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: templateColors.text }}>{award.title || "Award Title"}</h3>
                      <p className="font-medium" style={{ color: templateColors.accent }}>{award.issuer}</p>
                      {award.description && <p className="mt-2" style={{ color: templateColors.text }}>{award.description}</p>}
                    </div>
                    {award.date && (
                      <p style={{ color: templateColors.secondary }}>{format(award.date, 'MMMM yyyy')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* References Section */}
        {activeSections?.references && references.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: templateColors.primary }}>REFERENCES</h2>
            <div className="border-l-4 pl-6" style={{ borderColor: templateColors.primary }}>
              <div className="grid grid-cols-2 gap-4">
                {references.map((ref, index) => (
                  <div key={index} className="p-4 border rounded" style={{ borderColor: templateColors.accent }}>
                    <h3 className="font-bold" style={{ color: templateColors.text }}>{ref.name || "Reference Name"}</h3>
                    <p className="font-medium" style={{ color: templateColors.accent }}>{ref.position}{ref.company ? `, ${ref.company}` : ''}</p>
                    <div className="mt-2" style={{ color: templateColors.secondary }}>
                      {ref.email && <p>{ref.email}</p>}
                      {ref.phone && <p>{ref.phone}</p>}
                      {ref.relationship && <p>Relationship: {ref.relationship}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalClean;