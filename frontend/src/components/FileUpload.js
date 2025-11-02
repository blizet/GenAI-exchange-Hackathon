import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, Cloud, Sparkles, Briefcase, X } from 'lucide-react';
import firebaseService from '../services/firebaseService';

const FileUpload = ({ onFileUpload, accept, maxSize, startupId, category = 'general' }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        console.log('Starting file upload to Firebase Storage...');
        console.log('File:', file);
        console.log('Startup ID:', startupId);
        console.log('Category:', category);
        
        // Upload to Firebase Storage with progress tracking
        const uploadResult = await firebaseService.uploadFile(
          file, 
          `startups/${startupId}/documents/${category}/${file.name}`,
          (progress) => {
            console.log('Upload progress:', progress + '%');
            setUploadProgress(progress);
          }
        );
        
        console.log('Upload completed successfully:', uploadResult);
        
        // Call the callback with the upload result
        onFileUpload(uploadResult);
        setUploadProgress(100);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed: ' + error.message);
        setSelectedFile(null);
        setUploadProgress(0);
      } finally {
        setIsUploading(false);
      }
    }
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        alert(`File is too large. Maximum size is ${formatFileSize(maxSize || 10 * 1024 * 1024)}`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        alert('Invalid file type. Please upload PDF, PPTX, or PPT files only.');
      }
    }
  }, [onFileUpload, maxSize, startupId, category]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections
  } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt']
    },
    maxSize: maxSize || 10 * 1024 * 1024, // 10MB default
    multiple: false
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      document.getElementById('file-input').click();
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-8">
      <div
        {...getRootProps()}
        onKeyDown={handleKeyDown}
        className={`
          border-3 border-dashed rounded-3xl p-12 md:p-16 text-center cursor-pointer transition-all duration-300 relative overflow-hidden min-h-[400px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isDragActive && !isDragReject ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 scale-105 shadow-2xl' : ''}
          ${isDragReject ? 'border-red-500 bg-gradient-to-br from-red-50 to-pink-50' : ''}
          ${!isDragActive && !isDragReject ? 'border-gray-300 hover:border-blue-500 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:scale-102 hover:shadow-xl' : ''}
        `}
        role="button"
        tabIndex={0}
        aria-label="Upload document by dragging and dropping or clicking to browse files"
        aria-describedby="upload-instructions"
      >
        <input 
          {...getInputProps()} 
          id="file-input"
          aria-label="File input"
        />
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-8 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-2xl" />
          <div className="absolute bottom-8 right-8 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl" />
        </div>
        
        <div className="flex flex-col items-center gap-8 relative z-10 max-w-2xl">
          <div className={`w-28 h-28 md:w-32 md:h-32 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-lg ${
            isDragActive 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 scale-110' 
              : 'bg-gradient-to-br from-gray-100 to-gray-200'
          }`}>
            {isDragActive ? (
              <Cloud className="w-14 h-14 md:w-16 md:h-16 text-white animate-bounce" aria-hidden="true" />
            ) : (
              <Briefcase className="w-14 h-14 md:w-16 md:h-16 text-gray-600" aria-hidden="true" />
            )}
          </div>
          
          <div className="space-y-4" id="upload-instructions">
            <p className="text-xl md:text-3xl font-bold text-gray-900">
              {isDragActive
                ? 'Drop your file here'
                : 'Drag & drop your document here'}
            </p>
            <p className="text-gray-600 text-base md:text-xl">
              or <span className="text-blue-600 font-semibold underline">click anywhere</span> to browse files
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-base text-gray-500 bg-white/70 px-6 py-3 rounded-full shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">PDF, PPTX, PPT</span>
            </div>
            <div className="w-1 h-1 md:w-1 md:h-1 bg-gray-400 rounded-full" />
            <span className="font-medium">Max {formatFileSize(maxSize || 10 * 1024 * 1024)}</span>
          </div>
          
          {!isDragActive && (
            <div className="flex items-center gap-3 text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span className="text-base font-medium">AI-powered analysis</span>
            </div>
          )}

          {/* Progress Bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full max-w-md">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                  role="progressbar"
                  aria-valuenow={uploadProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`Upload progress: ${uploadProgress}%`}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Selected File Info */}
          {selectedFile && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4 w-full max-w-md">
              <FileText className="w-5 h-5 text-green-600" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-green-600">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                onClick={clearFile}
                className="p-1 hover:bg-green-100 rounded-full transition-colors"
                aria-label="Remove selected file"
                title="Remove file"
              >
                <X className="w-4 h-4 text-green-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6" role="alert">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
            </div>
            <div>
              <h4 className="font-semibold text-red-800 text-lg">File Upload Error</h4>
              <ul className="mt-2 text-sm text-red-700 space-y-1">
                {fileRejections.map(({ file, errors }) => (
                  <li key={file.name} className="flex items-center gap-2">
                    <span className="font-medium">{file.name}</span>
                    <span aria-hidden="true">•</span>
                    <span>{errors.map(e => e.message).join(', ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;