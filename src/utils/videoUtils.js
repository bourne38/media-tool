// Extract video metadata (duration, dimensions, etc.)
export const extractVideoMetadata = (videoFile) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const metadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        aspectRatio: video.videoWidth / video.videoHeight,
        name: videoFile.name,
        size: videoFile.size,
        type: videoFile.type
      };
      
      URL.revokeObjectURL(video.src);
      resolve(metadata);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = URL.createObjectURL(videoFile);
  });
};

// Format time in seconds to MM:SS or HH:MM:SS format
export const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds)) return '00:00';
  
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Parse time string (MM:SS or HH:MM:SS) to seconds
export const parseTimeToSeconds = (timeString) => {
  const parts = timeString.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  }
  
  return 0;
};

// Generate a thumbnail from a video at a specific time
export const generateThumbnail = (videoFile, timeInSeconds = 0) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    video.onloadedmetadata = () => {
      // Ensure the time is within the video duration
      const seekTime = Math.min(timeInSeconds, video.duration);
      
      video.currentTime = seekTime;
    };
    
    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(video.src);
        resolve(blob);
      }, 'image/jpeg', 0.7);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to generate thumbnail'));
    };
    
    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
};

// Calculate estimated processing time based on video duration and operation
export const estimateProcessingTime = (videoMetadata, operation) => {
  const { duration, width, height, size } = videoMetadata;
  const fileSizeMB = size / (1024 * 1024);
  const resolution = width * height;
  
  // Base processing factors (these are approximate and would need tuning)
  const factors = {
    convert: 0.5,  // Converting is relatively fast
    gif: 1.2,      // GIF creation is more intensive
    trim: 0.3,     // Trimming is mostly just copying data
    watermark: 0.7 // Watermarking requires rendering each frame
  };
  
  // Calculate a base time estimate in seconds
  let baseEstimate = (duration * factors[operation]) * (resolution / (1280 * 720));
  
  // Adjust for file size (larger files take longer to process)
  baseEstimate *= (1 + (fileSizeMB / 100));
  
  // Add a minimum processing time
  return Math.max(5, Math.round(baseEstimate));
};

// Check browser compatibility for required features
export const checkBrowserCompatibility = () => {
  const features = {
    webAssembly: typeof WebAssembly === 'object',
    sharedArrayBuffer: typeof SharedArrayBuffer === 'function',
    webWorkers: typeof Worker === 'function',
    fileReader: typeof FileReader === 'function',
    canvas: !!document.createElement('canvas').getContext,
    video: !!document.createElement('video').canPlayType
  };
  
  const missingFeatures = Object.entries(features)
    .filter(([_, supported]) => !supported)
    .map(([feature]) => feature);
  
  return {
    isCompatible: missingFeatures.length === 0,
    missingFeatures
  };
};