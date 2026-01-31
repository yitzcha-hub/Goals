import React from 'react';

interface RecommendationCardProps {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedTime: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  description,
  priority,
  category,
  estimatedTime,
  onAccept,
  onDismiss
}) => {
  const getPriorityStyles = (p: string) => {
    const styles = {
      high: 'border-red-400 bg-red-50',
      medium: 'border-yellow-400 bg-yellow-50',
      low: 'border-green-400 bg-green-50'
    };
    return styles[p as keyof typeof styles];
  };

  const getPriorityIcon = (p: string) => {
    const icons = {
      high: '🔥',
      medium: '⚡',
      low: '💡'
    };
    return icons[p as keyof typeof icons];
  };

  return (
    <div className={`p-4 rounded-lg border-l-4 ${getPriorityStyles(priority)} shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getPriorityIcon(priority)}</span>
          <h4 className="font-semibold text-gray-800">{title}</h4>
        </div>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {category}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          ⏱️ {estimatedTime}
        </span>
        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={onAccept}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add to Goals
          </button>
        </div>
      </div>
    </div>
  );
};