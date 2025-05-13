import React from 'react';
import { FiClock, FiCheck, FiDownload, FiTrash2, FiX } from 'react-icons/fi';
import { useProcessing } from '../context/ProcessingContext';
import ProgressBar from '../components/ProgressBar';

const Queue = () => {
  const { 
    processingQueue, 
    processedFiles,
    processingProgress,
    removeProcessedFile,
    clearProcessedFiles
  } = useProcessing();
  
  const handleDownload = (url, fileName) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const getTaskTypeLabel = (type) => {
    switch (type) {
      case 'convert': return 'Convert to MP4';
      case 'trimVideo': return 'Trim Video';
      case 'watermarkVideo': return 'Add Watermark';
      case 'createGif': return 'Create GIF';
      default: return 'Process Video';
    }
  };
  
  const getFileTypeIcon = (mimeType) => {
    if (mimeType.includes('video')) {
      return '🎬';
    } else if (mimeType.includes('image')) {
      return '🖼️';
    } else {
      return '📄';
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Processing Queue</h1>
      
      {processingQueue.length === 0 && processedFiles.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FiClock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No tasks in queue</h3>
          <p className="mt-1 text-gray-500">
            Start processing videos from the Convert, GIF, Trim, or Watermark pages.
          </p>
        </div>
      ) : (
        <div>
          {processingQueue.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FiClock className="mr-2" /> Pending Tasks ({processingQueue.length})
              </h2>
              
              <div className="space-y-4">
                {processingQueue.map((task, index) => (
                  <div 
                    key={index}
                    className={`border rounded-lg p-4 ${index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">
                          {getTaskTypeLabel(task.type)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {task.data.inputFile.name} {index === 0 ? '(Processing...)' : '(Queued)'}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {index === 0 ? 'Current' : `#${index + 1} in queue`}
                      </div>
                    </div>
                    
                    {index === 0 && (
                      <div className="mt-2">
                        <ProgressBar progress={processingProgress} />
                        <p className="text-xs text-center mt-1">{processingProgress}% complete</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {processedFiles.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <FiCheck className="mr-2" /> Completed Files
                </h2>
                
                <button
                  type="button"
                  onClick={clearProcessedFiles}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                >
                  <FiTrash2 className="mr-1" />
                  Clear All
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {processedFiles.map((file) => (
                  <div 
                    key={file.id} 
                    className="p-4 bg-white border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getFileTypeIcon(file.type)}</span>
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-gray-500">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDownload(file.url, file.name)}
                          className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          aria-label="Download file"
                        >
                          <FiDownload className="h-5 w-5" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => removeProcessedFile(file.id)}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          aria-label="Remove file"
                        >
                          <FiX className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">About the Processing Queue</h3>
        <p className="text-sm">
          The processing queue handles all your video tasks one at a time. Completed files remain available 
          for download until you clear them or close your browser. All processing happens locally on your device,
          so large files may take longer to process.
        </p>
      </div>
    </div>
  );
};

export default Queue;