import SimpleBuilder from "@/components/builder/SimpleBuilder";
import { Suspense } from 'react';

const BuilderNew = () => {
  try {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>}>
        <SimpleBuilder />
      </Suspense>
    );
  } catch (error) {
    console.error('BuilderNew error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Builder</h2>
          <p className="text-gray-600 mb-4">There was an error loading the resume builder. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

export default BuilderNew; 