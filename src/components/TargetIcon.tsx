import React from 'react';

interface TargetIconProps {
  className?: string;
}

export const TargetIcon: React.FC<TargetIconProps> = ({ className = "h-8 w-8" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer ring - dark gray */}
      <circle cx="50" cy="50" r="48" stroke="#374151" strokeWidth="3" fill="white" />
      
      {/* Red ring */}
      <circle cx="50" cy="50" r="38" stroke="#dc2626" strokeWidth="8" fill="white" />
      
      {/* Middle ring - dark gray */}
      <circle cx="50" cy="50" r="26" stroke="#374151" strokeWidth="3" fill="white" />
      
      {/* Inner white circle */}
      <circle cx="50" cy="50" r="16" fill="white" />
      
      {/* Center red bullseye */}
      <circle cx="50" cy="50" r="6" fill="#dc2626" />

    </svg>
  );
};
