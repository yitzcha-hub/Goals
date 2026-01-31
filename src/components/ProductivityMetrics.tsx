import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';

interface ProductivityMetricsProps {
  tasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    points: number;
  }>;
}

export const ProductivityMetrics: React.FC<ProductivityMetricsProps> = ({ tasks }) => {
  const categoryData = [
    {
      category: 'High Priority',
      completed: tasks.filter(t => t.priority === 'high' && t.completed).length,
      total: tasks.filter(t => t.priority === 'high').length
    },
    {
      category: 'Medium Priority',
      completed: tasks.filter(t => t.priority === 'medium' && t.completed).length,
      total: tasks.filter(t => t.priority === 'medium').length
    },
    {
      category: 'Low Priority',
      completed: tasks.filter(t => t.priority === 'low' && t.completed).length,
      total: tasks.filter(t => t.priority === 'low').length
    }
  ];

  const chartConfig = {
    completed: { label: 'Completed', color: '#10b981' },
    remaining: { label: 'Remaining', color: '#e5e7eb' }
  };

  const data = categoryData.map(item => ({
    ...item,
    remaining: item.total - item.completed
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="completed" stackId="a" fill="#10b981" />
        <Bar dataKey="remaining" stackId="a" fill="#e5e7eb" />
      </BarChart>
    </ChartContainer>
  );
};