import React, { createContext, useState, useContext, useEffect } from 'react';
import { createFFmpeg } from '@ffmpeg/ffmpeg';

const FFmpegContext = createContext();

export const useFFmpeg = () => useContext(FFmpegContext);

export const FFmpegProvider = ({ children }) => {
  const [ffmpeg, setFFmpeg] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);

  const loadFFmpeg = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create FFmpeg instance with logging and progress tracking
      const ffmpegInstance = createFFmpeg({
        log: true,
        progress: ({ ratio }) => {
          setLoadingProgress(Math.round(ratio * 100));
        },
        corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
      });
      
      // Load FFmpeg
      await ffmpegInstance.load();
      
      setFFmpeg(ffmpegInstance);
      setIsLoaded(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading FFmpeg:', err);
      setError(err.message || 'Failed to load FFmpeg');
      setIsLoading(false);
    }
  };

  const value = {
    ffmpeg,
    isLoaded,
    isLoading,
    loadingProgress,
    error,
    loadFFmpeg
  };

  return (
    <FFmpegContext.Provider value={value}>
      {children}
    </FFmpegContext.Provider>
  );
};