import React, { useRef, useState } from 'react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';
import { useProcessing } from '../context/ProcessingContext';
import { createVideoThumbnail } from '../utils/fileUtils';

const VideoUploader = () => {
  const { handleVideoUpload } = useProcessing();
  const [isDragging, setIsDragging] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file) => {
    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file');
      return;
    }

    // Reset error state
    setError('');
    
    // Set file info
    setFileName(file.name);
    setFileSize(file.size);
    
    // Generate thumbnail
    try {
      const thumbnailUrl = await createVideoThumbnail(file);
      setThumbnail(thumbnailUrl);
    } catch (err) {
      console.error('Error generating thumbnail:', err);
    }
    
    // Upload to context
    handleVideoUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const clearFile = () => {
    setFileName('');
    setFileSize(0);
    setThumbnail(null);
    handleVideoUpload(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="w-full">
      {!fileName ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="hidden"
          />
          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-900">
            Drag and drop a video file here, or click to browse
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supports MP4, MOV, AVI, and other common video formats
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-start">
            {thumbnail ? (
              <img 
                src={thumbnail} 
                alt="Video thumbnail" 
                className="w-24 h-16 object-cover rounded mr-4"
              />
            ) : (
              <div className="w-24 h-16 bg-gray-200 rounded flex items-center justify-center mr-4">
                <FiFile className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-medium text-gray-900 truncate">{fileName}</h3>
                <button 
                  onClick={clearFile}
                  className="text-gray-500 hover:text-red-500"
                  aria-label="Remove file"
                >
                  <FiX />
                </button>
              </div>
              <p className="text-sm text-gray-500">{formatFileSize(fileSize)}</p>
              <div className="mt-2">
                <div className="h-1.5 w-full bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full"></div>
                </div>
                <p className="text-xs text-green-600 mt-1">Ready for processing</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;