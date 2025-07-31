import { SectionProps } from '../types';
import { User, Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

const HeadingSection = ({ 
  resumeData, 
  updateResumeData, 
  onNext, 
  onBack,
  onUploadClick
}: SectionProps) => {
  const { contact } = resumeData;

  const handleContactChange = (field: keyof typeof contact, value: string) => {
    updateResumeData({
      contact: {
        ...contact,
        [field]: value
      }
    });
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const isFormValid = () => {
    return contact.firstName.trim() && 
           contact.lastName.trim() && 
           contact.email.trim() && 
           isValidEmail(contact.email) &&
           contact.phone.trim();
  };

  return (
    <div className="max-w-4xl w-full mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          Let's start with your contact information
        </h1>
        <p className="text-xl text-gray-500">
          Add your professional contact details so employers can reach you easily.
        </p>
      </div>

      {/* Upload Resume Option */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              📄 Have an existing resume?
            </h3>
            <p className="text-blue-700">
              Upload your current resume to automatically fill all these fields
            </p>
          </div>
          <button
            onClick={onUploadClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Upload Resume
          </button>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="John" 
                value={contact.firstName} 
                onChange={e => handleContactChange('firstName', e.target.value)} 
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Smith" 
                value={contact.lastName} 
                onChange={e => handleContactChange('lastName', e.target.value)} 
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="email"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  contact.email && !isValidEmail(contact.email) 
                    ? 'border-red-300' 
                    : 'border-gray-300'
                }`}
                placeholder="john.smith@email.com" 
                value={contact.email} 
                onChange={e => handleContactChange('email', e.target.value)} 
              />
            </div>
            {contact.email && !isValidEmail(contact.email) && (
              <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="tel"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="(555) 123-4567" 
                value={contact.phone} 
                onChange={e => handleContactChange('phone', e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="border-t pt-6 mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Address (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="New York" 
                  value={contact.city} 
                  onChange={e => handleContactChange('city', e.target.value)} 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input 
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="NY" 
                value={contact.state} 
                onChange={e => handleContactChange('state', e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input 
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="10001" 
                value={contact.zip} 
                onChange={e => handleContactChange('zip', e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Professional Links */}
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Professional Links (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Profile
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="url"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="https://linkedin.com/in/johnsmith" 
                  value={contact.linkedin || ''} 
                  onChange={e => handleContactChange('linkedin', e.target.value)} 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio/Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="url"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="https://johnsmith.com" 
                  value={contact.website || ''} 
                  onChange={e => handleContactChange('website', e.target.value)} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-medium text-green-900 mb-2">💡 Contact Information Tips</h3>
        <ul className="text-green-800 text-sm space-y-1">
          <li>• Use a professional email address (avoid nicknames or numbers)</li>
          <li>• Include a direct phone number where employers can reach you</li>
          <li>• Keep your LinkedIn profile updated and professional</li>
          <li>• Only include relevant social media or portfolio links</li>
          <li>• Double-check all information for typos and accuracy</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button 
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          disabled
        >
          ← Back
        </button>
        
        <button 
          onClick={onNext}
          disabled={!isFormValid()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Continue to Experience →
        </button>
      </div>
    </div>
  );
};

export default HeadingSection; 