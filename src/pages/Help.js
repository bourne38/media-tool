import React from 'react';
import { FiHelpCircle, FiVideo, FiScissors, FiImage, FiRepeat, FiUpload } from 'react-icons/fi';

const Help = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FiHelpCircle className="mr-2" /> Help & Documentation
      </h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="mb-4">
            Welcome to Video Processor, a browser-based tool for common video editing tasks.
            All processing happens locally in your browser - your videos are never uploaded to any server.
          </p>
          
          <div className="flex items-start mb-4">
            <FiUpload className="mt-1 mr-3 text-blue-500" />
            <div>
              <h3 className="font-medium">Step 1: Upload a Video</h3>
              <p className="text-sm text-gray-600">
                Start by uploading a video file on the home page. You can drag and drop a file or click to browse.
                Supported formats include MP4, MOV, AVI, and other common video formats.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FiVideo className="mt-1 mr-3 text-blue-500" />
            <div>
              <h3 className="font-medium">Step 2: Choose an Operation</h3>
              <p className="text-sm text-gray-600">
                After uploading, navigate to any of the processing pages using the navigation menu.
                Each page offers different functionality for working with your video.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Available Features</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start">
              <FiRepeat className="mt-1 mr-3 text-green-500" />
              <div>
                <h3 className="font-medium">Convert Video Format</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Convert your videos between different formats like MP4, WebM, MOV, and more.
                  Useful for ensuring compatibility with different devices and platforms.
                </p>
                <div className="text-xs bg-gray-100 p-2 rounded">
                  <strong>Tip:</strong> MP4 is the most widely compatible format for sharing videos online.
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start">
              <FiScissors className="mt-1 mr-3 text-red-500" />
              <div>
                <h3 className="font-medium">Trim Video</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Cut out unwanted parts of your video by setting start and end points.
                  Perfect for removing intros, outros, or any sections you don't need.
                </p>
                <div className="text-xs bg-gray-100 p-2 rounded">
                  <strong>Tip:</strong> Use the "Preview Section" button to make sure you've selected the right part before processing.
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start">
              <FiImage className="mt-1 mr-3 text-purple-500" />
              <div>
                <h3 className="font-medium">Create GIF</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Turn a section of your video into an animated GIF.
                  Great for creating shareable clips for social media.
                </p>
                <div className="text-xs bg-gray-100 p-2 rounded">
                  <strong>Tip:</strong> Keep GIFs short (1-5 seconds) and use a lower frame rate for smaller file sizes.
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start">
              <FiImage className="mt-1 mr-3 text-yellow-500" />
              <div>
                <h3 className="font-medium">Add Watermark</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Add text or image watermarks to your videos.
                  Useful for branding or protecting your content.
                </p>
                <div className="text-xs bg-gray-100 p-2 rounded">
                  <strong>Tip:</strong> Use semi-transparent watermarks (50-70% opacity) so they don't distract from the video content.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">Is there a limit to the file size I can process?</h3>
            <p className="text-sm text-gray-600">
              Since all processing happens in your browser, the main limitation is your device's memory.
              For most modern computers, files up to 500MB should work fine. Larger files may cause performance issues.
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">Why is video processing slow?</h3>
            <p className="text-sm text-gray-600">
              Video processing is computationally intensive. Since everything runs in your browser without server assistance,
              the speed depends on your device's processing power. Larger files and higher quality settings will take longer to process.
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">Are my videos uploaded to any server?</h3>
            <p className="text-sm text-gray-600">
              No. All processing happens locally in your browser using WebAssembly technology.
              Your videos never leave your device, making this tool privacy-friendly.
            </p>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-2">What browsers are supported?</h3>
            <p className="text-sm text-gray-600">
              This tool works best in modern browsers like Chrome, Firefox, Edge, and Safari.
              For the best experience, make sure your browser is updated to the latest version.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <h3 className="font-semibold mb-2">Need More Help?</h3>
        <p className="text-sm">
          This is an open-source project. If you encounter any issues or have feature requests,
          please visit our GitHub repository to submit an issue or contribute to the project.
        </p>
      </div>
    </div>
  );
};

export default Help;