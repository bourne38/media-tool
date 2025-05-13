import React from 'react';

const ProgressBar = ({ progress, height = 8, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };
  
  const bgColorClass = colorClasses[color] || colorClasses.blue;
  
  return (
    <div 
      className="w-full bg-gray-200 rounded-full overflow-hidden"
      style={{ height: `${height}px` }}
    >
      <div 
        className={`h-full ${bgColorClass} transition-all duration-300 ease-in-out`}
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>
  );
};

export default ProgressBar;