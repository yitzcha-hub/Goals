import React from 'react';

interface ProgressSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  color?: string;
}

export const ProgressSlider: React.FC<ProgressSliderProps> = ({ 
  value, 
  onChange, 
  label, 
  color = 'blue' 
}) => {
  const percentage = (value / 10) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-lg font-bold text-${color}-600`}>{value}/10</span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="0"
          max="10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-${color}`}
        />
        <div 
          className={`absolute top-0 left-0 h-2 bg-gradient-to-r from-${color}-400 to-${color}-600 rounded-lg transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>Not Started</span>
        <span>Complete</span>
      </div>
    </div>
  );
};