import React, { useEffect } from 'react';
import { useFFmpeg } from '../context/FFmpegContext';

const FFmpegLoader = () => {
  const { isLoaded, isLoading, loadingProgress, error, loadFFmpeg } = useFFmpeg();

  useEffect(() => {
    if (!isLoaded && !isLoading) {
      loadFFmpeg();
    }
  }, [isLoaded, isLoading, loadFFmpeg]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Loading FFmpeg</h2>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {loadingProgress}% - Loading video processing capabilities...
          </p>
          <p className="text-xs text-gray-500 mt-2">
            This may take a moment depending on your connection speed.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-red-600">Error Loading FFmpeg</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={loadFFmpeg}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default FFmpegLoader;