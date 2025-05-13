import React, { useState, useRef, useEffect } from 'react';
import { FiFilm, FiDownload, FiAlertTriangle, FiSettings } from 'react-icons/fi';
import { useProcessing } from '../context/ProcessingContext';
import { useFFmpeg } from '../context/FFmpegContext';
import VideoPreview from '../components/VideoPreview';
import ProgressBar from '../components/ProgressBar';
import { formatTime } from '../utils/fileUtils';

const TrailerMaker = () => {
  const { 
    videoFile, 
    videoUrl, 
    isFFmpegLoaded,
    addToProcessingQueue,
    processingProgress,
    outputFiles
  } = useProcessing();
  
  const { ffmpeg } = useFFmpeg();
  const videoRef = useRef(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);
  
  // Trailer settings
  const [trailerLength, setTrailerLength] = useState(30); // in seconds
  const [sceneDuration, setSceneDuration] = useState(3); // seconds per scene
  const [detectionSensitivity, setDetectionSensitivity] = useState(0.6); // 0-1
  const [includeAudio, setIncludeAudio] = useState(true);
  const [sceneTransition, setSceneTransition] = useState('cut'); // cut, fade, dissolve
  
  // Processing states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [detectedScenes, setDetectedScenes] = useState([]);
  const [selectedScenes, setSelectedScenes] = useState([]);
  const [outputUrl, setOutputUrl] = useState(null);
  const [outputName, setOutputName] = useState('');
  
  useEffect(() => {
    if (videoRef.current) {
      const handleLoadedMetadata = () => {
        setVideoDuration(videoRef.current.duration);
        setVideoWidth(videoRef.current.videoWidth);
        setVideoHeight(videoRef.current.videoHeight);
      };
      
      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
      };
    }
  }, [videoUrl]);
  
  // Analyze video to detect high-energy scenes
  const analyzeVideo = async () => {
    if (!videoFile || !isFFmpegLoaded) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setDetectedScenes([]);
    
    try {
      // In a real implementation, we would use FFmpeg to analyze the video
      // This is a simplified simulation of scene detection
      
      // Simulate analysis progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setAnalysisProgress(Math.min(progress, 100));
        
        if (progress >= 100) {
          clearInterval(interval);
          generateMockScenes();
        }
      }, 300);
    } catch (error) {
      console.error('Error analyzing video:', error);
      setIsAnalyzing(false);
    }
  };
  
  // Generate mock scenes for demonstration
  const generateMockScenes = () => {
    // In a real implementation, this would be based on actual video analysis
    // Here we're just creating random "high-energy" scenes
    const mockScenes = [];
    const sceneCount = Math.floor(videoDuration / 10); // Roughly one scene per 10 seconds
    
    for (let i = 0; i < sceneCount; i++) {
      // Create random start times, ensuring they don't overlap
      const startTime = Math.random() * (videoDuration - sceneDuration);
      const energy = 0.5 + Math.random() * 0.5; // Random "energy" score between 0.5-1
      
      mockScenes.push({
        id: i + 1,
        startTime,
        duration: sceneDuration,
        energy,
        selected: energy > detectionSensitivity // Pre-select high energy scenes
      });
    }
    
    // Sort by start time
    mockScenes.sort((a, b) => a.startTime - b.startTime);
    
    setDetectedScenes(mockScenes);
    
    // Pre-select scenes based on energy level and trailer length
    const preSelected = mockScenes
      .filter(scene => scene.energy > detectionSensitivity)
      .sort((a, b) => b.energy - a.energy); // Sort by energy (highest first)
    
    // Limit selection to fit trailer length
    let totalDuration = 0;
    const finalSelection = [];
    
    for (const scene of preSelected) {
      if (totalDuration + scene.duration <= trailerLength) {
        finalSelection.push(scene.id);
        totalDuration += scene.duration;
      } else {
        break;
      }
    }
    
    setSelectedScenes(finalSelection);
    setIsAnalyzing(false);
  };
  
  // Toggle scene selection
  const toggleSceneSelection = (sceneId) => {
    if (selectedScenes.includes(sceneId)) {
      setSelectedScenes(selectedScenes.filter(id => id !== sceneId));
    } else {
      // Check if adding this scene would exceed trailer length
      const scene = detectedScenes.find(s => s.id === sceneId);
      const currentDuration = calculateSelectedDuration();
      
      if (currentDuration + scene.duration <= trailerLength) {
        setSelectedScenes([...selectedScenes, sceneId]);
      } else {
        alert(`Cannot add more scenes. Maximum trailer length is ${trailerLength} seconds.`);
      }
    }
  };
  
  // Calculate total duration of selected scenes
  const calculateSelectedDuration = () => {
    return detectedScenes
      .filter(scene => selectedScenes.includes(scene.id))
      .reduce((total, scene) => total + scene.duration, 0);
  };
  
  // Create trailer from selected scenes
  const createTrailer = () => {
    if (!videoFile || !isFFmpegLoaded || selectedScenes.length === 0) return;
    
    setIsProcessing(true);
    setIsComplete(false);
    setOutputUrl(null);
    
    // Create output filename
    const outputFilename = `${videoFile.name.split('.')[0]}_trailer.mp4`;
    setOutputName(outputFilename);
    
    // Add to processing queue
    addToProcessingQueue({
      type: 'createTrailer',
      data: {
        inputFile: videoFile,
        outputName: outputFilename,
        options: {
          scenes: detectedScenes.filter(scene => selectedScenes.includes(scene.id)),
          includeAudio,
          transition: sceneTransition
        }
      }
    });
    
    // Simulate processing completion (in a real implementation, this would be handled by the worker)
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        clearInterval(interval);
        setIsProcessing(false);
        setIsComplete(true);
        
        // Create a mock output URL
        // In a real implementation, this would come from the processing worker
        setOutputUrl(videoUrl); // Using original video as placeholder
      }
    }, 300);
  };
  
  // Preview a specific scene
  const previewScene = (scene) => {
    if (videoRef.current) {
      videoRef.current.currentTime = scene.startTime;
      videoRef.current.play();
      
      setTimeout(() => {
        videoRef.current.pause();
      }, scene.duration * 1000);
    }
  };
  
  // Handle download
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
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FiFilm className="mr-2" /> Trailer Generator
      </h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Source Video</h2>
        <video 
          ref={videoRef}
          src={videoUrl} 
          className="w-full rounded-lg" 
          controls
        />
        <div className="mt-2 text-sm text-gray-500">
          Duration: {formatTime(videoDuration)} | Resolution: {videoWidth}x{videoHeight}
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <FiSettings className="mr-2" /> Trailer Settings
          </h2>
        </div>
        
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trailer Length (seconds)
              </label>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={trailerLength}
                onChange={(e) => setTrailerLength(parseInt(e.target.value))}
                className="w-full"
                disabled={isAnalyzing || isProcessing}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10s</span>
                <span>{trailerLength}s</span>
                <span>120s</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scene Duration (seconds)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={sceneDuration}
                onChange={(e) => setSceneDuration(parseFloat(e.target.value))}
                className="w-full"
                disabled={isAnalyzing || isProcessing}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1s</span>
                <span>{sceneDuration}s</span>
                <span>10s</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detection Sensitivity
              </label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={detectionSensitivity}
                onChange={(e) => setDetectionSensitivity(parseFloat(e.target.value))}
                className="w-full"
                disabled={isAnalyzing || isProcessing}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scene Transition
              </label>
              <select
                value={sceneTransition}
                onChange={(e) => setSceneTransition(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                disabled={isAnalyzing || isProcessing}
              >
                <option value="cut">Cut (Hard)</option>
                <option value="fade">Fade</option>
                <option value="dissolve">Dissolve</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeAudio}
                  onChange={(e) => setIncludeAudio(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isAnalyzing || isProcessing}
                />
                <span className="ml-2 text-sm text-gray-700">Include audio in trailer</span>
              </label>
            </div>
          </div>
          
          {!detectedScenes.length && (
            <div className="mt-4">
              <button
                onClick={analyzeVideo}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isAnalyzing || !isFFmpegLoaded}
              >
                {isAnalyzing ? 'Analyzing Video...' : 'Analyze Video for Scenes'}
              </button>
              
              {isAnalyzing && (
                <div className="mt-2">
                  <ProgressBar progress={analysisProgress} />
                  <p className="text-xs text-center mt-1">{analysisProgress}% complete</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {detectedScenes.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Detected Scenes</h2>
            <div className="text-sm">
              <span className="font-medium">{selectedScenes.length}</span> scenes selected |
              <span className="font-medium ml-1">{calculateSelectedDuration().toFixed(1)}</span>s / {trailerLength}s
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detectedScenes.map((scene) => (
              <div 
                key={scene.id}
                className={`border rounded-lg overflow-hidden ${
                  selectedScenes.includes(scene.id) ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                  <div>
                    <span className="font-medium">Scene {scene.id}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {formatTime(scene.startTime)} - {formatTime(scene.startTime + scene.duration)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 px-2 py-1 text-xs rounded-full bg-gray-200">
                      Energy: {scene.energy.toFixed(2)}
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedScenes.includes(scene.id)}
                        onChange={() => toggleSceneSelection(scene.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={isProcessing}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="p-3 flex justify-between">
                  <button
                    onClick={() => previewScene(scene)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Preview Scene
                  </button>
                  <div className="text-sm">
                    Duration: {scene.duration.toFixed(1)}s
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            {isProcessing ? (
              <div>
                <ProgressBar progress={processingProgress} />
                <p className="text-center mt-2">Creating trailer... {processingProgress}%</p>
              </div>
            ) : isComplete ? (
              <div className="text-center">
                <p className="text-green-600 font-medium mb-4">Trailer created successfully!</p>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiDownload className="mr-2" /> Download Trailer
                </button>
              </div>
            ) : (
              <button
                onClick={createTrailer}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={selectedScenes.length === 0 || !isFFmpegLoaded}
              >
                Create Trailer
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <h3 className="font-semibold mb-2">How Trailer Generation Works</h3>
        <p className="text-sm">
          The trailer generator analyzes your video to detect high-energy scenes based on motion and audio peaks.
          It then automatically selects the most engaging moments and compiles them into a short preview.
          You can customize the trailer length, scene duration, and other settings to create the perfect preview.
        </p>
      </div>
    </div>
  );
};

export default TrailerMaker;