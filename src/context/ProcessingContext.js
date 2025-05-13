import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchFile } from '@ffmpeg/ffmpeg';
import { useFFmpeg } from './FFmpegContext';

const ProcessingContext = createContext();

export const useProcessing = () => useContext(ProcessingContext);

export const ProcessingProvider = ({ children }) => {
  const { ffmpeg, isLoaded: isFFmpegLoaded } = useFFmpeg();
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [processingQueue, setProcessingQueue] = useState([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [outputFiles, setOutputFiles] = useState({});

  // Process queue items when FFmpeg is loaded
  useEffect(() => {
    if (isFFmpegLoaded && processingQueue.length > 0 && processingProgress === 0) {
      processNextItem();
    }
  }, [isFFmpegLoaded, processingQueue, processingProgress]);

  const handleFileUpload = (file) => {
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const addToProcessingQueue = (item) => {
    setProcessingQueue(prev => [...prev, item]);
  };

  const processNextItem = async () => {
    const item = processingQueue[0];
    
    if (!item) return;
    
    setProcessingProgress(1); // Start progress
    
    try {
      switch (item.type) {
        case 'createGif':
          await processGif(item.data);
          break;
        case 'trimVideo':
          await processTrim(item.data);
          break;
        case 'convert':
          await processConvert(item.data);
          break;
        default:
          console.error('Unknown processing type:', item.type);
      }
      
      // Remove processed item from queue
      setProcessingQueue(prev => prev.slice(1));
      setProcessingProgress(100); // Complete
      
    } catch (error) {
      console.error('Processing error:', error);
      setProcessingProgress(0); // Reset on error
    }
  };

  const processGif = async (data) => {
    const { inputFile, outputName, options } = data;
    const { startTime, duration, fps, width, quality } = options;
    
    try {
      // Write the input file to memory
      ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(inputFile));
      
      // Set quality parameters
      let filters = `fps=${fps},scale=${width}:-1:flags=lanczos`;
      
      // Apply quality settings
      let outputOptions = [];
      if (quality === 'low') {
        outputOptions = ['-q:v', '30'];
      } else if (quality === 'medium') {
        outputOptions = ['-q:v', '20'];
      } else if (quality === 'high') {
        outputOptions = ['-q:v', '10'];
      }
      
      // Progress updates
      ffmpeg.setProgress(({ ratio }) => {
        setProcessingProgress(Math.round(ratio * 100));
      });
      
      // Run FFmpeg command
      await ffmpeg.run(
        '-i', 'input.mp4',
        '-ss', `${startTime}`,
        '-t', `${duration}`,
        '-vf', filters,
        ...outputOptions,
        'output.gif'
      );
      
      // Read the output file
      const data = ffmpeg.FS('readFile', 'output.gif');
      
      // Create a URL for the output file
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));
      
      // Store the output file
      setOutputFiles(prev => ({
        ...prev,
        [outputName]: url
      }));
      
    } catch (error) {
      console.error('Error creating GIF:', error);
      throw error;
    }
  };

  const processTrim = async (data) => {
    const { inputFile, outputName, options } = data;
    const { startTime, duration } = options;
    
    try {
      // Write the input file to memory
      ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(inputFile));
      
      // Progress updates
      ffmpeg.setProgress(({ ratio }) => {
        setProcessingProgress(Math.round(ratio * 100));
      });
      
      // Run FFmpeg command
      await ffmpeg.run(
        '-i', 'input.mp4',
        '-ss', `${startTime}`,
        '-t', `${duration}`,
        '-c:v', 'copy',
        '-c:a', 'copy',
        'output.mp4'
      );
      
      // Read the output file
      const data = ffmpeg.FS('readFile', 'output.mp4');
      
      // Create a URL for the output file
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
      
      // Store the output file
      setOutputFiles(prev => ({
        ...prev,
        [outputName]: url
      }));
      
    } catch (error) {
      console.error('Error trimming video:', error);
      throw error;
    }
  };

  const processConvert = async (data) => {
    const { inputFile, outputName, options } = data;
    const { format, quality } = options;
    
    try {
      // Write the input file to memory
      ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(inputFile));
      
      // Set quality parameters
      let outputOptions = [];
      if (quality === 'low') {
        outputOptions = ['-crf', '28'];
      } else if (quality === 'medium') {
        outputOptions = ['-crf', '23'];
      } else if (quality === 'high') {
        outputOptions = ['-crf', '18'];
      }
      
      // Progress updates
      ffmpeg.setProgress(({ ratio }) => {
        setProcessingProgress(Math.round(ratio * 100));
      });
      
      // Run FFmpeg command
      await ffmpeg.run(
        '-i', 'input.mp4',
        ...outputOptions,
        `output.${format}`
      );
      
      // Read the output file
      const data = ffmpeg.FS('readFile', `output.${format}`);
      
      // Create a URL for the output file
      const url = URL.createObjectURL(new Blob([data.buffer], { type: `video/${format}` }));
      
      // Store the output file
      setOutputFiles(prev => ({
        ...prev,
        [outputName]: url
      }));
      
    } catch (error) {
      console.error('Error converting video:', error);
      throw error;
    }
  };

  return (
    <ProcessingContext.Provider
      value={{
        videoFile,
        videoUrl,
        isFFmpegLoaded,
        processingProgress,
        outputFiles,
        handleFileUpload,
        addToProcessingQueue
      }}
    >
      {children}
    </ProcessingContext.Provider>
  );
};