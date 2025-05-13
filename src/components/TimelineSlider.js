import React, { useState, useRef, useEffect } from 'react';

const TimelineSlider = ({ 
  duration, 
  startTime = 0, 
  segmentDuration = 5,
  onChange 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'start', 'end', or 'segment'
  const [currentStart, setCurrentStart] = useState(startTime);
  const [currentDuration, setCurrentDuration] = useState(segmentDuration);
  const sliderRef = useRef(null);
  
  useEffect(() => {
    setCurrentStart(startTime);
    setCurrentDuration(segmentDuration);
  }, [startTime, segmentDuration]);
  
  const handleMouseDown = (e, type) => {
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const timePosition = Math.max(0, Math.min(position * duration, duration));
    
    if (dragType === 'start') {
      const newStart = Math.min(timePosition, currentStart + currentDuration - 0.5);
      const newDuration = currentStart + currentDuration - newStart;
      setCurrentStart(newStart);
      setCurrentDuration(newDuration);
      if (onChange) onChange(newStart, newDuration);
    } else if (dragType === 'end') {
      const newDuration = Math.max(0.5, Math.min(timePosition - currentStart, duration - currentStart));
      setCurrentDuration(newDuration);
      if (onChange) onChange(currentStart, newDuration);
    } else if (dragType === 'segment') {
      const delta = ((e.clientX - rect.left) / rect.width * duration) - 
                   ((e.clientX - e.movementX - rect.left) / rect.width * duration);
      
      let newStart = currentStart + delta;
      
      // Keep segment within bounds
      if (newStart < 0) {
        newStart = 0;
      } else if (newStart + currentDuration > duration) {
        newStart = duration - currentDuration;
      }
      
      setCurrentStart(newStart);
      if (onChange) onChange(newStart, currentDuration);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const startPercent = (currentStart / duration) * 100;
  const durationPercent = (currentDuration / duration) * 100;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{formatTime(currentStart)}</span>
        <span>{formatTime(currentStart + currentDuration)}</span>
      </div>
      
      <div 
        ref={sliderRef}
        className="relative h-8 bg-gray-200 rounded-md"
      >
        {/* Timeline markers */}
        <div className="absolute top-0 left-0 w-full h-full flex">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i} 
              className="flex-1 border-l border-gray-400 h-2 mt-3"
            />
          ))}
        </div>
        
        {/* Selected segment */}
        <div 
          className="absolute top-0 h-full bg-blue-200"
          style={{ 
            left: `${startPercent}%`, 
            width: `${durationPercent}%` 
          }}
          onMouseDown={(e) => handleMouseDown(e, 'segment')}
        />
        
        {/* Start handle */}
        <div 
          className="absolute top-0 w-3 h-full bg-blue-500 cursor-ew-resize"
          style={{ left: `${startPercent}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'start')}
        />
        
        {/* End handle */}
        <div 
          className="absolute top-0 w-3 h-full bg-blue-500 cursor-ew-resize"
          style={{ left: `${startPercent + durationPercent}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'end')}
        />
      </div>
    </div>
  );
};

export default TimelineSlider;