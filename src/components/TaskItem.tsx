import React from 'react';

interface TaskItemProps {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  points: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isDemo?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  id,
  title,
  completed,
  priority,
  points,
  onToggle,
  onDelete
}) => {
  const getPriorityColor = (p: string) => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'red'
    };
    return colors[p as keyof typeof colors];
  };

  const color = getPriorityColor(priority);

  return (
    <div className={`flex items-center gap-3 p-4 bg-white rounded-lg border-l-4 border-${color}-400 shadow-sm hover:shadow-md transition-all duration-200 ${completed ? 'opacity-75' : ''}`}>
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(id)}
        className={`w-5 h-5 text-${color}-500 rounded focus:ring-${color}-400`}
      />
      
      <div className="flex-1">
        <span className={`text-gray-800 ${completed ? 'line-through' : ''}`}>
          {title}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 text-xs font-medium bg-${color}-100 text-${color}-800 rounded-full`}>
          {priority}
        </span>
        <span className="text-sm font-semibold text-blue-600">
          +{points}pts
        </span>
        <button
          onClick={() => onDelete(id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};