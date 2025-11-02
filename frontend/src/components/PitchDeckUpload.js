import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, Cloud, X, Download, Trash2, RefreshCw } from 'lucide-react';
import firebaseService from '../services/firebaseService';

const PitchDeckUpload = ({ startupId, onPitchDeckChange }) => {
  const [existingPitchDeck, setExistingPitchDeck] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [hasUser, setHasUser] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const refreshTimeoutRef = useRef(null);

  // Fetch existing pitch deck on component mount
  useEffect(() => {
    fetchExistingPitchDeck();
  }, [startupId]);

  // Debounced refresh function
  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      fetchExistingPitchDeck();
    }, 1000); // Wait 1 second after upload completion
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const fetchExistingPitchDeck = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user exists (startupId is provided)
      if (!startupId) {
        setHasUser(false);
        setIsLoading(false);
        return;
      }
      
      setHasUser(true);
      const pitchDeck = await firebaseService.getPitchDeck(startupId);
      
      if (pitchDeck) {
        setExistingPitchDeck(pitchDeck);
      } else {
        setExistingPitchDeck(null);
      }
    } catch (error) {
      setError('Failed to load pitch deck');
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      setUploadSuccess(false);
      
      try {
        // Progress tracking callback
        const progressCallback = (progress) => {
          setUploadProgress(Math.round(progress));
        };
        
        // Use replacePitchDeck to handle existing pitch deck with progress tracking
        const uploadResult = await firebaseService.replacePitchDeck(file, startupId, progressCallback);
        
        // Set processing state to prevent UI lag
        setIsProcessing(true);
        
        // Update local state immediately for better UX
        setExistingPitchDeck(uploadResult);
        
        // Notify parent component
        if (onPitchDeckChange) {
          onPitchDeckChange(uploadResult);
        }
        
        setUploadProgress(100);
        setUploadSuccess(true);
        
        // Refresh data after a short delay to ensure consistency
        debouncedRefresh();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setUploadSuccess(false);
          setIsProcessing(false);
        }, 3000);
        
      } catch (error) {
        setError('Upload failed: ' + error.message);
        setUploadProgress(0);
        setIsProcessing(false);
      } finally {
        setIsUploading(false);
      }
    }
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      setError(`File rejected: ${rejection.errors[0].message}`);
    }
  }, [startupId, onPitchDeckChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false
  });

  const handleDeletePitchDeck = async () => {
    if (!existingPitchDeck) return;
    
    try {
      setIsLoading(true);
      await firebaseService.deletePitchDeck(startupId, existingPitchDeck.id);
      setExistingPitchDeck(null);
      
      // Notify parent component
      if (onPitchDeckChange) {
        onPitchDeckChange(null);
      }
      
      // Refresh data to ensure consistency
      debouncedRefresh();
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Failed to delete pitch deck: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading pitch deck...</span>
      </div>
    );
  }

  // If no user, show nothing
  if (!hasUser) {
    return null;
  }

  // If there's an error loading pitch deck, show error message but still allow upload
  if (error) {
    return (
      <div className="space-y-4">
        {/* Success message */}
        {uploadSuccess && (
          <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                ✅ Pitch deck uploaded successfully!
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => {
              setError(null);
              fetchExistingPitchDeck();
            }}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        
        {/* Show upload interface even when there's an error */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-purple-400 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
              } ${isUploading || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} disabled={isUploading} />
          {isUploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">Uploading pitch deck...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{uploadProgress}% complete</p>
              </div>
            </div>
          ) : uploadSuccess ? (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-green-900">Upload Complete!</p>
                <p className="text-sm text-green-600">Your pitch deck has been uploaded successfully</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Upload New Pitch Deck
                </p>
                <p className="text-gray-600">
                  Drag and drop your pitch deck here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  PDF, PPT, PPTX files up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success message */}
      {uploadSuccess && (
        <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              ✅ Pitch deck uploaded successfully!
            </p>
          </div>
        </div>
      )}
      {existingPitchDeck ? (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {existingPitchDeck.fileName}
                </h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Size: {formatFileSize(existingPitchDeck.fileSize)}</p>
                  <p>Uploaded: {formatDate(existingPitchDeck.createdAt?.toDate?.() || existingPitchDeck.uploadedAt?.toDate?.() || existingPitchDeck.uploadedAt)}</p>
                  <p>Type: {existingPitchDeck.fileType}</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <a
                href={existingPitchDeck.downloadURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-1" />
                View
              </a>
              <button
                onClick={handleDeletePitchDeck}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Want to replace this pitch deck? Upload a new one below.
            </p>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
              } ${isUploading || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} disabled={isUploading || isProcessing} />
              {isUploading ? (
                <div className="space-y-2">
                  <RefreshCw className="h-8 w-8 text-purple-600 mx-auto animate-spin" />
                  <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                </div>
              ) : isProcessing ? (
                <div className="space-y-2">
                  <RefreshCw className="h-8 w-8 text-green-600 mx-auto animate-spin" />
                  <p className="text-sm text-gray-600">Processing upload...</p>
                </div>
              ) : uploadSuccess ? (
                <div className="space-y-2">
                  <div className="mx-auto w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-green-600 font-medium">Replaced successfully!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-purple-600">Click to replace</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, PPT, PPTX (max 50MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : hasUser ? (
        // Show upload interface only when there's a user but no pitch deck
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-purple-400 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
              } ${isUploading || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} disabled={isUploading} />
          {isUploading ? (
            <div className="space-y-4">
              <RefreshCw className="h-12 w-12 text-purple-600 mx-auto animate-spin" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">Uploading Pitch Deck</p>
                <p className="text-sm text-gray-600">{uploadProgress}% complete</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : uploadSuccess ? (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-green-900">Upload Complete!</p>
                <p className="text-sm text-green-600">Your pitch deck has been uploaded successfully</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Cloud className="h-8 w-8 text-purple-600" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop your pitch deck here' : 'Upload Pitch Deck'}
                </p>
                <p className="text-sm text-gray-600">
                  Drag and drop your pitch deck, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  PDF, PPT, PPTX files up to 50MB
                </p>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default PitchDeckUpload;
