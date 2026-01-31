import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  description?: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  change,
  icon,
  description
}) => {
  const isPositive = change && change > 0;
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {value}
        </div>
        {change !== undefined && (
          <div className={`text-xs flex items-center ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className="mr-1">
              {isPositive ? '↗' : '↘'}
            </span>
            {Math.abs(change)}% from last week
          </div>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};