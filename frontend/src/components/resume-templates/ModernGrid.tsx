import { format } from 'date-fns';

const ModernGrid = ({ 
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
    primary: colors.primary || '#4F46E5',
    secondary: colors.secondary || '#7C3AED',
    accent: colors.accent || '#6366F1',
    background: colors.background || '#FFFFFF',
    text: colors.text || '#111827'
  };
  return (
    <div className="w-full min-h-full font-sans rounded-lg shadow-lg overflow-hidden text-sm" style={{ backgroundColor: templateColors.background }}>
      {/* Header Grid */}
      <div className="grid grid-cols-3 text-white" style={{ background: `linear-gradient(to right, ${templateColors.primary}, ${templateColors.secondary})` }}>
        <div className="col-span-2 p-6">
          <h1 className="text-3xl font-bold mb-2">{contact.firstName} {contact.lastName}</h1>
          <p className="text-lg" style={{ color: `${templateColors.background}CC` }}>Professional Specialist</p>
        </div>
        <div className="p-6 bg-black/20 space-y-2" style={{ color: `${templateColors.background}CC` }}>
          <p className="text-xs">{contact.phone}</p>
          <p className="text-xs">{contact.email}</p>
          <p className="text-xs">{contact.city}, {contact.state}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 min-h-full">
        {/* Left Column */}
        <div className="p-6 space-y-6" style={{ backgroundColor: `${templateColors.primary}10` }}>
          {/* Skills */}
          <div>
            <h2 className="text-lg font-bold mb-3 border-b-2 pb-1" style={{ color: templateColors.primary, borderColor: templateColors.primary }}>SKILLS</h2>
            <div className="space-y-2">
              {skills.length > 0 ? skills.map((skill, i) => (
                <div key={i} className="p-2 rounded shadow-sm border-l-4" style={{ backgroundColor: templateColors.background, borderColor: templateColors.accent }}>
                  <span className="font-medium text-xs" style={{ color: templateColors.text }}>{skill}</span>
                </div>
              )) : <div className="text-xs" style={{ color: templateColors.secondary }}>Add your skills</div>}
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-lg font-bold mb-3 border-b-2 pb-1" style={{ color: templateColors.primary, borderColor: templateColors.primary }}>EDUCATION</h2>
            <div className="p-4 rounded shadow-sm" style={{ backgroundColor: templateColors.background }}>
              <h3 className="font-bold text-xs" style={{ color: templateColors.text }}>{education.degree || "Degree"}</h3>
              <p className="text-xs" style={{ color: templateColors.accent }}>{education.school}</p>
              <p className="text-xs" style={{ color: templateColors.secondary }}>{education.gradMonth} {education.gradYear}</p>
            </div>
          </div>

          {/* Languages Section */}
          {activeSections?.languages && languages.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 border-b-2 pb-1" style={{ color: templateColors.primary, borderColor: templateColors.primary }}>LANGUAGES</h2>
              <div className="space-y-2">
                {languages.map((lang, index) => (
                  <div key={index} className="p-2 rounded shadow-sm border-l-4 flex justify-between" style={{ backgroundColor: templateColors.background, borderColor: templateColors.accent }}>
                    <span className="font-medium text-xs" style={{ color: templateColors.text }}>{lang.language}</span>
                    <span className="text-xs" style={{ color: templateColors.secondary }}>{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {activeSections?.certifications && certifications.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 border-b-2 pb-1" style={{ color: templateColors.primary, borderColor: templateColors.primary }}>CERTIFICATIONS</h2>
              <div className="space-y-2">
                {certifications.map((cert, index) => (
                  <div key={index} className="p-3 rounded shadow-sm" style={{ backgroundColor: templateColors.background }}>
                    <h3 className="font-bold text-xs" style={{ color: templateColors.text }}>{cert.name || "Certification Name"}</h3>
                    <p className="text-xs" style={{ color: templateColors.accent }}>{cert.issuer}</p>
                    <p className="text-xs" style={{ color: templateColors.secondary }}>
                      {cert.issueDate ? format(cert.issueDate, 'MMM yyyy') : ''}
                      {cert.issueDate && !cert.noExpiry && cert.expiryDate ? ' - ' : ''}
                      {!cert.noExpiry && cert.expiryDate ? format(cert.expiryDate, 'MMM yyyy') : (cert.noExpiry ? ' (No Expiry)' : '')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References Section */}
          {activeSections?.references && references.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 border-b-2 pb-1" style={{ color: templateColors.primary, borderColor: templateColors.primary }}>REFERENCES</h2>
              <div className="space-y-2">
                {references.map((ref, index) => (
                  <div key={index} className="p-3 rounded shadow-sm" style={{ backgroundColor: templateColors.background }}>
                    <h3 className="font-bold text-xs" style={{ color: templateColors.text }}>{ref.name || "Reference Name"}</h3>
                    <p className="text-xs" style={{ color: templateColors.accent }}>{ref.position}{ref.company ? `, ${ref.company}` : ''}</p>
                    <div className="text-xs" style={{ color: templateColors.secondary }}>
                      {ref.email && <p>{ref.email}</p>}
                      {ref.phone && <p>{ref.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="col-span-2 p-6 space-y-6">
          {/* Summary */}
          <div>
            <h2 className="text-xl font-bold mb-3 border-b-2 pb-1" style={{ color: templateColors.text, borderColor: templateColors.primary }}>PROFESSIONAL SUMMARY</h2>
            <div className="p-4 rounded border-l-4" style={{ backgroundColor: `${templateColors.primary}10`, borderColor: templateColors.primary }}>
              <p className="leading-relaxed" style={{ color: templateColors.text }}>{summary || "Your professional summary goes here."}</p>
            </div>
          </div>

          {/* Experience */}
          <div>
            <h2 className="text-xl font-bold mb-3 border-b-2 pb-1" style={{ color: templateColors.text, borderColor: templateColors.primary }}>EXPERIENCE</h2>
            <div className="space-y-4">
              {experiences.map((exp, index) => (
                <div key={index} className="border rounded-lg p-4 shadow-sm" style={{ backgroundColor: templateColors.background, borderColor: `${templateColors.secondary}40` }}>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="col-span-2">
                      <h3 className="font-bold" style={{ color: templateColors.text }}>{exp.jobTitle || "Job Title"}</h3>
                      <p className="font-medium" style={{ color: templateColors.primary }}>{exp.employer}</p>
                    </div>
                    <div className="text-right">
                      <div className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: `${templateColors.primary}20`, color: templateColors.primary }}>
                        {exp.startDate ? format(exp.startDate, 'MMM yyyy') : 'Start'} - {exp.current ? "Present" : (exp.endDate ? format(exp.endDate, 'MMM yyyy') : 'End')}
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-1" style={{ color: templateColors.text }}>
                    {(exp.accomplishments || "").split('\n').map((item, itemIndex) => 
                      item.trim() && <li key={itemIndex} className="flex items-start text-xs"><span className="w-1.5 h-1.5 rounded-full mr-2 mt-1.5 flex-shrink-0" style={{ backgroundColor: templateColors.accent }}></span><span>{item}</span></li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          {/* Projects Section */}
          {activeSections?.projects && projects.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3 border-b-2 pb-1" style={{ color: templateColors.text, borderColor: templateColors.primary }}>PROJECTS</h2>
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={index} className="border rounded-lg p-4 shadow-sm" style={{ backgroundColor: templateColors.background, borderColor: `${templateColors.secondary}40` }}>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="col-span-2">
                        <h3 className="font-bold" style={{ color: templateColors.text }}>{project.title || "Project Title"}</h3>
                        {project.role && <p className="font-medium" style={{ color: templateColors.primary }}>{project.role}</p>}
                        {project.organization && <p className="text-xs" style={{ color: templateColors.secondary }}>{project.organization}</p>}
                      </div>
                      <div className="text-right">
                        <div className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: `${templateColors.primary}20`, color: templateColors.primary }}>
                          {project.startDate ? format(project.startDate, 'MMM yyyy') : ''} 
                          {project.startDate && (project.endDate || project.current) ? ' - ' : ''}
                          {project.current ? "Present" : (project.endDate ? format(project.endDate, 'MMM yyyy') : '')}
                        </div>
                      </div>
                    </div>
                    {project.description && (
                      <ul className="space-y-1" style={{ color: templateColors.text }}>
                        {project.description.split('\n').map((item, itemIndex) => 
                          item.trim() && <li key={itemIndex} className="flex items-start text-xs"><span className="w-1.5 h-1.5 rounded-full mr-2 mt-1.5 flex-shrink-0" style={{ backgroundColor: templateColors.accent }}></span><span>{item}</span></li>
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Volunteer Experience Section */}
          {activeSections?.volunteerexperience && volunteerExperience.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3 border-b-2 pb-1" style={{ color: templateColors.text, borderColor: templateColors.primary }}>VOLUNTEER EXPERIENCE</h2>
              <div className="space-y-4">
                {volunteerExperience.map((vol, index) => (
                  <div key={index} className="border rounded-lg p-4 shadow-sm" style={{ backgroundColor: templateColors.background, borderColor: `${templateColors.secondary}40` }}>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="col-span-2">
                        <h3 className="font-bold" style={{ color: templateColors.text }}>{vol.role || "Volunteer Role"}</h3>
                        <p className="font-medium" style={{ color: templateColors.primary }}>{vol.organization}</p>
                      </div>
                      <div className="text-right">
                        <div className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: `${templateColors.primary}20`, color: templateColors.primary }}>
                          {vol.startDate ? format(vol.startDate, 'MMM yyyy') : ''} 
                          {vol.startDate && (vol.endDate || vol.current) ? ' - ' : ''}
                          {vol.current ? "Present" : (vol.endDate ? format(vol.endDate, 'MMM yyyy') : '')}
                        </div>
                      </div>
                    </div>
                    {vol.description && (
                      <ul className="space-y-1" style={{ color: templateColors.text }}>
                        {vol.description.split('\n').map((item, itemIndex) => 
                          item.trim() && <li key={itemIndex} className="flex items-start text-xs"><span className="w-1.5 h-1.5 rounded-full mr-2 mt-1.5 flex-shrink-0" style={{ backgroundColor: templateColors.accent }}></span><span>{item}</span></li>
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
              <h2 className="text-xl font-bold mb-3 border-b-2 pb-1" style={{ color: templateColors.text, borderColor: templateColors.primary }}>PUBLICATIONS</h2>
              <div className="space-y-4">
                {publications.map((pub, index) => (
                  <div key={index} className="border rounded-lg p-4 shadow-sm" style={{ backgroundColor: templateColors.background, borderColor: `${templateColors.secondary}40` }}>
                    <div className="grid grid-cols-3 gap-4 mb-2">
                      <div className="col-span-2">
                        <h3 className="font-bold" style={{ color: templateColors.text }}>{pub.title || "Publication Title"}</h3>
                        <p className="font-medium" style={{ color: templateColors.primary }}>{pub.publisher}</p>
                        {pub.authors && <p className="text-xs" style={{ color: templateColors.secondary }}>Authors: {pub.authors}</p>}
                      </div>
                      {pub.publicationDate && (
                        <div className="text-right">
                          <div className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: `${templateColors.primary}20`, color: templateColors.primary }}>
                            {format(pub.publicationDate, 'MMM yyyy')}
                          </div>
                        </div>
                      )}
                    </div>
                    {pub.description && (
                      <p className="text-xs mt-2" style={{ color: templateColors.text }}>{pub.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Awards Section */}
          {activeSections?.awards && awards.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3 border-b-2 pb-1" style={{ color: templateColors.text, borderColor: templateColors.primary }}>AWARDS & HONORS</h2>
              <div className="space-y-4">
                {awards.map((award, index) => (
                  <div key={index} className="border rounded-lg p-4 shadow-sm" style={{ backgroundColor: templateColors.background, borderColor: `${templateColors.secondary}40` }}>
                    <div className="grid grid-cols-3 gap-4 mb-2">
                      <div className="col-span-2">
                        <h3 className="font-bold" style={{ color: templateColors.text }}>{award.title || "Award Title"}</h3>
                        <p className="font-medium" style={{ color: templateColors.primary }}>{award.issuer}</p>
                      </div>
                      {award.date && (
                        <div className="text-right">
                          <div className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: `${templateColors.primary}20`, color: templateColors.primary }}>
                            {format(award.date, 'MMM yyyy')}
                          </div>
                        </div>
                      )}
                    </div>
                    {award.description && (
                      <p className="text-xs mt-2" style={{ color: templateColors.text }}>{award.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernGrid;