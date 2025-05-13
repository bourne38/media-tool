import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiDownload, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { useProcessing } from '../context/ProcessingContext';
import VideoPreview from '../components/VideoPreview';
import TimelineSlider from '../components/TimelineSlider';
import ProgressBar from '../components/ProgressBar';
import { formatTime } from '../utils/fileUtils';

const GifMaker = () => {
  const { 
    videoFile, 
    videoUrl, 
    videoDuration,
    videoWidth,
    videoHeight,
    isFFmpegLoaded,
    addToProcessingQueue,
    processingProgress
  } = useProcessing();
  
  const [segments, setSegments] = useState([
    { id: 1, startTime: 0, duration: 3, fps: 15, width: 320, height: 240 }
  ]);
  const [processingSegmentId, setProcessingSegmentId] = useState(null);
  const [completedSegments, setCompletedSegments] = useState({});
  
  const fpsOptions = [
    { value: 10, label: '10 FPS' },
    { value: 15, label: '15 FPS' },
    { value: 20, label: '20 FPS' },
    { value: 30, label: '30 FPS' }
  ];
  
  const resolutionOptions = [
    { value: { width: 160, height: 120 }, label: '160x120 (Tiny)' },
    { value: { width: 320, height: 240 }, label: '320x240 (Small)' },
    { value: { width: 640, height: 480 }, label: '640x480 (Medium)' },
    { value: { width: 854, height: 480 }, label: '854x480 (Large)' }
  ];
  
  const handleAddSegment = () => {
    const newId = segments.length > 0 
      ? Math.max(...segments.map(s => s.id)) + 1 
      : 1;
      
    setSegments([
      ...segments,
      { id: newId, startTime: 0, duration: 3, fps: 15, width: 320, height: 240 }
    ]);
  };
  
  const handleRemoveSegment = (id) => {
    setSegments(segments.filter(segment => segment.id !== id));
    
    // Remove from completed segments if exists
    if (completedSegments[id]) {
      const newCompleted = { ...completedSegments };
      delete newCompleted[id];
      setCompletedSegments(newCompleted);
    }
  };
  
  const handleSegmentChange = (id, field, value) => {
    setSegments(segments.map(segment => {
      if (segment.id === id) {
        return { ...segment, [field]: value };
      }
      return segment;
    }));
  };
  
  const handleResolutionChange = (id, resolution) => {
    setSegments(segments.map(segment => {
      if (segment.id === id) {
        return { ...segment, ...resolution };
      }
      return segment;
    }));
  };
  
  const handleCreateGif = (segment) => {
    if (!videoFile || !isFFmpegLoaded) return;
    
    setProcessingSegmentId(segment.id);
    
    const outputName = `${videoFile.name.split('.')[0]}_gif_${segment.id}.gif`;
    
    addToProcessingQueue({
      type: 'createGif',
      data: {
        inputFile: videoFile,
        outputName,
        options: {
          startTime: segment.startTime,
          duration: segment.duration,
          fps: segment.fps,
          width: segment.width,
          height: segment.height
        }
      }
    });
    
    // Listen for completion
    const checkQueue = setInterval(() => {
      if (processingProgress === 100) {
        clearInterval(checkQueue);
        setProcessingSegmentId(null);
        
        // Add to completed segments
        setCompletedSegments(prev => ({
          ...prev,
          [segment.id]: {
            name: outputName,
            url: URL.createObjectURL(new Blob(/* data would come from worker */))
          }
        }));
      }
    }, 500);
  };
  
  const handleDownload = (segmentId) => {
    if (!completedSegments[segmentId]) return;
    
    const a = document.createElement('a');
    a.href = completedSegments[segmentId].url;
    a.download = completedSegments[segmentId].name;
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
      <h1 className="text-2xl font-bold mb-6">MP4 to GIF Maker</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Source Video</h2>
        <VideoPreview src={videoUrl} />
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Duration: {formatTime(videoDuration)} | Resolution: {videoWidth}x{videoHeight}
          </p>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">GIF Segments</h2>
          <button
            onClick={handleAddSegment}
            className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            aria-label="Add segment"
          >
            <FiPlus className="mr-1" /> Add Segment
          </button>
        </div>
        
        {segments.map((segment) => (
          <div 
            key={segment.id}
            className={`mb-6 p-4 border rounded-lg ${
              processingSegmentId === segment.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium">Segment #{segment.id}</h3>
              <button
                onClick={() => handleRemoveSegment(segment.id)}
                className="text-red-500 hover:text-red-700 transition"
                aria-label="Remove segment"
                disabled={processingSegmentId === segment.id}
              >
                <FiTrash2 />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Time Segment
              </label>
              <TimelineSlider
                duration={videoDuration}
                startTime={segment.startTime}
                segmentDuration={segment.duration}
                onChange={(start, duration) => {
                  handleSegmentChange(segment.id, 'startTime', start);
                  handleSegmentChange(segment.id, 'duration', duration);
                }}
                disabled={processingSegmentId === segment.id}
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Start: {formatTime(segment.startTime)}</span>
                <span>Duration: {segment.duration}s</span>
                <span>End: {formatTime(segment.startTime + segment.duration)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frame Rate
                </label>
                <select
                  value={segment.fps}
                  onChange={(e) => handleSegmentChange(segment.id, 'fps', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={processingSegmentId === segment.id}
                >
                  {fpsOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution
                </label>
                <select
                  value={`${segment.width}x${segment.height}`}
                  onChange={(e) => {
                    const selected = resolutionOptions.find(
                      option => `${option.value.width}x${option.value.height}` === e.target.value
                    );
                    if (selected) {
                      handleResolutionChange(segment.id, selected.value);
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={processingSegmentId === segment.id}
                >
                  {resolutionOptions.map((option) => (
                    <option 
                      key={`${option.value.width}x${option.value.height}`} 
                      value={`${option.value.width}x${option.value.height}`}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              {processingSegmentId === segment.id ? (
                <div className="w-full">
                  <ProgressBar progress={processingProgress} />
                  <p className="text-sm text-center mt-1">Processing... {processingProgress}%</p>
                </div>
              ) : completedSegments[segment.id] ? (
                <div className="flex items-center space-x-4 w-full">
                  <div className="flex-1 flex items-center bg-green-50 p-2 rounded">
                    <FiCheck className="text-green-500 mr-2" />
                    <span className="text-sm">GIF created successfully!</span>
                  </div>
                  <button
                    onClick={() => handleDownload(segment.id)}
                    className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    <FiDownload className="mr-1" /> Download
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleCreateGif(segment)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  disabled={!isFFmpegLoaded}
                >
                  Create GIF
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <FiAlertTriangle className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium">Processing Information</p>
            <p className="text-sm mt-1">
              All processing happens directly in your browser. Large videos or high-resolution GIFs may take longer to process and use more memory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GifMaker;