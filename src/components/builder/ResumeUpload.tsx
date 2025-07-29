import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { EnhancedResumeParser, ParsedResumeData } from './services/EnhancedResumeParser';
import { ResumeData } from './types';

interface ResumeUploadProps {
  onResumeUploaded: (resumeData: Partial<ResumeData>) => void;
  onClose: () => void;
  isOpen: boolean;
}

interface UploadState {
  isDragging: boolean;
  isUploading: boolean;
  uploadedFile: File | null;
  parsedData: ParsedResumeData | null;
  error: string | null;
  success: boolean;
  ocrProgress: number;
  ocrTotal: number;
  ocrActive: boolean;
}

const ResumeUpload = ({ onResumeUploaded, onClose, isOpen }: ResumeUploadProps) => {
  const [state, setState] = useState<UploadState>({
    isDragging: false,
    isUploading: false,
    uploadedFile: null,
    parsedData: null,
    error: null,
    success: false,
    ocrProgress: 0,
    ocrTotal: 0,
    ocrActive: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateState = useCallback((updates: Partial<UploadState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    updateState({ isDragging: true });
  }, [updateState]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    updateState({ isDragging: false });
  }, [updateState]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    updateState({ isDragging: false });

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  }, [updateState, handleFileUpload]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileUpload = useCallback(async (file: File) => {
    updateState({ 
      isUploading: true, 
      error: null, 
      uploadedFile: file,
      success: false,
      ocrProgress: 0,
      ocrTotal: 0,
      ocrActive: false,
    });

    try {
      const parsedData = await EnhancedResumeParser.parseFile(file, (page, total) => {
        updateState({ ocrProgress: page, ocrTotal: total, ocrActive: true });
      });
      updateState({ 
        isUploading: false, 
        parsedData,
        success: true,
        ocrActive: false,
      });
    } catch (error) {
      updateState({ 
        isUploading: false, 
        error: error instanceof Error ? error.message : 'Failed to parse resume',
        success: false,
        ocrActive: false,
      });
    }
  }, [updateState]);

  const handleImportResume = () => {
    if (state.parsedData) {
      const resumeData = EnhancedResumeParser.convertToResumeData(state.parsedData);
      onResumeUploaded(resumeData);
      onClose();
    }
  };

  const handleReset = () => {
    setState({
      isDragging: false,
      isUploading: false,
      uploadedFile: null,
      parsedData: null,
      error: null,
      success: false,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upload Your Resume</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Upload Area */}
        {!state.uploadedFile && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              state.isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop your resume here, or click to browse
            </h3>
            <p className="text-gray-600 mb-4">
              Supports PDF, DOCX, and TXT files up to 10MB
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* File Processing */}
        {state.uploadedFile && (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {state.uploadedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(state.uploadedFile.size)}
                </p>
              </div>
              {state.isUploading && !state.ocrActive && (
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
              {state.ocrActive && (
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              )}
              {state.success && (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
              {state.error && (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
            </div>

            {/* OCR Progress */}
            {state.ocrActive && (
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(state.ocrProgress / (state.ocrTotal || 1)) * 100}%` }}
                />
                <div className="text-center text-blue-800 mt-2">
                  Extracting text from scanned PDF… (Page {state.ocrProgress} of {state.ocrTotal})
                </div>
              </div>
            )}

            {/* Loading State */}
            {state.isUploading && (
              <div className="text-center py-4">
                <p className="text-gray-600">Analyzing your resume...</p>
              </div>
            )}

            {/* Error State */}
            {state.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h4 className="text-red-800 font-medium">Upload Error</h4>
                </div>
                <p className="text-red-700 mt-1">{state.error}</p>
                <button
                  onClick={handleReset}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Success State with Preview */}
            {state.success && state.parsedData && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="text-green-800 font-medium">Resume Parsed Successfully!</h4>
                  </div>
                  <p className="text-green-700">
                    We've extracted the following information from your resume:
                  </p>
                </div>

                {/* Parsed Data Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Info */}
                  {state.parsedData.contact && Object.values(state.parsedData.contact).some(v => v) && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Contact Information</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        {state.parsedData.contact.firstName && (
                          <p>Name: {state.parsedData.contact.firstName} {state.parsedData.contact.lastName}</p>
                        )}
                        {state.parsedData.contact.email && (
                          <p>Email: {state.parsedData.contact.email}</p>
                        )}
                        {state.parsedData.contact.phone && (
                          <p>Phone: {state.parsedData.contact.phone}</p>
                        )}
                        {state.parsedData.contact.city && (
                          <p>Location: {state.parsedData.contact.city}, {state.parsedData.contact.state}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Work Experience */}
                  {state.parsedData.workExperiences.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Work Experience</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        {state.parsedData.workExperiences.slice(0, 3).map((exp, index) => (
                          <p key={index}>
                            {exp.jobTitle} {exp.employer && `at ${exp.employer}`}
                          </p>
                        ))}
                        {state.parsedData.workExperiences.length > 3 && (
                          <p className="text-gray-500">+{state.parsedData.workExperiences.length - 3} more...</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {state.parsedData.education && Object.values(state.parsedData.education).some(v => v) && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Education</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        {state.parsedData.education.degree && (
                          <p>Degree: {state.parsedData.education.degree}</p>
                        )}
                        {state.parsedData.education.school && (
                          <p>School: {state.parsedData.education.school}</p>
                        )}
                        {state.parsedData.education.gradYear && (
                          <p>Year: {state.parsedData.education.gradYear}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {state.parsedData.skills.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Skills</h5>
                      <div className="text-sm text-gray-600">
                        <p>{state.parsedData.skills.slice(0, 5).join(', ')}</p>
                        {state.parsedData.skills.length > 5 && (
                          <p className="text-gray-500 mt-1">+{state.parsedData.skills.length - 5} more skills</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleImportResume}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Import This Resume
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Upload Different File
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-blue-900 font-medium mb-2">How it works:</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Upload your existing resume in PDF, DOCX, or TXT format</li>
            <li>• We'll automatically extract and organize your information</li>
            <li>• Review and edit the imported data in our builder</li>
            <li>• Apply it to any of our professional templates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload; 