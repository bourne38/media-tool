import React, { useState, useRef } from 'react';
import { FiEdit, FiImage, FiType, FiDownload, FiAlertTriangle } from 'react-icons/fi';
import { useProcessing } from '../context/ProcessingContext';
import VideoPreview from '../components/VideoPreview';
import ProgressBar from '../components/ProgressBar';

const Watermark = () => {
  const { 
    videoFile, 
    videoUrl, 
    videoWidth,
    videoHeight,
    isFFmpegLoaded,
    addToProcessingQueue,
    processingProgress
  } = useProcessing();
  
  const [watermarkType, setWatermarkType] = useState('text');
  const [watermarkText, setWatermarkText] = useState('© My Video');
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [watermarkImageUrl, setWatermarkImageUrl] = useState(null);
  const [position, setPosition] = useState({ x: 'W-w-10', y: 'H-h-10' }); // Bottom right
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#ffffff');
  const [opacity, setOpacity] = useState(0.7);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [outputUrl, setOutputUrl] = useState(null);
  const [outputName, setOutputName] = useState('');
  
  const imageInputRef = useRef(null);
  
  const positionOptions = [
    { value: { x: '10', y: '10' }, label: 'Top Left' },
    { value: { x: 'W/2-w/2', y: '10' }, label: 'Top Center' },
    { value: { x: 'W-w-10', y: '10' }, label: 'Top Right' },
    { value: { x: '10', y: 'H/2-h/2' }, label: 'Middle Left' },
    { value: { x: 'W/2-w/2', y: 'H/2-h/2' }, label: 'Center' },
    { value: { x: 'W-w-10', y: 'H/2-h/2' }, label: 'Middle Right' },
    { value: { x: '10', y: 'H-h-10' }, label: 'Bottom Left' },
    { value: { x: 'W/2-w/2', y: 'H-h-10' }, label: 'Bottom Center' },
    { value: { x: 'W-w-10', y: 'H-h-10' }, label: 'Bottom Right' }
  ];
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setWatermarkImage(file);
      setWatermarkImageUrl(URL.createObjectURL(file));
    }
  };
  
  const handlePositionChange = (e) => {
    const selectedPosition = positionOptions.find(
      option => `${option.value.x},${option.value.y}` === e.target.value
    );
    if (selectedPosition) {
      setPosition(selectedPosition.value);
    }
  };
  
  const handleWatermark = () => {
    if (!videoFile || !isFFmpegLoaded) return;
    
    setIsProcessing(true);
    setIsComplete(false);
    setOutputUrl(null);
    
    // Create output filename
    const outputFilename = `${videoFile.name.split('.')[0]}_watermarked.mp4`;
    setOutputName(outputFilename);
    
    // Add to processing queue
    addToProcessingQueue({
      type: 'watermarkVideo',
      data: {
        inputFile: videoFile,
        watermarkFile: watermarkType === 'image' ? watermarkImage : null,
        outputName: outputFilename,
        options: {
          type: watermarkType,
          text: watermarkText,
          fontSize,
          color: textColor,
          position,
          opacity
        }
      }
    });
    
    // Listen for completion
    const checkQueue = setInterval(() => {
      if (processingProgress === 100) {
        clearInterval(checkQueue);
        setIsProcessing(false);
        setIsComplete(true);
        
        // In a real implementation, we would get the output URL from the context
        // This is a placeholder for demonstration
        // setOutputUrl(URL.createObjectURL(new Blob([/* data from worker */])));
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
      <h1 className="text-2xl font-bold mb-6">Add Watermark to Video</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Source Video</h2>
        <VideoPreview src={videoUrl} />
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FiEdit className="mr-2" /> Watermark Settings
        </h2>
        
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Watermark Type
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="text"
                  checked={watermarkType === 'text'}
                  onChange={() => setWatermarkType('text')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  disabled={isProcessing}
                />
                <span className="ml-2 flex items-center">
                  <FiType className="mr-1" /> Text
                </span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="image"
                  checked={watermarkType === 'image'}
                  onChange={() => setWatermarkType('image')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  disabled={isProcessing}
                />
                <span className="ml-2 flex items-center">
                  <FiImage className="mr-1" /> Image
                </span>
              </label>
            </div>
          </div>
          
          {watermarkType === 'text' ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Watermark Text
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter watermark text"
                disabled={isProcessing}
              />
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Size
                  </label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded"
                    disabled={isProcessing}
                  >
                    <option value="16">Small (16px)</option>
                    <option value="24">Medium (24px)</option>
                    <option value="36">Large (36px)</option>
                    <option value="48">Extra Large (48px)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full p-1 h-10 border border-gray-300 rounded"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Watermark Image
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => imageInputRef.current.click()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  Select Image
                </button>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <span className="ml-3 text-sm text-gray-500">
                  {watermarkImage ? watermarkImage.name : 'No image selected'}
                </span>
              </div>
              
              {watermarkImageUrl && (
                <div className="mt-2">
                  <img
                    src={watermarkImageUrl}
                    alt="Watermark preview"
                    className="h-16 object-contain border border-gray-200 rounded p-1"
                  />
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                value={`${position.x},${position.y}`}
                onChange={handlePositionChange}
                className="w-full p-2 border border-gray-300 rounded"
                disabled={isProcessing}
              >
                {positionOptions.map((option, index) => (
                  <option 
                    key={index} 
                    value={`${option.value.x},${option.value.y}`}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opacity
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full"
                disabled={isProcessing}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10%</span>
                <span>{Math.round(opacity * 100)}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            {isProcessing ? (
              <div>
                <ProgressBar progress={processingProgress} />
                <p className="text-center mt-2">Adding watermark... {processingProgress}%</p>
              </div>
            ) : isComplete ? (
              <div className="text-center">
                <p className="text-green-600 font-medium mb-4">Watermark added successfully!</p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiDownload className="mr-2" /> Download Watermarked Video
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleWatermark}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={!isFFmpegLoaded || (watermarkType === 'image' && !watermarkImage)}
              >
                {isFFmpegLoaded ? 'Add Watermark' : 'Loading FFmpeg...'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <h3 className="font-semibold mb-2">About Video Watermarking</h3>
        <p className="text-sm">
          Adding a watermark helps protect your video content and establish brand identity. 
          Text watermarks are simple and effective, while image watermarks allow for logos and custom graphics.
          Adjust the opacity to make the watermark more subtle or prominent.
        </p>
      </div>
    </div>
  );
};

export default Watermark;