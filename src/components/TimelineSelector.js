import React, { useState, useEffect, useRef } from 'react';

const TimelineSelector = ({ 
  duration, 
  onStartTimeChange, 
  onEndTimeChange,
  initialStartTime = 0,
  initialEndTime = null,
  allowSinglePoint = false
}) => {
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime || duration);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [isDraggingRange, setIsDraggingRange] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [initialStartPos, setInitialStartPos] = useState(0);
  const [initialEndPos, setInitialEndPos] = useState(0);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (duration && initialEndTime === null) {
      setEndTime(duration);
    }
  }, [duration, initialEndTime]);

  useEffect(() => {
    if (onStartTimeChange) onStartTimeChange(startTime);
  }, [startTime, onStartTimeChange]);

  useEffect(() => {
    if (onEndTimeChange) onEndTimeChange(endTime);
  }, [endTime, onEndTimeChange]);

  const handleMouseDown = (e, type) => {
    e.preventDefault();
    const rect = timelineRef.current.getBoundingClientRect();
    
    if (type === 'start') {
      setIsDraggingStart(true);
    } else if (type === 'end') {
      setIsDraggingEnd(true);
    } else if (type === 'range') {
      setIsDraggingRange(true);
      setDragStartX(e.clientX);
      setInitialStartPos(startTime);
      setInitialEndPos(endTime);
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    const rect = timelineRef.current.getBoundingClientRect();
    const width = rect.width;
    const offsetX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, offsetX / width));
    const newTime = percentage * duration;
    
    if (isDraggingStart) {
      const newStartTime = Math.min(newTime, endTime - (allowSinglePoint ? 0 : 0.1));
      setStartTime(newStartTime);
    } else if (isDraggingEnd) {
      const newEndTime = Math.max(newTime, startTime + (allowSinglePoint ? 0 : 0.1));
      setEndTime(newEndTime);
    } else if (isDraggingRange) {
      const deltaX = e.clientX - dragStartX;
      const deltaPercentage = deltaX / width;
      const deltaTime = deltaPercentage * duration;
      
      let newStartTime = initialStartPos + deltaTime;
      let newEndTime = initialEndPos + deltaTime;
      
      // Ensure the range stays within bounds
      if (newStartTime < 0) {
        const shift = -newStartTime;
        newStartTime = 0;
        newEndTime = Math.min(initialEndPos + deltaTime + shift, duration);
      } else if (newEndTime > duration) {
        const shift = newEndTime - duration;
        newEndTime = duration;
        newStartTime = Math.max(initialStartPos + deltaTime - shift, 0);
      }
      
      setStartTime(newStartTime);
      setEndTime(newEndTime);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingStart(false);
    setIsDraggingEnd(false);
    setIsDraggingRange(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${milliseconds < 10 ? '0' : ''}${milliseconds}`;
  };

  const startPercentage = (startTime / duration) * 100;
  const endPercentage = (endTime / duration) * 100;

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{formatTime(startTime)}</span>
        <span>{formatTime(endTime)}</span>
      </div>
      
      <div 
        ref={timelineRef}
        className="relative h-8 bg-gray-200 rounded-md cursor-pointer"
        aria-label="Video timeline selector"
      >
        {/* Timeline markers */}
        <div className="absolute top-0 left-0 w-full h-full flex">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i} 
              className="flex-1 border-l border-gray-400 h-2 mt-3"
              style={{ marginLeft: i === 0 ? '0' : 'auto' }}
            />
          ))}
        </div>
        
        {/* Selected range */}
        <div 
          className="absolute top-0 h-full bg-blue-200 opacity-70"
          style={{ 
            left: `${startPercentage}%`, 
            width: `${endPercentage - startPercentage}%` 
          }}
          onMouseDown={(e) => handleMouseDown(e, 'range')}
        />
        
        {/* Start handle */}
        <div 
          className="absolute top-0 w-4 h-full bg-blue-600 rounded-l-md cursor-ew-resize"
          style={{ left: `calc(${startPercentage}% - 4px)` }}
          onMouseDown={(e) => handleMouseDown(e, 'start')}
          aria-label="Start time handle"
          tabIndex="0"
          role="slider"
          aria-valuemin="0"
          aria-valuemax={duration}
          aria-valuenow={startTime}
        />
        
        {/* End handle */}
        <div 
          className="absolute top-0 w-4 h-full bg-blue-600 rounded-r-md cursor-ew-resize"
          style={{ left: `${endPercentage}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'end')}
          aria-label="End time handle"
          tabIndex="0"
          role="slider"
          aria-valuemin="0"
          aria-valuemax={duration}
          aria-valuenow={endTime}
        />
      </div>
      
      <div className="flex justify-between mt-4">
        <div>
          <label htmlFor="start-time" className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            id="start-time"
            type="number"
            min="0"
            max={endTime - (allowSinglePoint ? 0 : 0.1)}
            step="0.1"
            value={startTime.toFixed(1)}
            onChange={(e) => setStartTime(parseFloat(e.target.value))}
            className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="end-time" className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            id="end-time"
            type="number"
            min={startTime + (allowSinglePoint ? 0 : 0.1)}
            max={duration}
            step="0.1"
            value={endTime.toFixed(1)}
            onChange={(e) => setEndTime(parseFloat(e.target.value))}
            className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default TimelineSelector;