import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CategoryData {
  category: string;
  count: number;
  color: string;
}

interface CategoryDistributionChartProps {
  data: CategoryData[];
}

export const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  let currentAngle = 0;

  const createArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(100, 100, radius, endAngle);
    const end = polarToCartesian(100, 100, radius, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
    return `M 100 100 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
  };

  const polarToCartesian = (cx: number, cy: number, radius: number, angle: number) => {
    const rad = (angle - 90) * Math.PI / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goals by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {data.map((item, index) => {
              const percentage = (item.count / total) * 100;
              const angle = (percentage / 100) * 360;
              const path = createArc(currentAngle, currentAngle + angle, 80);
              currentAngle += angle;
              return <path key={index} d={path} fill={item.color} />;
            })}
            <circle cx="100" cy="100" r="50" fill="white" />
            <text x="100" y="100" textAnchor="middle" dy=".3em" className="text-2xl font-bold">{total}</text>
            <text x="100" y="120" textAnchor="middle" className="text-xs fill-gray-600">Total Goals</text>
          </svg>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-sm">{item.category}: {item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
