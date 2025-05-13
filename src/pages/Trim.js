import React, { useState, useRef, useEffect } from 'react';
import { FiScissors, FiDownload, FiAlertTriangle } from 'react-icons/fi';
import { useProcessing } from '../context/ProcessingContext';
import ProgressBar from '../components/ProgressBar';

const Trim = () => {
  const { 
    videoFile, 
    videoUrl, 
    isFFmpegLoaded,
    addToProcessingQueue,
    processingProgress
  } = useProcessing();
  
  const videoRef = useRef(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [outputUrl, setOutputUrl] = useState(null);
  const [outputName, setOutputName] = useState('');
  
  useEffect(() => {
    if (videoRef.current) {
      const handleLoadedMetadata = () => {
        const duration = videoRef.current.duration;
        setVideoDuration(duration);
        setEndTime(duration);
      };
      
      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
      };
    }
  }, [videoUrl]);
  
  useEffect(() => {
    if (videoRef.current) {
      const handleTimeUpdate = () => {
        setCurrentTime(videoRef.current.currentTime);
      };
      
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        }
      };
    }
  }, []);
  
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };
  
  const handleStartTimeChange = (e) => {
    const newStartTime = parseFloat(e.target.value);
    if (newStartTime < endTime) {
      setStartTime(newStartTime);
      if (videoRef.current) {
        videoRef.current.currentTime = newStartTime;
      }
    }
  };
  
  const handleEndTimeChange = (e) => {
    const newEndTime = parseFloat(e.target.value);
    if (newEndTime > startTime && newEndTime <= videoDuration) {
      setEndTime(newEndTime);
    }
  };
  
  const handleSetStartTime = () => {
    if (videoRef.current && currentTime < endTime) {
      setStartTime(currentTime);
    }
  };
  
  const handleSetEndTime = () => {
    if (videoRef.current && currentTime > startTime) {
      setEndTime(currentTime);
    }
  };
  
  const handlePreviewSection = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
      
      const stopPreviewAt = setTimeout(() => {
        videoRef.current.pause();
      }, (endTime - startTime) * 1000);
      
      return () => clearTimeout(stopPreviewAt);
    }
  };
  
  const handleTrimVideo = () => {
    if (!videoFile || !isFFmpegLoaded) return;
    
    setIsProcessing(true);
    setIsComplete(false);
    setOutputUrl(null);
    
    // Create output filename
    const originalName = videoFile.name.split('.')[0];
    const extension = videoFile.name.split('.').pop();
    const outputFilename = `${originalName}_trimmed.${extension}`;
    setOutputName(outputFilename);
    
    // Add to processing queue
    addToProcessingQueue({
      type: 'trimVideo',
      data: {
        inputFile: videoFile,
        outputName: outputFilename,
        options: {
          startTime,
          endTime,
          duration: endTime - startTime
        }
      }
    });
    
    // Listen for completion
    const checkQueue = setInterval(() => {
      if (processingProgress === 100) {
        clearInterval(checkQueue);
        setIsProcessing(false);
        setIsComplete(true);
      }
    }, 500);
  };
  
  const handleDownload = () => {
    if (!outputUrl) return;
    
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = outputName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  if (!videoFile) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <FiAlertTriangle className="h-6 w-6 text-yellow-400 mr-3" />
            <p>Please upload a video on the home page first.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Trim Video</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Preview</h2>
        <div className="relative">
          <video 
            ref={videoRef}
            src={videoUrl} 
            className="w-full rounded-lg" 
            controls
          />
          <div className="mt-2 text-sm text-gray-500 text-center">
            Current Time: {formatTime(currentTime)} / Total Duration: {formatTime(videoDuration)}
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FiScissors className="mr-2" /> Trim Settings
        </h2>
        
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Start Time: {formatTime(startTime)}
              </label>
              <button
                type="button"
                onClick={handleSetStartTime}
                className="text-xs text-blue-600 hover:text-blue-800"
                disabled={isProcessing}
              >
                Set to current position
              </button>
            </div>
            <input
              type="range"
              min="0"
              max={videoDuration}
              step="0.01"
              value={startTime}
              onChange={handleStartTimeChange}
              className="w-full"
              disabled={isProcessing}
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                End Time: {formatTime(endTime)}
              </label>
              <button
                type="button"
                onClick={handleSetEndTime}
                className="text-xs text-blue-600 hover:text-blue-800"
                disabled={isProcessing}
              >
                Set to current position
              </button>
            </div>
            <input
              type="range"
              min="0"
              max={videoDuration}
              step="0.01"
              value={endTime}
              onChange={handleEndTimeChange}
              className="w-full"
              disabled={isProcessing}
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm">
              <span>Selected Duration: {formatTime(endTime - startTime)}</span>
              <button
                type="button"
                onClick={handlePreviewSection}
                className="text-blue-600 hover:text-blue-800"
                disabled={isProcessing}
              >
                Preview Section
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            {isProcessing ? (
              <div>
                <ProgressBar progress={processingProgress} />
                <p className="text-center mt-2">Trimming video... {processingProgress}%</p>
              </div>
            ) : isComplete ? (
              <div className="text-center">
                <p className="text-green-600 font-medium mb-4">Video trimmed successfully!</p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiDownload className="mr-2" /> Download Trimmed Video
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleTrimVideo}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={!isFFmpegLoaded || startTime >= endTime}
              >
                {isFFmpegLoaded ? 'Trim Video' : 'Loading FFmpeg...'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <h3 className="font-semibold mb-2">About Video Trimming</h3>
        <p className="text-sm">
          Trimming allows you to cut out unwanted parts of your video. Simply set the start and end points,
          preview the selection to make sure it's correct, and then process the video.
          The original video remains unchanged, and a new trimmed version will be created.
        </p>
      </div>
    </div>
  );
};

export default Trim;