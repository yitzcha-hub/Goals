import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface AchievementBadgeProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  description,
  icon,
  earned,
  progress = 0,
  maxProgress = 1,
  category,
  rarity
}) => {
  const rarityColors = {
    common: 'bg-gray-100 border-gray-300',
    rare: 'bg-blue-100 border-blue-300',
    epic: 'bg-purple-100 border-purple-300',
    legendary: 'bg-yellow-100 border-yellow-300'
  };

  const progressPercent = (progress / maxProgress) * 100;

  return (
    <Card className={`p-4 transition-all duration-200 ${
      earned 
        ? `${rarityColors[rarity]} shadow-lg transform hover:scale-105` 
        : 'bg-gray-50 border-gray-200 opacity-75'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          earned ? 'bg-white shadow-md' : 'bg-gray-200'
        }`}>
          <img 
            src={icon} 
            alt={title}
            className={`w-8 h-8 ${earned ? '' : 'grayscale opacity-50'}`}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${earned ? 'text-gray-900' : 'text-gray-500'}`}>
              {title}
            </h3>
            <Badge variant={earned ? 'default' : 'secondary'} className="text-xs">
              {rarity}
            </Badge>
          </div>
          <p className={`text-sm ${earned ? 'text-gray-600' : 'text-gray-400'}`}>
            {description}
          </p>
          {!earned && maxProgress > 1 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{progress}/{maxProgress}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AchievementBadge;