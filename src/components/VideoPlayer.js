import React, { useRef, useState, useEffect } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX } from 'react-icons/fi';

const VideoPlayer = ({ src, poster, onTimeUpdate, onDurationChange, controls = true }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onTimeUpdate) onTimeUpdate(video.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(video.duration);
      if (onDurationChange) onDurationChange(video.duration);
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onTimeUpdate, onDurationChange]);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-auto"
        onClick={togglePlay}
        onKeyDown={(e) => e.key === ' ' && togglePlay()}
        tabIndex="0"
        aria-label="Video player"
      />
      
      {controls && (
        <div className="bg-gray-900 text-white p-2">
          <div className="flex items-center mb-2">
            <button
              onClick={togglePlay}
              className="mr-2 p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FiPause /> : <FiPlay />}
            </button>
            
            <div className="flex-1 mx-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                aria-label="Seek video timeline"
              />
            </div>
            
            <div className="text-sm mr-2 whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            
            <button
              onClick={toggleMute}
              className="p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <FiVolumeX /> : <FiVolume2 />}
            </button>
            
            <div className="w-20 ml-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                aria-label="Volume control"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;