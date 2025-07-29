import { SectionProps } from '../types';

const HeadingSection = ({ 
  resumeData, 
  updateResumeData, 
  onNext, 
  onBack 
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

  return (
    <div className="max-w-2xl w-full flex flex-col items-center justify-center h-[80vh]">
      <h1 className="text-4xl font-bold mb-2 text-gray-900">
        Let's create a header for your resume
      </h1>
      <p className="text-xl text-gray-500 mb-8">
        Use a professional email and a phone for employers to reach you
      </p>
      
      <form className="grid grid-cols-2 gap-4 mb-8" onSubmit={e => e.preventDefault()}>
        <div>
          <label className="block text-gray-700 mb-1">First Name</label>
          <input 
            className="w-full border rounded px-3 py-2" 
            placeholder="Jane" 
            value={contact.firstName} 
            onChange={e => handleContactChange('firstName', e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Last Name</label>
          <input 
            className="w-full border rounded px-3 py-2" 
            placeholder="Doe" 
            value={contact.lastName} 
            onChange={e => handleContactChange('lastName', e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">City</label>
          <input 
            className="w-full border rounded px-3 py-2" 
            placeholder="Bengaluru" 
            value={contact.city} 
            onChange={e => handleContactChange('city', e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">State</label>
          <input 
            className="w-full border rounded px-3 py-2" 
            placeholder="KA" 
            value={contact.state} 
            onChange={e => handleContactChange('state', e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Zip</label>
          <input 
            className="w-full border rounded px-3 py-2" 
            placeholder="560056" 
            value={contact.zip} 
            onChange={e => handleContactChange('zip', e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Phone</label>
          <input 
            className="w-full border rounded px-3 py-2" 
            placeholder="(123) 456-7890" 
            value={contact.phone} 
            onChange={e => handleContactChange('phone', e.target.value)} 
          />
        </div>
        <div className="col-span-2">
          <label className="block text-gray-700 mb-1">Email</label>
          <input 
            className="w-full border rounded px-3 py-2" 
            placeholder="jane.doe@email.com" 
            value={contact.email} 
            onChange={e => handleContactChange('email', e.target.value)} 
          />
        </div>
      </form>
      
      <div className="flex gap-4 mt-8 w-full justify-between">
        <button 
          className="px-6 py-2 rounded bg-gray-200 text-gray-700" 
          onClick={onBack}
        >
          Back
        </button>
        <button 
          className="px-6 py-2 rounded bg-blue-600 text-white" 
          onClick={onNext}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default HeadingSection; 