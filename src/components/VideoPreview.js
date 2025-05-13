import React, { useRef, useState, useEffect } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX } from 'react-icons/fi';

const VideoPreview = ({ src, currentTime, onTimeUpdate }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
      };
      
      const handleTimeUpdate = () => {
        setCurrentProgress(video.currentTime);
        if (onTimeUpdate) {
          onTimeUpdate(video.currentTime);
        }
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [onTimeUpdate]);
  
  useEffect(() => {
    if (videoRef.current && currentTime !== undefined) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);
  
  const togglePlay = () => {
    const video = videoRef.current;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };
  
  const handleSeek = (e) => {
    const video = videoRef.current;
    const seekTime = (e.nativeEvent.offsetX / e.target.clientWidth) * duration;
    video.currentTime = seekTime;
    setCurrentProgress(seekTime);
    
    if (onTimeUpdate) {
      onTimeUpdate(seekTime);
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto"
        muted={isMuted}
        playsInline
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div 
          className="h-1 bg-gray-600 rounded-full mb-2 cursor-pointer"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${(currentProgress / duration) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FiPause /> : <FiPlay />}
            </button>
            
            <button 
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <FiVolumeX /> : <FiVolume2 />}
            </button>
          </div>
          
          <div className="text-white text-sm">
            {formatTime(currentProgress)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;