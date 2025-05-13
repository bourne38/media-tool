import React, { useState } from 'react';
import { FiRepeat, FiDownload, FiAlertTriangle } from 'react-icons/fi';
import { useProcessing } from '../context/ProcessingContext';
import VideoPreview from '../components/VideoPreview';
import ProgressBar from '../components/ProgressBar';

const Convert = () => {
  const { 
    videoFile, 
    videoUrl, 
    isFFmpegLoaded,
    addToProcessingQueue,
    processingProgress
  } = useProcessing();
  
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [quality, setQuality] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [outputUrl, setOutputUrl] = useState(null);
  const [outputName, setOutputName] = useState('');
  
  const handleConvert = () => {
    if (!videoFile || !isFFmpegLoaded) return;
    
    setIsProcessing(true);
    setIsComplete(false);
    setOutputUrl(null);
    
    // Create output filename
    const originalName = videoFile.name.split('.')[0];
    const outputFilename = `${originalName}.${outputFormat}`;
    setOutputName(outputFilename);
    
    // Add to processing queue
    addToProcessingQueue({
      type: 'convert',
      data: {
        inputFile: videoFile,
        outputName: outputFilename,
        options: {
          format: outputFormat,
          quality
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
      <h1 className="text-2xl font-bold mb-6">Convert Video Format</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Source Video</h2>
        <VideoPreview src={videoUrl} />
        <div className="mt-2 text-sm text-gray-500">
          Current format: {videoFile.name.split('.').pop().toUpperCase()}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FiRepeat className="mr-2" /> Conversion Settings
        </h2>
        
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Output Format
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              disabled={isProcessing}
            >
              <option value="mp4">MP4 (Most Compatible)</option>
              <option value="webm">WebM (Web Optimized)</option>
              <option value="mov">MOV (Apple QuickTime)</option>
              <option value="avi">AVI (Windows)</option>
              <option value="mkv">MKV (High Quality)</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quality
            </label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              disabled={isProcessing}
            >
              <option value="low">Low (Smaller file size)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Better quality, larger file)</option>
            </select>
          </div>
          
          <div className="mt-6">
            {isProcessing ? (
              <div>
                <ProgressBar progress={processingProgress} />
                <p className="text-center mt-2">Converting video... {processingProgress}%</p>
              </div>
            ) : isComplete ? (
              <div className="text-center">
                <p className="text-green-600 font-medium mb-4">Video converted successfully!</p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiDownload className="mr-2" /> Download Converted Video
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConvert}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={!isFFmpegLoaded}
              >
                {isFFmpegLoaded ? 'Convert Video' : 'Loading FFmpeg...'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <h3 className="font-semibold mb-2">About Video Conversion</h3>
        <p className="text-sm">
          Converting video formats allows you to optimize your videos for different platforms and devices.
          MP4 is the most widely compatible format, while WebM is optimized for web playback.
          MOV is preferred for Apple devices, and MKV offers high quality with larger file sizes.
        </p>
      </div>
    </div>
  );
};

export default Convert;