import React from 'react';
import { Link } from 'react-router-dom';
import { FiVideo, FiImage, FiScissors, FiEdit } from 'react-icons/fi';
import VideoUploader from '../components/VideoUploader';
import { useProcessing } from '../context/ProcessingContext';

const Home = () => {
  const { videoFile } = useProcessing();

  const features = [
    {
      icon: <FiVideo className="w-8 h-8 text-blue-500" />,
      title: 'MOV to MP4 Converter',
      description: 'Convert MOV videos to MP4 format with customizable bitrate settings.',
      path: '/convert'
    },
    {
      icon: <FiImage className="w-8 h-8 text-green-500" />,
      title: 'MP4 to GIF Maker',
      description: 'Create animated GIFs from your videos with custom duration, frame rate, and size.',
      path: '/gif'
    },
    {
      icon: <FiScissors className="w-8 h-8 text-purple-500" />,
      title: 'Video Trimmer',
      description: 'Cut your videos by selecting precise start and end times.',
      path: '/trim'
    },
    {
      icon: <FiEdit className="w-8 h-8 text-orange-500" />,
      title: 'Video Watermarking',
      description: 'Add text or image watermarks to your videos with customizable position and opacity.',
      path: '/watermark'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Client-Side Video Processing</h1>
        <p className="text-lg text-gray-600">
          Process your videos directly in your browser - no uploads, no servers, complete privacy.
        </p>
      </div>
      
      {!videoFile ? (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Upload a Video to Get Started</h2>
          <VideoUploader />
        </div>
      ) : (
        <div className="mb-12 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <FiVideo className="mr-2" /> Video Ready for Processing
          </h2>
          <p className="mb-2">
            <strong>File:</strong> {videoFile.name}
          </p>
          <p className="mb-4">
            <strong>Size:</strong> {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
          </p>
          <p>Choose a processing option below to continue.</p>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={videoFile ? feature.path : '#'}
            className={`block p-6 border rounded-lg transition-all ${
              videoFile 
                ? 'border-gray-200 hover:border-blue-500 hover:shadow-md' 
                : 'border-gray-200 opacity-50 cursor-not-allowed'
            }`}
            onClick={(e) => !videoFile && e.preventDefault()}
          >
            <div className="flex flex-col">
              <div className="flex items-center mb-2">
                {feature.icon}
                <h3 className="ml-2 font-semibold">{feature.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-12 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">How It Works</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>All processing happens directly in your browser - no data is sent to any server.</li>
          <li>Uses WebAssembly technology (FFmpeg.wasm) to process videos with the power of FFmpeg.</li>
          <li>Large videos may take longer to process and use more memory.</li>
          <li>For best performance, use Chrome, Firefox, or Edge on a desktop computer.</li>
        </ul>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Privacy First</h2>
        <p>
          Your videos never leave your device. All processing happens locally in your browser,
          ensuring complete privacy and security for your media files.
        </p>
      </div>
    </div>
  );
};

export default Home;