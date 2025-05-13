import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export const downloadFile = (data, fileName) => {
  const blob = new Blob([data]);
  saveAs(blob, fileName);
};

export const downloadFilesAsZip = async (files) => {
  const zip = new JSZip();
  
  files.forEach(file => {
    zip.file(file.name, file.data);
  });
  
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'processed_videos.zip');
};

/**
 * Format seconds into a human-readable time string
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (HH:MM:SS)
 */
export const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '00:00:00';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * Create a thumbnail from a video file
 * @param {File} videoFile - The video file
 * @returns {Promise<string>} - Promise resolving to thumbnail URL
 */
export const createVideoThumbnail = (videoFile) => {
  return new Promise((resolve, reject) => {
    const videoElement = document.createElement('video');
    videoElement.src = URL.createObjectURL(videoFile);
    videoElement.muted = true;
    videoElement.preload = 'metadata';
    
    videoElement.onloadeddata = () => {
      // Seek to 25% of the video
      videoElement.currentTime = videoElement.duration * 0.25;
    };
    
    videoElement.onseeked = () => {
      // Create canvas and draw video frame
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const thumbnailUrl = canvas.toDataURL('image/jpeg');
      
      // Clean up
      URL.revokeObjectURL(videoElement.src);
      
      resolve(thumbnailUrl);
    };
    
    videoElement.onerror = () => {
      URL.revokeObjectURL(videoElement.src);
      reject(new Error('Failed to generate thumbnail'));
    };
  });
};

/**
 * Formats a file size in bytes to a human-readable string
 * @param {number} bytes - The file size in bytes
 * @returns {string} - The formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else return (bytes / 1048576).toFixed(2) + ' MB';
};

export const getVideoDuration = (videoFile) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.src = URL.createObjectURL(videoFile);
  });
};